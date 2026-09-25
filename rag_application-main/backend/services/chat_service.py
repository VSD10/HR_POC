import logging
import re
from pathlib import Path
from typing import Optional, List, Tuple
from openai import APIError, AuthenticationError, RateLimitError
from pypdf import PdfReader

from backend.config import settings, ConfigurationError
from backend.models import ChatRequest, ChatResponse, SourceItem
from backend.rag.chain import (
    build_rag_prompt,
    extract_deduplicated_sources,
    format_context_documents,
    get_azure_chat_llm,
)
from backend.rag.retriever import get_retriever
from backend.rag.vector_store import VectorStoreNotFoundError, is_vector_store_populated

logger = logging.getLogger(__name__)

STOPWORDS = {
    'what', 'is', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'do',
    'does', 'how', 'many', 'much', 'can', 'i', 'we', 'are', 'and', 'my',
    'me', 'our', 'with', 'about', 'from', 'at', 'by', 'as', 'or', 'be'
}


class ChatServiceError(Exception):
    """General domain error for ChatService operations."""
    pass


class ChatService:
    """Service handling retrieval and grounded response generation."""

    def __init__(self, top_k: Optional[int] = None):
        self.top_k = top_k or settings.TOP_K

    def answer_question(self, request: ChatRequest) -> ChatResponse:
        """
        Executes the RAG pipeline for a given user question:
        1. If Azure OpenAI & ChromaDB vector store are configured, runs Azure LLM RAG.
        2. Otherwise, executes grounded local PDF retrieval over knowledge_base/.
        """
        question = request.question.strip()
        logger.info(f"Processing question: '{question[:80]}...'")

        # Check if full Azure OpenAI pipeline is ready
        if settings.is_azure_configured() and is_vector_store_populated():
            try:
                return self._answer_via_azure(question)
            except (AuthenticationError, APIError, RateLimitError, ConfigurationError, VectorStoreNotFoundError) as e:
                logger.warning(f"Azure OpenAI pipeline encountered error ({e}), failing over to grounded local PDF retrieval.")
                return self._answer_from_local_kb(question)
        
        # Fallback to local PDF knowledge base
        return self._answer_from_local_kb(question)

    def _answer_via_azure(self, question: str) -> ChatResponse:
        # 1. Retrieve relevant policy chunks
        try:
            retriever = get_retriever(top_k=self.top_k)
            retrieved_docs = retriever.invoke(question)
        except (ConfigurationError, VectorStoreNotFoundError):
            raise
        except (AuthenticationError, APIError) as api_err:
            logger.error(f"Azure OpenAI embedding error during retrieval: {api_err}")
            raise ChatServiceError(f"Azure OpenAI embedding error during retrieval: {str(api_err)}")
        except Exception as e:
            logger.error(f"Vector store retrieval failed: {e}")
            raise ChatServiceError(f"Failed to retrieve policy documents: {str(e)}")

        if not retrieved_docs:
            logger.warning("No documents retrieved for question.")
            return ChatResponse(
                answer="I could not find information regarding that in the company policy knowledge base.",
                sources=[],
            )

        # 2. Extract sources and format context
        sources = extract_deduplicated_sources(retrieved_docs)
        formatted_context = format_context_documents(retrieved_docs)

        # 3. Query Azure OpenAI
        try:
            llm = get_azure_chat_llm()
            prompt = build_rag_prompt()
            messages = prompt.format_messages(
                context=formatted_context,
                question=question,
            )
            response = llm.invoke(messages)
            answer = response.content if hasattr(response, "content") else str(response)

            if isinstance(answer, list):
                answer = "".join(str(part) for part in answer)

            return ChatResponse(answer=answer.strip(), sources=sources)

        except (ConfigurationError, VectorStoreNotFoundError):
            raise
        except AuthenticationError as auth_err:
            logger.error("Azure OpenAI authentication failed. Check API key and endpoint.")
            raise ChatServiceError(
                "Authentication failed with Azure OpenAI. Please verify AZURE_OPENAI_API_KEY."
            )
        except RateLimitError as rate_err:
            logger.error(f"Azure OpenAI rate limit hit: {rate_err}")
            raise ChatServiceError(
                "Azure OpenAI rate limit exceeded. Please try again shortly."
            )
        except APIError as api_err:
            logger.error(f"Azure OpenAI API error: {api_err}")
            raise ChatServiceError(
                f"Azure OpenAI service error: {api_err.message if hasattr(api_err, 'message') else 'Request failed'}"
            )
        except Exception as gen_err:
            logger.error(f"Unexpected error during LLM generation: {gen_err}", exc_info=True)
            raise ChatServiceError(
                "An unexpected error occurred while generating the policy answer. Please contact support."
            )

    def _answer_from_local_kb(self, question: str) -> ChatResponse:
        """
        Grounded local retrieval directly from PDF files in knowledge_base/.
        """
        kb_dir = settings.KNOWLEDGE_BASE_DIR
        if not kb_dir.exists():
            return ChatResponse(
                answer="I could not find information regarding that in the company policy knowledge base.",
                sources=[],
            )

        words = [
            w.lower() for w in re.findall(r'\b[a-zA-Z0-9_-]+\b', question)
            if w.lower() not in STOPWORDS and len(w) > 2
        ]

        if not words:
            words = [w.lower() for w in re.findall(r'\b[a-zA-Z0-9_-]+\b', question)]

        matches: List[Tuple[float, str, int, str]] = []

        for pdf_file in sorted(kb_dir.glob("*.pdf")):
            try:
                reader = PdfReader(str(pdf_file))
                for page_idx, page in enumerate(reader.pages):
                    raw_text = page.extract_text() or ""
                    clean_text = " ".join(raw_text.split())
                    lower_text = clean_text.lower()

                    score = sum(lower_text.count(w) * (2 if len(w) > 4 else 1) for w in words)
                    if score > 0:
                        matches.append((score, pdf_file.name, page_idx + 1, clean_text))
            except Exception as e:
                logger.warning(f"Failed to read PDF {pdf_file.name}: {e}")

        if not matches:
            return ChatResponse(
                answer="I could not find information regarding that in the company policy knowledge base.",
                sources=[],
            )

        matches.sort(key=lambda x: x[0], reverse=True)
        top_matches = matches[:3]

        # Extract deduplicated sources
        sources: List[SourceItem] = []
        seen = set()
        for score, doc_name, page_num, _ in top_matches:
            key = (doc_name, page_num)
            if key not in seen:
                seen.add(key)
                sources.append(SourceItem(document=doc_name, page=page_num))

        best_score, best_doc, best_page, best_text = top_matches[0]

        # Extract most relevant sentences from best matching excerpt
        sentences = re.split(r'(?<=[.!?])\s+', best_text)
        relevant_sentences = []
        for s in sentences:
            s_lower = s.lower()
            if any(w in s_lower for w in words):
                relevant_sentences.append(s)

        if relevant_sentences:
            extracted_core = " ".join(relevant_sentences[:4])
        else:
            extracted_core = best_text[:350]

        doc_title = best_doc.replace('_', ' ').replace('.pdf', '').title()
        answer = f"According to the {doc_title} (Page {best_page}):\n\n{extracted_core}"

        return ChatResponse(answer=answer, sources=sources)
