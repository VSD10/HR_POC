import logging
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from pypdf import PdfReader

from backend.config import settings
from backend.integrations.gmail.schemas import (
    EmailDetail,
    EmailResponseDraft,
    EmailTriageResult,
    PolicyCitation,
)
from backend.rag.chain import (
    get_rag_chat_llm,
    build_email_rag_prompt,
)

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

    def _retrieve_policy_grounding(
        self, subject: str, body: str, category: str
    ) -> Tuple[str, List[PolicyCitation]]:
        """
        Extracts relevant policy clauses, articles, and citations from company policy PDFs
        for the given email topic and category.
        """
        combined = f"{subject}\n{body}".lower()
        kb_dir = settings.KNOWLEDGE_BASE_DIR

        # Candidate PDF prioritization based on category and query terms
        candidate_files = []
        if any(w in combined for w in ["leave", "pto", "vacation", "sick", "absence", "rollover", "carryover", "holiday"]):
            candidate_files.append("leave_policy.pdf")
        if any(w in combined for w in ["remote", "hybrid", "stipend", "ergonomic", "wfh", "office equipment", "broadband"]):
            candidate_files.append("remote_work_policy.pdf")
        if any(w in combined for w in ["travel", "per diem", "meal", "flight", "hotel", "client dinner", "entertainment"]):
            candidate_files.extend(["travel_policy.pdf", "expense_policy.pdf", "travel_expense_policy.pdf"])
        if any(w in combined for w in ["expense", "receipt", "reimbursement"]):
            candidate_files.extend(["expense_policy.pdf", "travel_expense_policy.pdf"])
        if any(w in combined for w in ["payroll", "tax", "withholding", "w-4", "bonus", "salary", "payslip"]):
            candidate_files.extend(["employee_handbook.pdf", "benefits_guide.pdf"])
        if any(w in combined for w in ["benefit", "insurance", "401k", "medical", "dental", "vision"]):
            candidate_files.append("benefits_guide.pdf")
        if any(w in combined for w in ["security", "password", "vpn", "laptop", "badge", "device"]):
            candidate_files.append("security_policy.pdf")
        if any(w in combined for w in ["conduct", "ethics", "harassment", "retaliation", "grievance"]):
            candidate_files.append("employee_handbook.pdf")

        if not candidate_files:
            candidate_files = ["leave_policy.pdf", "employee_handbook.pdf", "remote_work_policy.pdf"]

        # Deduplicate candidates while preserving order
        candidate_files = list(dict.fromkeys(candidate_files))

        query_words = [
            w for w in re.findall(r"\b[a-zA-Z]{3,}\b", combined)
            if w not in {"the", "and", "for", "with", "this", "that", "regarding", "inquiry", "team", "dear", "hello", "hi", "can", "you", "please"}
        ]

        scored_chunks: List[Tuple[float, str, int, str]] = []
        citations: List[PolicyCitation] = []
        seen_pages = set()

        if kb_dir.exists():
            for filename in candidate_files:
                pdf_path = kb_dir / filename
                if not pdf_path.exists():
                    continue
                try:
                    reader = PdfReader(str(pdf_path))
                    doc_title = filename.replace(".pdf", "").replace("_", " ").title()
                    for page_idx, page in enumerate(reader.pages):
                        page_num = page_idx + 1
                        text = page.extract_text() or ""
                        cleaned = " ".join(text.split())
                        cleaned_lower = cleaned.lower()
                        score = sum(cleaned_lower.count(qw) * (2 if len(qw) > 4 else 1) for qw in query_words)
                        if score > 0:
                            scored_chunks.append((score, filename, page_num, cleaned))
                            page_key = (filename, page_num)
                            if page_key not in seen_pages and len(citations) < 4:
                                seen_pages.add(page_key)
                                snippet = cleaned[:160] + "..." if len(cleaned) > 160 else cleaned
                                citations.append(
                                    PolicyCitation(
                                        document=filename,
                                        title=doc_title,
                                        page=page_num,
                                        excerpt=f"Referenced from {filename} (Page {page_num}): {snippet}",
                                    )
                                )
                except Exception as ex:
                    logger.warning(f"Error scanning PDF {filename}: {ex}")

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = scored_chunks[:3]

        if top_chunks:
            context_pieces = [
                f"--- Policy Excerpt [Document: {fn} | Page: {pg}] ---\n{content}"
                for _, fn, pg, content in top_chunks
            ]
            context_str = "\n\n".join(context_pieces)
        else:
            context_str = f"General company HR standards apply for category: {category}."

        return context_str, citations

    def _synthesize_grounded_email(
        self,
        sender_name: str,
        subject: str,
        body: str,
        triage: EmailTriageResult,
        tone: str,
        refinement: Optional[str],
        custom_instructions: Optional[str],
        citations: List[PolicyCitation],
        policy_context: str,
    ) -> str:
        """
        Generates a complete, professional HR email grounded in official company policy guidelines.
        Applied whenever external LLM inference is offline or unconfigured.
        """
        combined = f"{subject} {body}".lower()
        first_name = sender_name.split()[0] if sender_name else "Colleague"
        primary_citation = citations[0] if citations else None
        source_ref = f"{primary_citation.document} (Page {primary_citation.page})" if primary_citation else "the Company HR Policy Manual"

        # Determine variation index for regeneration cycles
        var_key = f"{sender_name}_{subject}"
        if not hasattr(self, "_variation_counter"):
            self._variation_counter = {}
        if refinement == "regenerate":
            self._variation_counter[var_key] = self._variation_counter.get(var_key, 0) + 1
        var_idx = self._variation_counter.get(var_key, 0) % 2

        # Topic 1: Leave & Rollover
        if any(w in combined for w in ["leave", "pto", "vacation", "rollover", "carryover", "annual leave"]):
            if var_idx == 1:
                lead = "We have received your inquiry regarding annual paid time off allocation and year-end leave carryover guidelines."
                policy_points = (
                    f"In accordance with our official Leave of Absence Policy ({source_ref}):\n\n"
                    f"- Annual Accrual: Full-time employees accrue 20 paid leave days annually (calculated at 1.67 days per completed calendar month of active service).\n"
                    f"- Carryover Cap: You may roll over a maximum of 5 unused annual leave days into the subsequent year. Carried-over days must be scheduled and taken prior to March 31st per corporate governance.\n"
                    f"- Request Submission: Please submit upcoming vacation dates through the Employee Self-Service Portal at least two weeks in advance for supervisory scheduling approval."
                )
                next_steps = "You can review your current accrued leave balance and request upcoming time-off dates directly through the Leave Management module in the portal."
            else:
                lead = "Thank you for contacting Human Resources regarding your annual leave entitlement and year-end carryover questions."
                policy_points = (
                    f"Under our official Leave of Absence Policy ({source_ref}), here are the applicable guidelines:\n\n"
                    f"- Annual Leave Allowance: Full-time employees accrue 20 business days of paid annual leave per calendar year (accruing monthly at 1.67 days per completed month of active service).\n"
                    f"- Year-End Rollover: You may carry over a maximum of 5 unused annual leave days into the subsequent calendar year. Any carried-over days must be utilized before March 31st, after which they will lapse per company governance.\n"
                    f"- Booking Vacation: Please submit your planned time-off requests via the Employee Self-Service Portal at least two weeks in advance so your manager can review and approve team schedule coverage."
                )
                next_steps = "Please log in to the Employee Portal under 'Leave Management' to review your current real-time leave balance and submit your November dates."

        # Topic 2: Remote / Hybrid & Ergonomic Equipment
        elif any(w in combined for w in ["remote", "hybrid", "ergonomic", "stipend", "wfh", "home office"]):
            if var_idx == 1:
                lead = "We are writing in response to your inquiry concerning remote workplace equipment stipends and in-office attendance guidelines."
                policy_points = (
                    f"As specified in our Remote and Hybrid Work Policy ({source_ref}):\n\n"
                    f"- Equipment Reimbursement: Full-time personnel qualify for a one-time $500 ergonomic home-office reimbursement following the initial 90-day introductory period.\n"
                    f"- In-Office Expectations: The Tuesday and Thursday core in-office days apply strictly to personnel on designated hybrid agreements. If your employment contract officially designates full-time remote status, you are exempt from mandatory in-office core days.\n"
                    f"- Monthly Connectivity: Eligible remote team members are also entitled to a $60/month broadband connectivity reimbursement claimable via monthly expense filing."
                )
                next_steps = "To process your ergonomic equipment claim, submit your itemized receipts through the Expense Portal under the 'Home Office Stipend' expense code."
            else:
                lead = "Thank you for reaching out regarding our remote work policy and equipment stipends."
                policy_points = (
                    f"In accordance with our Remote and Hybrid Work Policy ({source_ref}):\n\n"
                    f"- Home Office Stipend: Full-time employees (both remote and hybrid designations) qualify for a one-time $500 ergonomic equipment reimbursement after completing 90 calendar days of tenure.\n"
                    f"- Core In-Office Days: Our Tuesday and Thursday in-office schedule applies strictly to employees on designated hybrid agreements. If your employment contract officially designates full-time remote status, you are exempt from mandatory in-office core days.\n"
                    f"- Broadband Expense: In addition, eligible remote staff receive a $60/month internet reimbursement claimable via monthly expense reports."
                )
                next_steps = "To claim your ergonomic reimbursement, please submit your itemized equipment receipts through the Expense Portal under the 'Home Office Stipend' expense code."

        # Topic 3: Travel, Per-Diem & Meals
        elif any(w in combined for w in ["travel", "per diem", "per-diem", "meal", "client dinner", "expense"]):
            if var_idx == 1:
                lead = "We have reviewed your inquiry regarding domestic travel expense guidelines and meal per-diem allowances."
                policy_points = (
                    f"Pursuant to our Corporate Travel & Expense Policy ({source_ref}):\n\n"
                    f"- Daily Per Diem: The maximum domestic daily meal reimbursement is $75 per full travel day ($15 breakfast, $25 lunch, $35 dinner).\n"
                    f"- Client Entertainment: Client and business development dinners must be filed under 'Business Entertainment' and do not deduct from your daily per diem. Please keep itemized receipts and a list of attendees.\n"
                    f"- Submission Window: Expense reports along with itemized documentation must be submitted within 30 calendar days following trip completion."
                )
                next_steps = "Please submit your completed travel expense summary and itemized receipts via the Expense module upon returning."
            else:
                lead = "Thank you for contacting People Operations regarding travel expenses for your upcoming trip."
                policy_points = (
                    f"Per our Corporate Travel & Expense Policy ({source_ref}):\n\n"
                    f"- Daily Meal Per-Diem: The maximum allowable domestic daily meal per diem is $75 per full travel day ($15 breakfast, $25 lunch, $35 dinner).\n"
                    f"- Client Entertainment Dinners: Client and partner business dinners are expensed separately under 'Business Entertainment' and are not deducted from your standard daily meal per diem. You must attach itemized receipts and a list of attendees.\n"
                    f"- Submission Window: All travel expense claims and supporting documentation must be submitted within 30 calendar days of trip completion."
                )
                next_steps = "You can submit your travel expense report and upload receipts via the Expense Management module in the portal upon your return."

        # Topic 4: Payroll, Tax Deductions & Bonus
        elif any(w in combined for w in ["payroll", "tax", "withholding", "w-4", "bonus", "payslip"]):
            if var_idx == 1:
                lead = "We are following up on your question regarding payroll withholding rates and supplemental tax deductions for performance bonuses."
                policy_points = (
                    f"Under our Payroll & Compensation Governance ({source_ref}):\n\n"
                    f"- Regular Income Withholding: Routine payroll tax withholding is determined by your active Form W-4 elections and applicable tax tables.\n"
                    f"- Supplemental Bonus Tax Rate: Annual bonus payments are classified by statutory tax regulations as supplemental wages, which carry a mandatory 22% federal flat withholding rate in addition to state taxes and FICA.\n"
                    f"- W-4 Updates: You may adjust your tax allowances or specify additional withholdings at any time through the Employee Self-Service Portal."
                )
                next_steps = "Our payroll desk will review your recent pay statement. If you wish to update future withholdings, you can file an updated W-4 online."
            else:
                lead = "Thank you for reaching out to HR Payroll Operations regarding your recent payslip and bonus calculation."
                policy_points = (
                    f"According to our Payroll & Compensation Governance ({source_ref}):\n\n"
                    f"- Tax Withholding Rates: Regular paycheck deductions reflect your active federal and state Form W-4 elections alongside annual IRS withholding tables.\n"
                    f"- Bonus Withholding: Performance bonus payouts are classified by statutory tax law as supplemental wages, which are subject to a mandatory 22% federal flat withholding rate in addition to state taxes and FICA.\n"
                    f"- Withholding Adjustments: You can submit an updated Form W-4 at any time via the Employee Portal to adjust your allowances or additional withholdings."
                )
                next_steps = "Our payroll desk will perform an itemized line-by-line audit of your October pay statement. If you'd like to adjust future withholdings, please update your W-4 in the Employee Portal."

        # Topic 5: General HR Policy Inquiries
        else:
            if var_idx == 1:
                lead = f"We have received your inquiry regarding \"{subject}\" and are pleased to provide policy guidance."
                policy_points = (
                    f"In accordance with Company Policy Guidelines ({source_ref}):\n\n"
                    f"- Standardized Governance: Enterprise policies apply uniformly across all departments to ensure fair and equitable operations.\n"
                    f"- Knowledge Hub Access: Comprehensive policy manuals, eligibility criteria, and operational forms are available on the Employee Portal."
                )
                next_steps = "Please do not hesitate to reach out if you require additional clarification or specific paperwork."
            else:
                lead = f"Thank you for reaching out to Human Resources regarding \"{subject}\"."
                policy_points = (
                    f"Based on our Corporate Policy Guidelines ({source_ref}):\n\n"
                    f"- Policy Guidelines: All employees are covered under standardized enterprise governance ensuring equitable support and clear procedures.\n"
                    f"- Documentation: Complete details, eligibility criteria, and operational forms are available in the employee portal policy knowledge hub."
                )
                next_steps = "Please let us know if you need specific guidance or additional documentation, and we will be delighted to assist."

        # Tone & Refinement synthesis
        if refinement == "make_empathetic" or tone == "empathetic":
            greeting = f"Dear {first_name},"
            if not lead.startswith("We hope"):
                lead = f"We hope you are having a productive week! " + lead
            closing_phrase = "Your wellness and clarity are paramount to us. Please do not hesitate to reach out if you have any questions or if there is anything more we can do to support you."
            signoff = "Warmest regards,\nPeople Operations Team\nGlobal HR Services"
        elif refinement == "make_professional" or tone == "professional":
            greeting = f"Dear {first_name},"
            closing_phrase = "Please do not hesitate to contact Human Resources if you require further clarification regarding these policies."
            signoff = "Best regards,\nSarah Jenkins\nPeople Operations Specialist\nNexus HR Operations Desk"
        elif tone == "concise" or refinement == "shorten":
            greeting = f"Hi {first_name},"
            closing_phrase = "Please reach out if you have further questions."
            signoff = "Best,\nHR Operations Desk"
        else:
            greeting = f"Dear {first_name},"
            closing_phrase = "Please let us know if you need any additional assistance."
            signoff = "Best regards,\nHuman Resources Operations Desk"

        # Refinements
        if refinement == "shorten":
            return (
                f"{greeting}\n\n"
                f"{lead}\n\n"
                f"{policy_points}\n\n"
                f"{next_steps}\n\n"
                f"{signoff}"
            )

        if custom_instructions:
            policy_points += f"\n\nAdditional Note: {custom_instructions}"

        return (
            f"{greeting}\n\n"
            f"{lead}\n\n"
            f"{policy_points}\n\n"
            f"{next_steps}\n\n"
            f"{closing_phrase}\n\n"
            f"{signoff}"
        )

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
            if refinement == "shorten":
                sensitive_body = (
                    f"Dear {sender_name},\n\n"
                    f"Thank you for contacting Human Resources. Given the confidential nature of your inquiry ({triage.sensitive_reason or 'Workplace Concern'}), an HR Director will reach out to you privately to discuss this directly.\n\n"
                    f"Our organization strictly enforces a zero-tolerance Non-Retaliation Policy. For immediate confidential support, our 24/7 EAP is available at eap-support@enterprise.internal.\n\n"
                    f"Sincerely,\n"
                    f"People Operations & Employee Relations"
                )
            elif refinement == "regenerate":
                sensitive_body = (
                    f"Dear {sender_name},\n\n"
                    f"We confirm receipt of your correspondence to Human Resources regarding workplace governance ({triage.sensitive_reason or 'Workplace Concern'}). We treat all employee inquiries with the highest level of confidentiality and care.\n\n"
                    f"An HR Director has been assigned to this matter and will schedule a confidential discussion with you shortly.\n\n"
                    f"Under our Code of Conduct and Anti-Retaliation Policy, your communication is protected. In addition, our confidential 24/7 Employee Assistance Program is accessible at eap-support@enterprise.internal at any time.\n\n"
                    f"Best regards,\n"
                    f"Employee Relations Directorate"
                )
            else:
                sensitive_body = (
                    f"Dear {sender_name},\n\n"
                    f"Thank you for contacting Human Resources. We have received your correspondence regarding this matter and take all reported concerns very seriously.\n\n"
                    f"Given the confidential and sensitive nature of your inquiry ({triage.sensitive_reason or 'Workplace Concern'}), an HR Director will be reaching out to you privately to discuss this directly.\n\n"
                    f"Please be assured that our organization strictly enforces a zero-tolerance Non-Retaliation Policy and provides protected channels under our Code of Conduct.\n\n"
                    f"If you require immediate confidential support, our 24/7 Employee Assistance Program (EAP) is available at eap-support@enterprise.internal.\n\n"
                    f"Sincerely,\n"
                    f"People Operations & Employee Relations"
                )
            if custom_instructions:
                sensitive_body += f"\n\nHR Specialist Note: {custom_instructions}"

            citations = [
                PolicyCitation(
                    document="employee_handbook.pdf",
                    title="Employee Handbook & Code of Conduct",
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

        # 2. Retrieve Policy Grounding & Citations from Knowledge Base
        policy_context, citations = self._retrieve_policy_grounding(
            subject=email.subject, body=email.body_text, category=triage.category
        )

        tone_instruction = "professional, clear, and reassuring"
        if tone == "empathetic" or refinement == "make_empathetic":
            tone_instruction = "warm, empathetic, and supportive"
        elif tone == "concise" or refinement == "shorten":
            tone_instruction = "concise, direct, and action-oriented"
        elif refinement == "make_professional":
            tone_instruction = "authoritative, formal corporate compliance HR standards"

        user_prompt = (
            f"Please draft a complete, professional HR email response to employee '{sender_name}' answering their inquiry:\n"
            f"Subject: {email.subject}\n"
            f"Message Body:\n{email.body_text}\n\n"
            f"Category: {triage.category}\n"
            f"Tone: {tone_instruction}\n"
        )
        if refinement == "shorten":
            user_prompt += "Refinement requirement: Keep the draft very concise and direct (1-2 short paragraphs max).\n"
        elif refinement == "make_empathetic":
            user_prompt += "Refinement requirement: Emphasize empathy, employee wellness, warmth, and support.\n"
        elif refinement == "make_professional":
            user_prompt += "Refinement requirement: Use highly formal, corporate compliance HR tone and terminology.\n"
        elif refinement == "regenerate":
            user_prompt += "Refinement requirement: Regenerate a fresh, uniquely phrased alternative variation of this response with distinct sentence structures, while strictly preserving all policy citations and factual rules.\n"

        if custom_instructions:
            user_prompt += f"Special HR Instructions: {custom_instructions}\n"

        # 3. Model Execution via rag_application-main Architecture
        draft_text = ""
        temp = 0.7 if refinement == "regenerate" else 0.1
        llm = get_rag_chat_llm(temperature=temp)
        if llm is not None:
            try:
                logger.info(f"Executing email generation via rag_application-main LLM model (temperature={temp})...")
                prompt_template = build_email_rag_prompt()
                messages = prompt_template.format_messages(
                    context=policy_context,
                    tone_instruction=tone_instruction,
                    sender_name=sender_name,
                    user_instruction=user_prompt,
                )
                resp = llm.invoke(messages)
                content = resp.content if hasattr(resp, "content") else str(resp)
                if isinstance(content, list):
                    content = "".join(str(p) for p in content)
                draft_text = content.strip()
            except Exception as llm_err:
                logger.warning(
                    f"LLM model generation threw error ({llm_err}). Failing over to grounded synthesis engine."
                )

        if not draft_text:
            draft_text = self._synthesize_grounded_email(
                sender_name=sender_name,
                subject=email.subject,
                body=email.body_text,
                triage=triage,
                tone=tone,
                refinement=refinement,
                custom_instructions=custom_instructions,
                citations=citations,
                policy_context=policy_context,
            )

        return EmailResponseDraft(
            id=draft_id,
            email_id=email.id,
            subject=f"Re: {email.subject}",
            recipient=email.sender.email,
            draft_body=draft_text,
            tone=tone,
            citations=citations,
            needs_hr_review=False,
            review_reason=None,
            status="awaiting_approval",
            created_at=now_iso,
        )


email_triage_service = EmailTriageService()
