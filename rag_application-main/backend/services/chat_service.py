import logging
import re
import time
from typing import Optional, List, Tuple
from openai import APIError, AuthenticationError, RateLimitError
from langchain_core.messages import HumanMessage, AIMessage

import httpx
from backend.config import settings, ConfigurationError
from backend.models import ChatRequest, ChatResponse, ChatMessage, SourceItem
from backend.rag.chain import (
    build_rag_prompt,
    extract_deduplicated_sources,
    format_context_documents,
    get_azure_chat_llm,
    get_rag_chat_llm,
)
from backend.rag.policy_store import get_policy_engine, PolicyArticle, SearchResult

# Suppress harmless pypdf startxref warnings on two-pass generated PDFs
logging.getLogger("pypdf").setLevel(logging.ERROR)

logger = logging.getLogger(__name__)


def classify_chat_intent(text: str) -> str:
    q = text.strip().lower()
    if not q:
        return "CASUAL"

    casual_exact = {
        'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
        'greetings', 'howdy', 'hola', 'sup', 'yo',
        'how are you', 'how are you?', 'how are you doing', 'how are you doing?',
        'how is it going', 'how is it going?', "how's it going", "how's it going?",
        'thank you', 'thanks', 'thanks!', 'thank you!', 'thanks a lot', 'thank you very much',
        'tell me a joke', 'tell a joke', 'joke', 'make me laugh',
        'bye', 'goodbye', 'see you', 'have a nice day', 'have a good day'
    }
    if q in casual_exact:
        return "CASUAL"

    casual_patterns = [
        r'^(hi|hello|hey|greetings|howdy|hola)(\s+(there|assistant|bot|copilot|team|hr))?[!.?]*$',
        r'^(good\s+(morning|afternoon|evening|day))[!.?]*$',
        r'^how\s+are\s+you(\s+doing)?[?.!]*$',
        r'^tell\s+(me\s+)?a\s+joke[?.!]*$',
        r'^(thank\s+you|thanks)(\s+very\s+much|\s+a\s+lot)?[!.?]*$',
        r'^(who\s+are\s+you|what\s+is\s+your\s+name)[?.!]*$'
    ]
    for pat in casual_patterns:
        if re.match(pat, q, re.IGNORECASE):
            return "CASUAL"

    is_personal_leave = bool(
        re.search(r'\bmy\s+(leave\s+balance|leaves?|balance|remaining\s+leaves?|casual\s+leaves?|sick\s+leaves?|annual\s+leaves?|earned\s+leaves?)\b', q, re.IGNORECASE) or
        re.search(r'how\s+many\s+.*(leaves?|casual|sick|annual|earned).*do\s+i\s+have', q, re.IGNORECASE) or
        re.search(r'how\s+many\s+.*(leaves?|casual|sick|annual|earned).*have\s+i\s+(used|taken)', q, re.IGNORECASE) or
        re.search(r'leaves?\s+have\s+i\s+(used|taken)', q, re.IGNORECASE) or
        re.search(r'how\s+many\s+(casual|sick|annual|earned|remaining)?\s*leaves?\s+(are\s+remaining|do\s+i\s+have\s+remaining|remaining)', q, re.IGNORECASE) or
        re.search(r'what\s+is\s+my\s+(remaining\s+)?(annual|casual|sick|earned)?\s*leaves?', q, re.IGNORECASE) or
        re.search(r'do\s+i\s+have\s+.*leaves?\s+(left|remaining)', q, re.IGNORECASE) or
        re.search(r'check\s+my\s+leave\s+balance', q, re.IGNORECASE) or
        re.search(r'how\s+many\s+sick\s+leaves\s+are\s+remaining', q, re.IGNORECASE) or
        re.search(r'how\s+many\s+casual\s+leaves\s+are\s+remaining', q, re.IGNORECASE) or
        re.search(r'how\s+many\s+annual\s+leaves\s+are\s+remaining', q, re.IGNORECASE)
    )

    is_general_policy = bool(
        re.search(r'\b(overall|company|allowed|does\s+the\s+company\s+allow|are\s+allowed|policy|policies|guidelines?|handbook|rules?|carry\s+forward|carried\s+forward|maternity|paternity|parental|bereavement|sabbatical)\b', q, re.IGNORECASE) and
        not re.search(r'\b(my|do\s+i\s+have|have\s+i\s+used|have\s+i\s+taken|i\s+have)\b', q, re.IGNORECASE)
    )

    if is_personal_leave and not is_general_policy:
        return "EMPLOYEE_DATA"

    return "POLICY_RAG"


class ChatServiceError(Exception):
    """General domain error for ChatService operations."""
    pass


