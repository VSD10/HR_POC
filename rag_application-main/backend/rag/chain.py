import logging
from typing import List, Tuple
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import os
from langchain_openai import AzureChatOpenAI, ChatOpenAI

from backend.config import settings
from backend.models import SourceItem

logger = logging.getLogger(__name__)

EMAIL_DRAFT_SYSTEM_PROMPT = """You are an expert HR Operations Specialist and Employee Communications Director at Nexus Corporation.
Your objective is to generate an accurate, polished, policy-grounded email reply addressing an employee's inquiry.

CRITICAL INSTRUCTIONS:
1. Format: Output ONLY the complete, professional email draft (including salutation, structured body paragraphs/bullet points, policy grounding, clear next steps, and sign-off).
2. Policy Adherence: Ground all answers strictly in the provided Company Policy Excerpts. Accurately cite limits, numbers, accrual rates, waiting periods, and deadlines (citing the policy document name and page number).
3. Do NOT dump raw boilerplate legal preambles, disclaimers, or metadata headers. Synthesize the relevant policy rules into clear, empathetic, actionable paragraphs.
4. Tone: Adhere to the requested tone ({tone_instruction}).
5. Structure:
   - Salutation: Dear {sender_name},
   - Courteous opening acknowledging their specific question.
   - Clear policy explanation and entitlements (use bullet points for numbers/limits where helpful).
   - Concrete next steps / action items for the employee (e.g. portal submission deadlines).
   - Professional closing and HR sign-off.

Policy Context:
{context}"""

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


def get_azure_chat_llm(temperature: float = 0.1) -> AzureChatOpenAI:
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
        temperature=temperature,
        request_timeout=5.0,
        max_retries=1,
    )


def get_rag_chat_llm(temperature: float = 0.1):
    """
    Returns the primary configured chat LLM for rag_application-main:
    1. AzureChatOpenAI if Azure chat config is present.
    2. ChatOpenAI if OPENAI_API_KEY is present in environment.
    3. None if no external credentials are configured.
    """
    if settings.is_azure_chat_configured():
        try:
            return get_azure_chat_llm(temperature=temperature)
        except Exception as e:
            logger.warning(f"Could not initialize AzureChatOpenAI: {e}")

    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if openai_key:
        try:
            return ChatOpenAI(
                model=settings.AZURE_OPENAI_DEPLOYMENT or "gpt-4o",
                api_key=openai_key,
                temperature=temperature,
                max_tokens=2048,
            )
        except Exception as e:
            logger.warning(f"Could not initialize ChatOpenAI: {e}")

    return None


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


def build_email_rag_prompt() -> ChatPromptTemplate:
    """Creates ChatPromptTemplate tailored for policy-grounded HR email draft generation."""
    return ChatPromptTemplate.from_messages(
        [
            ("system", EMAIL_DRAFT_SYSTEM_PROMPT),
            ("human", "{user_instruction}"),
        ]
    )
