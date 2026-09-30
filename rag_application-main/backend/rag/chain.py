import logging
from typing import List, Tuple
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import AzureChatOpenAI

from backend.config import settings
from backend.models import SourceItem

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a professional, friendly, and knowledgeable Company Policy and HR Assistant.

You serve two complementary roles:
1. NATURAL CONVERSATION & ASSISTANCE:
   - For greetings, pleasantries, introductions, gratitude, small talk, questions about who you are, or what you can do: respond warmly, naturally, and helpfully.
   - Maintain a courteous, professional demeanor. Offer to help with company policies, benefits, leave, travel, expenses, remote work, or general HR inquiries.
   - Do NOT say "I could not find information regarding that in the company policy knowledge base" for greetings, social interactions, pleasantries, or general conversational questions.

2. GROUNDED POLICY RETRIEVAL (RAG):
   - When the user asks about company policies, rules, benefits, procedures, or workplace requirements:
     * Base your answer strictly and accurately on the provided Policy Context excerpts below.
     * If the context provides the answer, state all relevant terms, conditions, waiting periods, limits, and approvals accurately.
     * When citing rules, reference the source document and page number whenever available from the context.
     * If the user asks a specific question about a company policy or guideline and the provided Policy Context does NOT contain information about it, clearly and politely state:
       "I could not find information regarding that in the company policy knowledge base. Please reach out to your HR department for guidance on this topic."
     * Do NOT fabricate, extrapolate, or invent company policies that are not stated in the context.

3. CONVERSATIONAL CONTEXT:
   - Use the ongoing conversation history to understand follow-up questions, pronouns (e.g., 'it', 'they', 'those limits'), and clarifications naturally while adhering strictly to policy facts.

Policy Context:
{context}"""

USER_PROMPT = """{question}"""


def get_azure_chat_llm() -> AzureChatOpenAI:
    """
    Instantiates and returns the AzureChatOpenAI model client
    using verified Azure OpenAI credentials from settings.
    """
    settings.validate_azure_chat_config()

    return AzureChatOpenAI(
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_key=settings.AZURE_OPENAI_API_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
        azure_deployment=settings.AZURE_OPENAI_DEPLOYMENT,
        max_tokens=4096,
        temperature=0.1,
    )


def format_context_documents(docs: List[Document]) -> str:
    """
    Formats retrieved document chunks into a structured context string
    with clearly identifiable document titles, filenames, and page numbers.
    """
    if not docs:
        return "No relevant policy documents were retrieved."

    formatted_pieces = []
    for idx, doc in enumerate(docs, start=1):
        source = doc.metadata.get("source", "Unknown Document")
        page = doc.metadata.get("page", "N/A")
        formatted_pieces.append(
            f"--- Policy Excerpt {idx} [Document: {source} | Page: {page}] ---\n"
            f"{doc.page_content.strip()}"
        )

    return "\n\n".join(formatted_pieces)


def extract_deduplicated_sources(docs: List[Document]) -> List[SourceItem]:
    """
    Extracts and deduplicates source references from retrieved chunks,
    preserving document name and page number.
    """
    seen = set()
    sources: List[SourceItem] = []

    for doc in docs:
        source_name = doc.metadata.get("source", "Unknown Document")
        try:
            page_num = int(doc.metadata.get("page", 1))
        except (ValueError, TypeError):
            page_num = 1

        key = (source_name, page_num)
        if key not in seen:
            seen.add(key)
            sources.append(SourceItem(document=source_name, page=page_num))

    return sources


def build_rag_prompt() -> ChatPromptTemplate:
    """Creates the standard ChatPromptTemplate for policy answering and conversation."""
    return ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="history", optional=True),
            ("human", USER_PROMPT),
        ]
    )