# Circuit Breaker state to prevent waiting on timeouts when Azure OpenAI is offline
_azure_circuit_open_until: float = 0.0
_circuit_failure_reason: str = ""


class ChatService:
    """Service handling multi-turn conversation and grounded policy retrieval."""

    def __init__(self, top_k: Optional[int] = None):
        self.top_k = top_k or settings.TOP_K
        self.engine = get_policy_engine()

    def answer_question(self, request: ChatRequest, auth_header: Optional[str] = None) -> ChatResponse:
        """
        Executes the conversational RAG pipeline with intent routing:
        1. CASUAL -> Natural conversation without document search.
        2. EMPLOYEE_DATA -> Personal leave balance for authenticated employee.
        3. POLICY_RAG -> Grounded company policy retrieval.
        """
        global _azure_circuit_open_until, _circuit_failure_reason
        question = request.question.strip()
        history = request.history or []
        logger.info(f"Processing question: '{question[:80]}...' (History depth: {len(history)})")

        intent = classify_chat_intent(question)
        logger.info(f"Query: '{question}' -> Intent: {intent}")

        # 1. Handle CASUAL intent
        if intent == "CASUAL":
            q_lower = question.lower()
            if "how are you" in q_lower:
                reply = "I'm doing well, thank you for asking! How can I assist you with your HR requests or company inquiries today?"
            elif "joke" in q_lower:
                reply = "Why did the computer show up late to work? It had a hard drive!"
            elif "thank" in q_lower:
                reply = "You're very welcome! Please let me know if you need any more assistance."
            elif "good morning" in q_lower:
                reply = "Good morning! Wishing you a productive day. How can I help you today?"
            elif "good afternoon" in q_lower:
                reply = "Good afternoon! How can I assist you today?"
            elif "good evening" in q_lower:
                reply = "Good evening! How can I help you today?"
            else:
                reply = "Hello! How can I assist you with HR services today?"
            return ChatResponse(answer=reply, sources=[])

        # 2. Handle EMPLOYEE_DATA intent
        if intent == "EMPLOYEE_DATA":
            headers = {}
            if auth_header:
                headers["Authorization"] = auth_header

            leave_data = None
            error_msg = None
            try:
                with httpx.Client(timeout=4.0) as client:
                    r = client.get("http://127.0.0.1:8000/api/v1/employee/leave-balance", headers=headers)
                    if r.status_code == 200:
                        leave_data = r.json().get("leaveBalance")
                    elif r.status_code == 401:
                        error_msg = "Unable to retrieve your leave balance because your employee session could not be authenticated. Please log in to your employee account or contact HR support."
                    elif r.status_code == 404:
                        error_msg = "No leave balance records were found for your employee profile. Please contact HR Operations to initialize your annual leave allocation."
            except Exception as e:
                logger.warning(f"Could not connect to HR sync server on port 8000: {e}")
                error_msg = "The leave management service is temporarily unreachable. Please try again shortly."

            if not leave_data:
                return ChatResponse(
                    answer=error_msg or "Unable to retrieve your leave balance at this time. Please ensure you are logged in to your employee account or contact HR support.",
                    sources=[]
                )

            casual = leave_data.get("casual") or {"remaining": 0, "total": 12}
            sick = leave_data.get("sick") or {"remaining": 0, "total": 10}
            annual = leave_data.get("annual") or leave_data.get("earned") or {"remaining": 0, "total": 18}

            casual_used = max(0, casual.get("total", 0) - casual.get("remaining", 0))
            sick_used = max(0, sick.get("total", 0) - sick.get("remaining", 0))
            annual_used = max(0, annual.get("total", 0) - annual.get("remaining", 0))
            total_used = casual_used + sick_used + annual_used
            total_remaining = casual.get("remaining", 0) + sick.get("remaining", 0) + annual.get("remaining", 0)

            q_lower = question.lower()
            if "casual" in q_lower:
                answer = f"You currently have **{casual.get('remaining', 0)} Casual Leaves remaining** out of your annual entitlement of {casual.get('total', 0)} days ({casual_used} days used)."
            elif "sick" in q_lower:
                answer = f"You currently have **{sick.get('remaining', 0)} Sick Leaves remaining** out of your annual entitlement of {sick.get('total', 0)} days ({sick_used} days used)."
            elif "annual" in q_lower or "earned" in q_lower:
                answer = f"You currently have **{annual.get('remaining', 0)} Annual / Earned Leaves remaining** out of your annual entitlement of {annual.get('total', 0)} days ({annual_used} days used)."
            elif "used" in q_lower or "taken" in q_lower:
                answer = f"You have used a total of **{total_used} leave days**:\n- **Casual Leave**: {casual_used} days used ({casual.get('remaining', 0)} remaining)\n- **Sick Leave**: {sick_used} days used ({sick.get('remaining', 0)} remaining)\n- **Annual / Earned Leave**: {annual_used} days used ({annual.get('remaining', 0)} remaining)"
            else:
                answer = (
                    f"Here is your current personal leave balance as of today:\n\n"
                    f"- **Casual Leave**: {casual.get('remaining', 0)} remaining of {casual.get('total', 0)} days ({casual_used} used)\n"
                    f"- **Sick Leave**: {sick.get('remaining', 0)} remaining of {sick.get('total', 0)} days ({sick_used} used)\n"
                    f"- **Annual / Earned Leave**: {annual.get('remaining', 0)} remaining of {annual.get('total', 0)} days ({annual_used} used)\n\n"
                    f"**Total Remaining**: {total_remaining} days."
                )

            return ChatResponse(answer=answer, sources=[])

        # 3. Retrieve grounded policy articles from the policy engine (POLICY_RAG)
        history_dicts = [{"role": m.role, "content": m.content} for m in history]
        results, is_match = self.engine.search(question, history=history_dicts, top_k=self.top_k)

        # 3. Handle out-of-scope queries with zero false citations
        if not is_match:
            return ChatResponse(
                answer=(
                    "I searched the TCS Global Policy Knowledge Base (covering Associate Leave, Workplace & Return to Office, "
                    f"Total Rewards & Benefits, Global Travel & Expenses, Information Security ISMS, Tata Code of Conduct, and Performance Management), but did not find an official corporate policy addressing **\"{question}\"**.\n\n"
                    "### Recommended Next Steps:\n"
                    "- If this is an exceptional accommodation or clarification request, please submit an inquiry on the Ultimatix Global Helpdesk.\n"
                    "- You can also reach your Unit HR (UHR) specialist or Delivery Manager directly."
                ),
                sources=[],
            )

        # 4. Check if external LLM is configured and reachable
        llm = get_rag_chat_llm()
        if llm is not None:
            now = time.time()
            if now >= _azure_circuit_open_until:
                try:
                    return self._generate_with_llm(llm, question, history, results)
                except Exception as e:
                    _azure_circuit_open_until = time.time() + 180.0
                    _circuit_failure_reason = str(e)
                    logger.warning(f"External LLM generation failed ({e}), falling back to grounded synthesis.")

        # 5. Synthesize grounded answer via Policy Knowledge Engine
        answer = self.engine.synthesize_grounded_answer(question, results, history=history_dicts)

        # Extract deduplicated sources with exact page numbers
        sources: List[SourceItem] = []
        seen = set()
        for res in results:
            art = res.article
            key = (art.doc_filename, art.page)
            if key not in seen:
                seen.add(key)
                sources.append(SourceItem(document=art.doc_filename, page=art.page))

        return ChatResponse(answer=answer, sources=sources)

    def _generate_with_llm(
        self, llm, question: str, history: List[ChatMessage], results: List[SearchResult]
    ) -> ChatResponse:
        """Invokes configured LLM with retrieved context documents and dialogue history."""
        # Format context documents from retrieved articles
        context_pieces = []
        sources: List[SourceItem] = []
        seen = set()

        for res in results:
            art = res.article
            key = (art.doc_filename, art.page)
            if key not in seen:
                seen.add(key)
                sources.append(SourceItem(document=art.doc_filename, page=art.page))

            table_str = ""
            if art.table_headers and art.table_rows:
                table_str = "\nTable:\n" + " | ".join(art.table_headers) + "\n"
                for row in art.table_rows:
                    table_str += " | ".join(row) + "\n"

            context_pieces.append(
                f"--- Document: {art.doc_filename} (Page {art.page}) ---\n"
                f"Title: {art.article_title}\n"
                f"Section: {art.subtitle}\n"
                f"Content: {art.text_content}\n"
                f"{table_str}"
                f"Bullets: {' '.join(art.bullets)}\n"
                f"Callout: {art.callout_label} {art.callout_text}\n"
            )

        formatted_context = "\n\n".join(context_pieces)

        # Build LangChain history
        lc_messages = []
        for item in history[-6:]:
            role = item.role.lower().strip()
            content = item.content.strip()
            if not content:
                continue
            if role in ("user", "human"):
                lc_messages.append(HumanMessage(content=content))
            elif role in ("assistant", "ai", "bot"):
                lc_messages.append(AIMessage(content=content))

        prompt = build_rag_prompt()
        messages = prompt.format_messages(
            context=formatted_context,
            history=lc_messages,
            question=question,
        )
        response = llm.invoke(messages)
        answer = response.content if hasattr(response, "content") else str(response)
        if isinstance(answer, list):
            answer = "".join(str(part) for part in answer)

        return ChatResponse(answer=answer.strip(), sources=sources)
