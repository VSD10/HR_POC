import logging
import re
from pathlib import Path
from typing import Optional, List, Tuple
from openai import APIError, AuthenticationError, RateLimitError
from pypdf import PdfReader
from langchain_core.messages import HumanMessage, AIMessage

from backend.config import settings, ConfigurationError
from backend.models import ChatRequest, ChatResponse, ChatMessage, SourceItem
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

POLICY_KEYWORDS = {
    'policy', 'policies', 'leave', 'vacation', 'holiday', 'pto', 'sick', 'maternity', 'paternity',
    'parental', 'bereavement', 'travel', 'flight', 'hotel', 'expense', 'reimbursement', 'per diem',
    'meal', 'mileage', 'remote', 'wfh', 'work from home', 'hybrid', 'working hours', 'core hours',
    'security', 'password', 'mfa', 'vpn', 'laptop', 'device', '401k', 'benefit', 'benefits',
    'insurance', 'health', 'dental', 'vision', 'salary', 'bonus', 'handbook', 'conduct', 'harassment',
    'whistleblower', 'probation', 'notice', 'termination', 'overtime', 'sabbatical', 'allowance',
    'rule', 'rules', 'guideline', 'guidelines', 'standard', 'standards', 'code', 'days', 'limit', 'limits',
    'carryover', 'carry', 'forward', 'expire', 'accrue', 'accrual'
}

CONVERSATIONAL_PATTERNS = [
    r"^(hi|hello|hey|howdy|hola|greetings)(\s+(there|assistant|bot|friend|team))?[\s!.,?]*$",
    r"^good\s+(morning|afternoon|evening|day|night)[\s!.,?]*$",
    r"^(how\s+are\s+you|how\'s\s+it\s+going|how\s+do\s+you\s+do|how\s+are\s+things|what\'s\s+up|sup)[\s!.,?]*$",
    r"^(who\s+are\s+you|what\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do|help|what\s+are\s+your\s+capabilities)[\s!.,?]*$",
    r"^(thanks|thank\s+you|thank\s+you\s+very\s+much|thanks\s+a\s+lot|thx|cheers|appreciate\s+it)[\s!.,?]*$",
    r"^(bye|goodbye|see\s+you|cya|have\s+a\s+good\s+day|have\s+a\s+nice\s+day)[\s!.,?]*$",
    r"^(ok|okay|cool|got\s+it|understood|awesome|great|perfect|sure|yes|no|yep|nope)[\s!.,?]*$",
]


def is_pure_conversational(text: str) -> bool:
    """Determines whether an input is a conversational greeting/pleasantry without policy queries."""
    cleaned = text.strip().lower()
    for pat in CONVERSATIONAL_PATTERNS:
        if re.match(pat, cleaned):
            return True

    words = set(re.findall(r'\b[a-z0-9_-]+\b', cleaned))
    if not words.intersection(POLICY_KEYWORDS):
        if len(cleaned) < 60 and any(
            greet in cleaned
            for greet in ['hello', 'hi', 'hey', 'thank', 'thanks', 'bye', 'help', 'who are you', 'how are you', 'good morning', 'good afternoon']
        ):
            return True
    return False


class ChatServiceError(Exception):
    """General domain error for ChatService operations."""
    pass


