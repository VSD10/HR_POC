import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from backend.integrations.gmail.schemas import (
    EmailDetail,
    EmailResponseDraft,
    EmailTriageResult,
    PolicyCitation,
)
from backend.models import ChatRequest
from backend.services.chat_service import ChatService

logger = logging.getLogger(__name__)

# Categories defined by requirements
CATEGORIES = [
    "Leave / Attendance",
    "Payroll",
    "Benefits",
    "HR Policy",
    "Recruitment",
    "Workplace Issue",
    "Documentation",
    "General HR",
    "Sensitive / Escalation Required",
]

# Sensitive HR triggers (harassment, discrimination, threats, retaliation, legal, whistleblower)
SENSITIVE_TRIGGERS = [
    (r"\b(harass|harassment|hostile work|bully|bullying|derogatory|intimidat|slur)\b", "Workplace Harassment / Hostile Environment"),
    (r"\b(discriminat|gender|racial|racism|ageism|sexual orientation|disability bias)\b", "Unlawful Discrimination"),
    (r"\b(sexual misconduct|inappropriate touch|unwanted advance|lewd)\b", "Sexual Misconduct / Title VII Issue"),
    (r"\b(retaliat|retaliation|punished for reporting|threaten|threats)\b", "Workplace Retaliation / Whistleblower"),
    (r"\b(lawsuit|attorney|lawyer|legal action|subpoena|eeoc|court|sue)\b", "Formal Legal Escalation / Litigation Risk"),
    (r"\b(suicide|self-harm|violence|weapon|physical assault)\b", "Immediate Threat / Safety Emergency"),
]

# Category keyword clusters
CATEGORY_RULES = {
    "Leave / Attendance": [
        "leave", "vacation", "pto", "sick leave", "annual leave", "maternity", "paternity",
        "parental leave", "bereavement", "carry over", "rollover", "time off", "absence", "fmla",
        "holiday", "jury duty", "sabbatical", "half day", "unpaid leave"
    ],
    "Payroll": [
        "payroll", "payslip", "salary", "bonus", "tax", "withholding", "w-2", "direct deposit",
        "overtime", "paycheck", "compensation", "deduction", "gross pay", "net pay", "bank account",
        "pay cut", "retroactive pay", "severance"
    ],
    "Benefits": [
        "benefit", "benefits", "401k", "health insurance", "dental", "vision", "fsa", "hsa",
        "wellness stipend", "gym", "ergonomic", "home office stipend", "retirement", "pension",
        "life insurance", "perks", "stock options", "equity", "espp"
    ],
    "HR Policy": [
        "policy", "policies", "handbook", "guideline", "guidelines", "code of conduct",
        "travel policy", "per diem", "mileage", "remote work policy", "hybrid policy",
        "working hours", "core hours", "dress code", "security policy", "it equipment"
    ],
    "Recruitment": [
        "interview", "candidate", "resume", "cv", "job opening", "requisition", "hiring",
        "offer letter", "referral bonus", "applicant", "onboarding date", "background check"
    ],
    "Documentation": [
        "employment verification", "proof of employment", "visa letter", "relocation letter",
        "contract", "nda", "clearance", "certificate", "id card", "badge"
    ],
    "Workplace Issue": [
        "conflict", "disagreement", "manager dispute", "team friction", "workload", "burnout",
        "performance review dispute", "pip", "feedback issue"
    ],
}


class EmailTriageService:
    """Performs automated classification, sensitivity detection, and urgency assessment."""

    def analyze_email(self, subject: str, body: str) -> EmailTriageResult:
        """Analyzes email subject and body to produce triage metadata."""
        combined_text = f"{subject}\n{body}".strip()
        lower_text = combined_text.lower()

        # 1. Check for Sensitive Escalations First
        is_sensitive = False
        sensitive_reason = None
        for pattern, reason in SENSITIVE_TRIGGERS:
            if re.search(pattern, lower_text):
                is_sensitive = True
                sensitive_reason = reason
                break

        if is_sensitive:
            logger.warning(f"Sensitive HR topic detected: {sensitive_reason}")
            return EmailTriageResult(
                category="Sensitive / Escalation Required",
                confidence=0.98,
                urgency="Urgent",
                is_sensitive=True,
                sensitive_reason=sensitive_reason,
                requires_human_escalation=True,
                extracted_intent=f"Urgent human escalation required regarding {sensitive_reason}",
                key_entities=["Confidential Grievance", sensitive_reason or "Escalation"],
                policy_lookup_query="code of conduct non retaliation anti harassment policy",
            )

        # 2. Score Categories via Semantic Keywords
        scores: Dict[str, float] = {}
        for cat, keywords in CATEGORY_RULES.items():
            score = 0.0
            for kw in keywords:
                # Higher weight if matched in subject
                if kw in subject.lower():
                    score += 3.0
                if kw in lower_text:
                    score += 1.0
            scores[cat] = score

        best_cat = max(scores, key=lambda k: scores[k])
        max_score = scores[best_cat]

        if max_score > 0:
            confidence = min(0.65 + (max_score * 0.06), 0.96)
        else:
            best_cat = "General HR"
            confidence = 0.55

        # 3. Urgency Detection
        urgency = "Medium"
        if re.search(r"\b(urgent|asap|immediately|critical|today|deadline|emergency|blocked)\b", lower_text):
            urgency = "High"
        elif re.search(r"\b(whenever|no rush|just wondering|curious|general question)\b", lower_text):
            urgency = "Low"

        # 4. Intent & Entity Extraction
        extracted_intent = self._extract_intent_summary(subject, body)
        key_entities = self._extract_key_entities(lower_text, best_cat)
        policy_query = self._build_policy_query(subject, body, best_cat)

        return EmailTriageResult(
            category=best_cat,
            confidence=round(confidence, 2),
            urgency=urgency,
            is_sensitive=False,
            sensitive_reason=None,
            requires_human_escalation=False,
            extracted_intent=extracted_intent,
            key_entities=key_entities,
            policy_lookup_query=policy_query,
        )

    def _extract_intent_summary(self, subject: str, body: str) -> str:
        """Derives a concise 1-sentence intent summary."""
        # Find first question or declarative sentence in body
        sentences = re.split(r"(?<=[.!?])\s+", body.strip())
        for s in sentences:
            clean = s.strip()
            if "?" in clean and len(clean) > 15:
                return clean[:120]
        if sentences and len(sentences[0]) > 10:
            return sentences[0][:100]
        return subject[:80]

    def _extract_key_entities(self, text: str, category: str) -> List[str]:
        """Pulls out relevant contextual entities for HR specialists."""
        entities = []
        if "leave" in category.lower():
            if "annual" in text: entities.append("Annual Leave")
            if "rollover" in text or "carry" in text: entities.append("Year-end Rollover")
            if "sick" in text: entities.append("Sick Leave")
            if "parental" in text or "paternity" in text or "maternity" in text: entities.append("Parental Leave")
        elif "payroll" in category.lower():
            if "tax" in text or "withholding" in text: entities.append("Tax Withholding")
            if "bonus" in text: entities.append("Performance Bonus")
            if "payslip" in text: entities.append("Payslip Deduction")
        elif "benefits" in category.lower():
            if "stipend" in text or "home office" in text or "ergonomic" in text: entities.append("Home Office Stipend")
            if "insurance" in text or "health" in text: entities.append("Medical Insurance")
            if "401k" in text: entities.append("401(k) Match")
        elif "policy" in category.lower():
            if "per diem" in text or "meal" in text: entities.append("Travel Per-Diem")
            if "remote" in text or "hybrid" in text: entities.append("Remote Work Eligibility")

        if not entities:
            entities.append(category)
        return entities[:3]

    def _build_policy_query(self, subject: str, body: str, category: str) -> str:
        """Constructs an optimized search query for knowledge base policy retrieval."""
        words = re.findall(r"\b[A-Za-z]{3,}\b", f"{subject} {category}")
        filtered = [w for w in words if w.lower() not in {"the", "and", "for", "with", "this", "that", "regarding", "inquiry"}]
        return " ".join(filtered[:8])

    def generate_draft_response(
        self,
        email: EmailDetail,
        triage: EmailTriageResult,
        tone: str = "professional",
        refinement: Optional[str] = None,
        custom_instructions: Optional[str] = None,
    ) -> EmailResponseDraft:
        """
        Generates an HR response draft grounded in company policies using conversational RAG.
        If sensitive, flags for human review and produces a confidential acknowledgment template.
        """
        draft_id = f"draft_{uuid.uuid4().hex[:10]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        sender_name = email.sender.name or "Colleague"

        # 1. Sensitive Escalation Path
        if triage.is_sensitive:
            sensitive_body = (
                f"Dear {sender_name},\n\n"
                f"Thank you for contacting Human Resources. We have received your correspondence regarding this matter and take all reported concerns very seriously.\n\n"
                f"Given the confidential and sensitive nature of your inquiry ({triage.sensitive_reason or 'Workplace Concern'}), an HR Director will be reaching out to you privately to discuss this directly.\n\n"
                f"Please be assured that our organization strictly enforces a zero-tolerance Non-Retaliation Policy and provides protected channels under our Code of Conduct.\n\n"
                f"If you require immediate confidential support, our 24/7 Employee Assistance Program (EAP) is available at eap-support@enterprise.internal.\n\n"
                f"Sincerely,\n"
                f"People Operations & Employee Relations"
            )
            citations = [
                PolicyCitation(
                    document="Code_of_Conduct.pdf",
                    title="Code of Conduct & Anti-Retaliation Policy",
                    page=1,
                    excerpt="Prohibits retaliation and guarantees confidential escalation for grievances."
                )
            ]
            return EmailResponseDraft(
                id=draft_id,
                email_id=email.id,
                subject=f"Re: {email.subject}",
                recipient=email.sender.email,
                draft_body=sensitive_body,
                tone=tone,
                citations=citations,
                needs_hr_review=True,
                review_reason=f"Flagged for sensitive topic: {triage.sensitive_reason}. Automated sending disabled.",
                status="awaiting_approval",
                created_at=now_iso,
            )

        # 2. Standard Grounded RAG Generation Path
        tone_instruction = "professional, clear, and reassuring"
        if tone == "empathetic":
            tone_instruction = "warm, empathetic, and supportive"
        elif tone == "concise":
            tone_instruction = "concise, direct, and action-oriented"

        prompt = (
            f"Draft a clear, polite, and complete HR email reply to {sender_name} addressing their inquiry below based on official company policies.\n\n"
            f"Inquiry Subject: {email.subject}\n"
            f"Inquiry Details:\n{email.body_text}\n\n"
            f"Required Tone: {tone_instruction}.\n"
            f"Include a warm greeting addressed to {sender_name}, direct factual answers with policy limits/rules, "
            f"and a professional sign-off from Human Resources Operations.\n"
        )
        if refinement == "shorten":
            prompt += "Refinement requirement: Keep the response very concise (2-3 short paragraphs max).\n"
        elif refinement == "make_empathetic":
            prompt += "Refinement requirement: Emphasize employee well-being, empathy, and support.\n"
        elif refinement == "make_professional":
            prompt += "Refinement requirement: Use authoritative, formal corporate HR standards.\n"

        if custom_instructions:
            prompt += f"Special HR Instructions to incorporate: {custom_instructions}\n"

        try:
            chat_service = ChatService()
            response = chat_service.answer_question(ChatRequest(question=prompt, history=[]))
            draft_text = response.answer

            citations = [
                PolicyCitation(
                    document=src.document,
                    title=src.document.replace(".pdf", "").replace("_", " "),
                    page=src.page,
                    excerpt=f"Referenced from {src.document} (Page {src.page})"
                )
                for src in response.sources
            ]

            return EmailResponseDraft(
                id=draft_id,
                email_id=email.id,
                subject=f"Re: {email.subject}",
                recipient=email.sender.email,
                draft_body=draft_text,
                tone=tone,
                citations=citations,
                needs_hr_review=len(citations) == 0,
                review_reason="No policy documents cited; manual HR review recommended." if len(citations) == 0 else None,
                status="awaiting_approval",
                created_at=now_iso,
            )
        except Exception as e:
            logger.warning(f"Error generating RAG draft ({e}), creating template fallback.")
            fallback_body = (
                f"Hi {sender_name},\n\n"
                f"Thank you for reaching out to Human Resources regarding \"{email.subject}\".\n\n"
                f"We are reviewing your request against our company policies ({triage.category}) and will provide full details shortly.\n\n"
                f"Please let us know if there are any specific deadlines or additional documents we should consider.\n\n"
                f"Best regards,\n"
                f"Human Resources Team"
            )
            return EmailResponseDraft(
                id=draft_id,
                email_id=email.id,
                subject=f"Re: {email.subject}",
                recipient=email.sender.email,
                draft_body=fallback_body,
                tone=tone,
                citations=[],
                needs_hr_review=True,
                review_reason="Fallback draft generated due to retrieval service warning.",
                status="awaiting_approval",
                created_at=now_iso,
            )


email_triage_service = EmailTriageService()