class ChatService:
    """Service handling multi-turn conversation and grounded policy retrieval."""

    def __init__(self, top_k: Optional[int] = None):
        self.top_k = top_k or settings.TOP_K

    def answer_question(self, request: ChatRequest) -> ChatResponse:
        """
        Executes the conversational RAG pipeline for a given user question:
        1. If Azure OpenAI & ChromaDB vector store are configured, runs Azure LLM RAG with multi-turn history.
        2. Otherwise, executes grounded local PDF retrieval over knowledge_base/ with friendly fallback.
        """
        question = request.question.strip()
        logger.info(f"Processing question: '{question[:80]}...' (History depth: {len(request.history)})")

        # Check if full Azure OpenAI pipeline is ready
        if settings.is_azure_configured() and is_vector_store_populated():
            try:
                return self._answer_via_azure(question, request.history)
            except (AuthenticationError, APIError, RateLimitError, ConfigurationError, VectorStoreNotFoundError, ChatServiceError, Exception) as e:
                logger.warning(f"Azure OpenAI pipeline encountered error ({e}), failing over to grounded local PDF retrieval.")
                return self._answer_from_local_kb(question)

        # Fallback to local PDF knowledge base
        return self._answer_from_local_kb(question)

    def _build_langchain_history(self, history: List[ChatMessage]) -> list:
        """Converts incoming history messages into LangChain Human/AIMessage objects."""
        lc_messages = []
        for item in history[-8:]:  # Keep recent turns for concise, relevant context
            role = item.role.lower().strip()
            content = item.content.strip()
            if not content:
                continue
            if role in ("user", "human"):
                lc_messages.append(HumanMessage(content=content))
            elif role in ("assistant", "ai", "bot"):
                lc_messages.append(AIMessage(content=content))
        return lc_messages

    def _answer_via_azure(self, question: str, history: List[ChatMessage]) -> ChatResponse:
        history_messages = self._build_langchain_history(history)
        pure_chat = is_pure_conversational(question)

        # 1. Retrieve relevant policy chunks (if not pure conversational greeting)
        retrieved_docs = []
        sources: List[SourceItem] = []
        formatted_context = "No specific policy documents needed for general pleasantries or conversation."

        if not pure_chat:
            try:
                # Build enhanced search query if question is a follow-up with pronouns
                search_query = question
                if history:
                    last_user_msg = next(
                        (m.content for m in reversed(history) if m.role.lower() in ("user", "human")),
                        None
                    )
                    words_in_q = set(re.findall(r'\b[a-zA-Z0-9_-]+\b', question.lower()))
                    if words_in_q.intersection({'it', 'they', 'them', 'that', 'this', 'those', 'carry', 'forward', 'more', 'details'}) and last_user_msg:
                        search_query = f"{last_user_msg} {question}"

                retriever = get_retriever(top_k=self.top_k)
                retrieved_docs = retriever.invoke(search_query)
            except (ConfigurationError, VectorStoreNotFoundError):
                raise
            except (AuthenticationError, APIError) as api_err:
                logger.error(f"Azure OpenAI embedding error during retrieval: {api_err}")
                raise ChatServiceError(f"Azure OpenAI embedding error during retrieval: {str(api_err)}")
            except Exception as e:
                logger.error(f"Vector store retrieval failed: {e}")
                raise ChatServiceError(f"Failed to retrieve policy documents: {str(e)}")

            if retrieved_docs:
                sources = extract_deduplicated_sources(retrieved_docs)
                formatted_context = format_context_documents(retrieved_docs)
            else:
                formatted_context = "No matching policy documents were found in the knowledge base."

        # 2. Query Azure OpenAI with prompt, context, history, and user question
        try:
            llm = get_azure_chat_llm()
            prompt = build_rag_prompt()
            messages = prompt.format_messages(
                context=formatted_context,
                history=history_messages,
                question=question,
            )
            response = llm.invoke(messages)
            answer = response.content if hasattr(response, "content") else str(response)

            if isinstance(answer, list):
                answer = "".join(str(part) for part in answer)

            cleaned_answer = answer.strip()

            # Clean sources if pure conversational or if information was not found
            if pure_chat or "could not find information regarding that in the company policy knowledge base" in cleaned_answer.lower():
                sources = []

            return ChatResponse(answer=cleaned_answer, sources=sources)

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
        Grounded local retrieval directly from PDF files in knowledge_base/ with conversational handling.
        """
        # Friendly local handling for greetings and pleasantries
        if is_pure_conversational(question):
            return ChatResponse(
                answer=(
                    "Hello! I am your Company Policy and HR Assistant. "
                    "You can ask me questions about annual leave, remote work guidelines, "
                    "travel per diems, expense reimbursements, security standards, and other corporate policies. "
                    "How can I help you today?"
                ),
                sources=[],
            )

        kb_dir = settings.KNOWLEDGE_BASE_DIR
        if not kb_dir.exists():
            return ChatResponse(
                answer="I could not find information regarding that in the company policy knowledge base. Please contact HR.",
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
                answer="I could not find information regarding that in the company policy knowledge base. Please reach out to HR for guidance.",
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
