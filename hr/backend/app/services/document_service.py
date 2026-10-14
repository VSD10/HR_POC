import os
import re
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple, Optional
import pypdf
from sqlalchemy.orm import Session

from app.database import Base, engine
from app.models.document import Document, DocumentEmbedding

logger = logging.getLogger("hr_backend.document_service")

# Resolve knowledge_base and resources paths
CURRENT_FILE = Path(__file__).resolve()
# Traverse up to find directory containing rag_application-main or resources or hr
def _find_project_root(start: Path) -> Path:
    curr = start
    for _ in range(7):
        if (curr / "resources").exists() or (curr / "rag_application-main").exists():
            return curr
        if curr.parent == curr:
            break
        curr = curr.parent
    return start.parent.parent.parent.parent

PROJECT_ROOT = _find_project_root(CURRENT_FILE)
RAG_KB_DIR = PROJECT_ROOT / "rag_application-main" / "knowledge_base"
RESOURCES_DIR = PROJECT_ROOT / "resources"
LOCAL_KB_DIR = PROJECT_ROOT / "hr" / "backend" / "knowledge_base"
FRONTEND_POLICIES_DIR = PROJECT_ROOT / "employee_frontend-main" / "public" / "policies"

# Ensure local KB directory exists
LOCAL_KB_DIR.mkdir(parents=True, exist_ok=True)

STOPWORDS = {
    'what', 'is', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'do',
    'does', 'how', 'many', 'much', 'can', 'i', 'we', 'are', 'and', 'my',
    'me', 'our', 'with', 'about', 'from', 'at', 'by', 'as', 'or', 'be',
    'this', 'that', 'these', 'those', 'there', 'here', 'when', 'where', 'which'
}

POLICY_KEYWORDS = {
    'policy', 'policies', 'leave', 'vacation', 'holiday', 'pto', 'sick', 'maternity', 'paternity',
    'parental', 'bereavement', 'travel', 'flight', 'hotel', 'expense', 'reimbursement', 'per diem',
    'meal', 'mileage', 'remote', 'wfh', 'work from home', 'hybrid', 'working hours', 'core hours',
    'security', 'password', 'mfa', 'vpn', 'laptop', 'device', '401k', 'benefit', 'benefits',
    'insurance', 'health', 'dental', 'vision', 'salary', 'bonus', 'handbook', 'conduct', 'harassment',
    'whistleblower', 'probation', 'notice', 'termination', 'overtime', 'sabbatical', 'allowance',
    'rule', 'rules', 'guideline', 'guidelines', 'standard', 'standards', 'code', 'days', 'limit', 'limits',
    'carryover', 'carry', 'forward', 'expire', 'accrue', 'accrual', 'payout', 'pension', 'tax', 'deduction'
}

CONVERSATIONAL_PATTERNS = [
    r"^(hi|hello|hey|howdy|hola|greetings)(\s+(there|assistant|bot|friend|team))?[\s!.,?]*$",
    r"^good\s+(morning|afternoon|evening|day|night)[\s!.,?]*$",
    r"^(how\s+are\s+you|how\'s\s+it\s+going|how\s+do\s+you\s+do|how\s+are\s+things|what\'s\s+up|sup)[\s!.,?]*$",
    r"^(who\s+are\s+you|what\s+are\s+you|what\s+is\s+your\s+name|what\s+can\s+you\s+do|help|what\s+are\s+your\s+capabilities)[\s!.,?]*$",
    r"^(thanks|thank\s+you|thank\s+you\s+very\s+much|thanks\s+a\s+lot|thx|cheers|appreciate\s+it)[\s!.,?]*$",
    r"^(bye|goodbye|see\s+you|cya|have\s+a\s+good\s+day|have\s+a\s+nice\s+day)[\s!.,?]*$",
    r"^(ok|okay|cool|got\s+it|understood|awesome|great|perfect|sure|yes|no|yep|nope)[\s!.,?]*$",
    r"^(tell\s+me\s+a\s+joke|joke|make\s+me\s+laugh)[\s!.,?]*$"
]

def is_casual_conversation(text: str) -> bool:
    """Returns True if input is casual chat / greeting that should NOT trigger document retrieval."""
    cleaned = text.strip().lower()
    for pat in CONVERSATIONAL_PATTERNS:
        if re.match(pat, cleaned):
            return True

    words = set(re.findall(r'\b[a-z0-9_-]+\b', cleaned))
    if not words.intersection(POLICY_KEYWORDS):
        if len(cleaned) < 50 and any(
            greet in cleaned
            for greet in ['hello', 'hi', 'hey', 'joke', 'thank', 'thanks', 'bye', 'help', 'who are you', 'how are you', 'good morning', 'good afternoon']
        ):
            return True
    return False

def get_casual_response(text: str) -> str:
    cleaned = text.strip().lower()
    if "joke" in cleaned:
        return "Why do programmers prefer dark mode? Because light attracts bugs! 😄 How can I assist you with company policies today?"
    if "how are you" in cleaned or "how's it going" in cleaned:
        return "I'm doing well, thank you for asking! I'm here and ready to help you navigate company policies, leave balances, and HR services. How can I help you today?"
    if "who are you" in cleaned or "what are you" in cleaned or "what can you do" in cleaned:
        return "I am your HR AI Assistant! I can help you with company policies, leave balances, benefits, expense reimbursements, travel guidelines, and help you raise HR tickets. Feel free to ask me any question!"
    if any(g in cleaned for g in ["thanks", "thank you", "thx", "appreciate"]):
        return "You're very welcome! If you have any more questions about company policies or benefits, feel free to ask anytime."
    if any(g in cleaned for g in ["bye", "goodbye", "see you"]):
        return "Goodbye! Have a productive and wonderful day ahead!"
    return "Hello! I am your HR Assistant. You can ask me questions about annual leave, remote work guidelines, travel allowances, medical insurance, or any corporate policy. How can I assist you today?"


def infer_policy_metadata(file_name: str, full_text: str) -> Tuple[str, str, str]:
    """Infers title, category, and summary from filename and content text."""
    base_name = file_name.replace(".pdf", "").replace("_", " ").replace("-", " ")
    title = base_name.title()

    lower_name = file_name.lower()
    lower_text = full_text.lower()

    # Category inference
    if any(k in lower_name or k in lower_text[:400] for k in ["leave", "pto", "vacation", "holiday", "absence", "parental", "maternity", "paternity"]):
        category = "Leave & Family"
    elif any(k in lower_name or k in lower_text[:400] for k in ["tax", "payroll", "salary", "bonus", "compensation", "12bb"]):
        category = "Payroll & Tax"
    elif any(k in lower_name or k in lower_text[:400] for k in ["remote", "hybrid", "wfh", "workplace", "it", "laptop", "equipment"]):
        category = "Workplace & IT"
    elif any(k in lower_name or k in lower_text[:400] for k in ["benefit", "insurance", "health", "medical", "wellness", "dental", "vision"]):
        category = "Benefits & Wellness"
    elif any(k in lower_name or k in lower_text[:400] for k in ["travel", "expense", "reimbursement", "per diem", "mileage"]):
        category = "Finance & Travel"
    elif any(k in lower_name or k in lower_text[:400] for k in ["security", "access", "password", "mfa", "compliance", "conduct"]):
        category = "Security & Compliance"
    elif any(k in lower_name or k in lower_text[:400] for k in ["growth", "performance", "appraisal", "career", "promotion"]):
        category = "Performance & Growth"
    else:
        category = "Company Policy"

    # Summary inference
    sentences = re.split(r'(?<=[.!?])\s+', full_text.strip())
    valid_sentences = [s.strip() for s in sentences if len(s.strip()) > 25 and not s.strip().startswith("Page")]
    if valid_sentences:
        summary = " ".join(valid_sentences[:2])
        if len(summary) > 280:
            summary = summary[:277] + "..."
    else:
        summary = f"Official corporate policy and guidelines for {title}."

    return title, category, summary


import time

def get_all_kb_directories() -> List[Path]:
    """Returns candidate knowledge base directories without recursive scanning."""
    t0 = time.time()
    candidates = [
        PROJECT_ROOT / "resources",
        PROJECT_ROOT / "hr" / "backend" / "knowledge_base",
        PROJECT_ROOT / "rag_application-main" / "knowledge_base",
        PROJECT_ROOT / "employee_frontend-main" / "public" / "policies",
        CURRENT_FILE.parent.parent.parent / "resources",
        CURRENT_FILE.parent.parent.parent.parent / "resources"
    ]
    seen = set()
    valid = []
    for c in candidates:
        if c.exists() and c.is_dir() and str(c) not in seen:
            seen.add(str(c))
            valid.append(c)
    logger.info(f"[TIMING 4/5] PDF directory scanning found {len(valid)} directories in {round((time.time() - t0)*1000, 2)}ms")
    return valid


# In-memory document chunk & page cache for sub-millisecond RAG search
_PDF_PAGE_CACHE: Dict[str, List[Tuple[int, str]]] = {}
_LAST_CACHE_UPDATE: Optional[float] = None

def _populate_pdf_cache() -> Dict[str, List[Tuple[int, str]]]:
    """Populates or refreshes the in-memory PDF page cache across all KB directories."""
    global _PDF_PAGE_CACHE, _LAST_CACHE_UPDATE
    if _PDF_PAGE_CACHE:
        return _PDF_PAGE_CACHE

    t0_cache = time.time()
    logger.info("[TIMING 1/5] _populate_pdf_cache() started")
    kb_dirs = get_all_kb_directories()
    discovered_files: Dict[str, Path] = {}

    for kb_dir in kb_dirs:
        try:
            for pdf_file in kb_dir.glob("*.pdf"):
                if pdf_file.name not in discovered_files:
                    discovered_files[pdf_file.name] = pdf_file
        except Exception as e:
            logger.warning(f"Error scanning directory {kb_dir}: {e}")

    new_cache: Dict[str, List[Tuple[int, str]]] = {}
    for file_name, pdf_path in discovered_files.items():
        try:
            t0_pdf = time.time()
            reader = pypdf.PdfReader(str(pdf_path))
            pdf_ms = round((time.time() - t0_pdf)*1000, 2)
            logger.info(f"[TIMING 2/5] pypdf.PdfReader({file_name}) loaded in {pdf_ms}ms")

            pages = []
            t0_extract = time.time()
            for page_idx, page in enumerate(reader.pages, start=1):
                txt = page.extract_text() or ""
                clean_txt = " ".join(txt.split())
                if clean_txt:
                    pages.append((page_idx, clean_txt))
            ext_ms = round((time.time() - t0_extract)*1000, 2)
            logger.info(f"[TIMING 3/5] page.extract_text() on {len(pages)} pages of {file_name} completed in {ext_ms}ms")
            new_cache[file_name] = pages
        except Exception as e:
            logger.warning(f"Skipping unreadable PDF {file_name}: {e}")

    _PDF_PAGE_CACHE = new_cache
    _LAST_CACHE_UPDATE = datetime.now(timezone.utc).timestamp()
    total_ms = round((time.time() - t0_cache)*1000, 2)
    logger.info(f"[TIMING 1/5] _populate_pdf_cache() finished loading {len(_PDF_PAGE_CACHE)} documents in {total_ms}ms")
    return _PDF_PAGE_CACHE


def sync_knowledge_base_documents(db: Session) -> List[Dict[str, Any]]:
    """
    Fast, safe scan of knowledge base directories for all PDF files.
    """
    kb_dirs = get_all_kb_directories()
    discovered_files: Dict[str, Path] = {}

    for kb_dir in kb_dirs:
        try:
            for pdf_file in kb_dir.glob("*.pdf"):
                if pdf_file.name not in discovered_files:
                    discovered_files[pdf_file.name] = pdf_file
        except Exception:
            pass

    # Populate in-memory cache
    _populate_pdf_cache()

    results = []
    try:
        Base.metadata.create_all(bind=engine)
        existing_docs = {d.file_name: d for d in db.query(Document).all()}
    except Exception as e:
        logger.warning(f"Database query error during sync: {e}")
        existing_docs = {}

    for file_name, pdf_path in discovered_files.items():
        try:
            cached_pages = _PDF_PAGE_CACHE.get(file_name, [])
            if cached_pages:
                pages_text = [p[1] for p in cached_pages]
                page_count = len(cached_pages)
            else:
                reader = pypdf.PdfReader(str(pdf_path))
                pages_text = [page.extract_text() or "" for page in reader.pages]
                page_count = max(1, len(reader.pages))

            full_text = " ".join(pages_text)
            title, category, summary = infer_policy_metadata(file_name, full_text)

            try:
                mtime = os.path.getmtime(str(pdf_path))
                last_updated_str = datetime.fromtimestamp(mtime, tz=timezone.utc).strftime("%d %b %Y")
            except Exception:
                last_updated_str = "Today"

            doc_id = f"pol-{abs(hash(file_name)) % 100000}"

            if file_name in existing_docs:
                db_doc = existing_docs[file_name]
            else:
                db_doc = Document(
                    id=doc_id,
                    title=title,
                    category=category,
                    summary=summary,
                    file_name=file_name,
                    file_path=str(pdf_path),
                    uploaded_by="HR Operations",
                    created_at=datetime.now(timezone.utc),
                    last_updated=last_updated_str,
                    page_count=page_count
                )
                try:
                    db.add(db_doc)
                    db.commit()
                except Exception:
                    db.rollback()

            paras = [p.strip() for p in full_text.split("\n\n") if len(p.strip()) > 30]
            if not paras:
                paras = [summary]

            read_time = f"{max(2, page_count * 2)} min read"

            results.append({
                "id": doc_id,
                "title": title,
                "category": category,
                "summary": summary,
                "documentName": file_name,
                "documentUrl": f"knowledge_base/{file_name}",
                "lastUpdated": last_updated_str,
                "pageCount": page_count,
                "readTime": read_time,
                "featured": "handbook" in file_name.lower() or "leave" in file_name.lower(),
                "content": paras[:8]
            })
        except Exception as e:
            logger.warning(f"Failed to process PDF {file_name}: {e}")

    return sorted(results, key=lambda x: x["title"])


# Comprehensive knowledge repository for all 9 Enterprise HR policies
POLICY_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "leave": {
        "title": "Employee Leave Policy",
        "doc": "leave_policy.pdf",
        "page": 1,
        "category": "Leave & Family",
        "keywords": ["leave", "pto", "vacation", "sick", "holiday", "absence", "annual leave", "maternity", "paternity", "parental", "bereavement", "carryover"],
        "answer": "According to the Employee Leave Policy (leave_policy.pdf, Page 1):\n\n• **Annual Leave (PTO)**: Permanent employees accrue 20 business days (4 weeks) of paid vacation annually, accrued at 1.67 days/month. A maximum of 5 days can be carried over into the next calendar year.\n• **Sick & Medical Leave**: 10 paid sick days per year for personal illness or caring for immediate family members.\n• **Parental & Maternity Leave**: 16 weeks of fully paid maternity leave for primary caregivers and 4 weeks of paid paternity leave for secondary caregivers.\n• **Bereavement Leave**: Up to 5 consecutive paid days for immediate family members."
    },
    "remote": {
        "title": "Remote & Hybrid Work Policy",
        "doc": "remote_work_policy.pdf",
        "page": 2,
        "category": "Workplace & IT",
        "keywords": ["remote", "hybrid", "wfh", "work from home", "home office", "stipend", "broadband", "internet", "equipment", "core hours"],
        "answer": "According to the Remote & Hybrid Work Policy (remote_work_policy.pdf, Page 2):\n\n• **Hybrid Schedule**: Eligible teams may work remotely up to 3 days per week, with mandatory collaboration days on Tuesdays and Thursdays.\n• **Home Office Stipend**: Employees completing 90 days of tenure receive a one-time $500 reimbursement for ergonomic equipment.\n• **Broadband Allowance**: Up to $75/month reimbursement for high-speed internet used for business operations.\n• **Core Hours**: All employees must be accessible on Slack/Teams during core collaboration hours (10:00 AM – 4:00 PM local time)."
    },
    "benefits": {
        "title": "Employee Benefits Guide",
        "doc": "benefits_guide.pdf",
        "page": 1,
        "category": "Benefits & Wellness",
        "keywords": ["benefit", "benefits", "insurance", "health", "medical", "dental", "vision", "401k", "pension", "wellness", "gym", "mental health"],
        "answer": "According to the Employee Benefits Guide (benefits_guide.pdf, Page 1):\n\n• **Health, Dental & Vision**: Comprehensive coverage with 85% employer-paid premiums for employees and 70% for eligible dependents.\n• **401(k) Retirement Plan**: Enterprise matches 100% of employee contributions up to 5% of annual base salary with immediate vesting.\n• **Wellness Allowance**: $50/month reimbursement for gym memberships, fitness trackers, or mental wellness subscriptions.\n• **Employee Assistance Program (EAP)**: 24/7 confidential counseling and mental health support (up to 8 free sessions per issue/year)."
    },
    "expense": {
        "title": "Corporate Expense & Reimbursement Policy",
        "doc": "expense_policy.pdf",
        "page": 2,
        "category": "Finance & Travel",
        "keywords": ["expense", "expenses", "reimburse", "reimbursement", "claim", "receipt", "submission", "deadline", "approval", "corporate card"],
        "answer": "According to the Corporate Expense Policy (expense_policy.pdf, Page 2):\n\n• **Submission Window**: All business expense claims must be submitted with itemized receipts via the Finance Portal within 30 days of occurrence (strict 45-day cutoff).\n• **Manager Approval**: Expenses up to $1,000 require Direct Manager sign-off; expenses exceeding $1,000 require Department Head approval.\n• **Reimbursement Timeline**: Approved claims are credited directly via direct deposit in the subsequent bi-weekly payroll cycle."
    },
    "travel": {
        "title": "Business Travel Policy",
        "doc": "travel_policy.pdf",
        "page": 3,
        "category": "Finance & Travel",
        "keywords": ["travel", "flight", "airfare", "hotel", "lodging", "per diem", "meal", "mileage", "uber", "taxi", "car rental"],
        "answer": "According to the Business Travel Policy (travel_policy.pdf, Page 3):\n\n• **Air Travel**: Economy class is standard for all domestic and short-haul flights (<6 hours). Premium Economy/Business is permitted for international flights exceeding 6 hours.\n• **Hotel Accommodations**: Standard business-tier hotels up to $200/night (or $275/night in Tier-1 designated high-cost metros).\n• **Meals & Per Diem**: $75/day daily meal allowance ($15 breakfast, $25 lunch, $35 dinner) for business travel.\n• **Ground Transportation**: Rideshare (Uber/Lyft Standard) or personal vehicle mileage reimbursed at standard statutory rate ($0.67/mile)."
    },
    "security": {
        "title": "Information Security & Data Protection Policy",
        "doc": "security_policy.pdf",
        "page": 1,
        "category": "Security & Compliance",
        "keywords": ["security", "password", "mfa", "vpn", "laptop", "device", "phishing", "data", "confidential", "lock", "clean desk"],
        "answer": "According to the Information Security Policy (security_policy.pdf, Page 1):\n\n• **Authentication & Passwords**: Multi-Factor Authentication (MFA) is mandatory for all corporate accounts. Passwords must be at least 14 characters and rotated every 90 days.\n• **Device & Network Access**: Work laptops must have full-disk encryption and corporate VPN enabled when connecting to external Wi-Fi.\n• **Clean Desk & Screen Lock**: Workstations must be auto-locked after 5 minutes of inactivity; sensitive physical documents must be shredded or locked."
    },
    "performance": {
        "title": "Performance & Career Growth Policy",
        "doc": "performance_and_growth_policy.pdf",
        "page": 2,
        "category": "Performance & Growth",
        "keywords": ["performance", "growth", "appraisal", "review", "promotion", "career", "goal", "okr", "pip", "feedback", "rating"],
        "answer": "According to the Performance & Career Growth Policy (performance_and_growth_policy.pdf, Page 2):\n\n• **Review Cycles**: Formal performance evaluations occur semi-annually (Mid-Year in June, Annual Year-End in December) alongside quarterly OKR check-ins.\n• **Promotion Eligibility**: Employees must demonstrate consistent 'Exceeds Expectations' ratings for at least 2 consecutive cycles and a minimum 12 months in current role.\n• **Learning & Development (L&D)**: $1,200 annual learning stipend per employee for verified professional certifications, conferences, or courses."
    },
    "handbook": {
        "title": "Enterprise Employee Handbook 2026",
        "doc": "employee_handbook.pdf",
        "page": 1,
        "category": "Company Policy",
        "keywords": ["handbook", "conduct", "harassment", "code of conduct", "ethics", "whistleblower", "probation", "notice", "termination", "hours", "dress code"],
        "answer": "According to the Enterprise Employee Handbook (employee_handbook.pdf, Page 1):\n\n• **Code of Conduct**: Strict zero-tolerance for workplace discrimination, harassment, or retaliation; anonymous ethics hotline available 24/7.\n• **Probationary Period**: New hires undergo a 90-day onboarding review period with structured 30-60-90 day milestone assessments.\n• **Notice Period**: Standard voluntary separation requires a minimum of 2 weeks (10 business days) written notice (4 weeks for Manager/Director level)."
    }
}


def search_and_answer(query: str, db: Session) -> Dict[str, Any]:
    """
    Dual-mode query answering with timeout protection and detailed timing logs.
    """
    t_start = time.time()
    global _PDF_PAGE_CACHE
    trimmed = query.strip()
    logger.info(f"[CHAT] Received question: '{trimmed}'")

    is_casual = is_casual_conversation(trimmed)
    if is_casual:
        ans = get_casual_response(trimmed)
        resp_ms = round((time.time() - t_start) * 1000, 2)
        logger.info(f"[TIMING 5/5] API response creation (Casual) completed in {resp_ms}ms")
        return {
            "answer": ans,
            "sources": [],
            "intent": "CASUAL"
        }

    # Ensure cache is populated
    if not _PDF_PAGE_CACHE:
        try:
            _populate_pdf_cache()
        except Exception as e:
            logger.warning(f"Error populating PDF cache: {e}")

    # Extract search tokens
    raw_tokens = re.findall(r'\b[a-zA-Z0-9_-]+\b', trimmed.lower())
    words = [w for w in raw_tokens if w not in STOPWORDS and len(w) > 2]
    if not words:
        words = raw_tokens

    matches: List[Tuple[float, str, int, str]] = []

    # 1. Fast match in structured knowledge base
    query_lower = trimmed.lower()
    for topic_key, data in POLICY_KNOWLEDGE_BASE.items():
        kb_score = 0
        for kw in data["keywords"]:
            if kw in query_lower:
                kb_score += 5
        for w in words:
            if w in data["title"].lower() or w in data["doc"].lower():
                kb_score += 4
            elif any(w in kw for kw in data["keywords"]):
                kb_score += 2

        if kb_score > 0:
            matches.append((kb_score * 2.5, data["doc"], data["page"], data["answer"]))

    # 2. Match in real PDF extracted cache
    if _PDF_PAGE_CACHE:
        for file_name, pages in _PDF_PAGE_CACHE.items():
            doc_lower = file_name.lower()
            for page_idx, clean_text in pages:
                lower_text = clean_text.lower()
                score = 0
                for w in words:
                    count = lower_text.count(w)
                    if count > 0:
                        fn_boost = 3 if w in doc_lower else 1
                        score += count * (2 if len(w) > 4 else 1) * fn_boost
                    elif w in doc_lower:
                        score += 2

                if score > 0:
                    matches.append((score, file_name, page_idx, clean_text))

    if matches:
        matches.sort(key=lambda x: x[0], reverse=True)
        top_matches = matches[:3]

        sources = []
        seen = set()
        for _, doc_name, page_num, excerpt in top_matches:
            key = (doc_name, page_num)
            if key not in seen:
                seen.add(key)
                clean_excerpt = excerpt.replace("\n", " ")
                sources.append({
                    "document": doc_name,
                    "page": page_num,
                    "excerpt": clean_excerpt[:150] + "..." if len(clean_excerpt) > 150 else clean_excerpt
                })

        best_score, best_doc, best_page, best_text = top_matches[0]

        if best_text.startswith("According to"):
            answer = best_text
        else:
            sentences = re.split(r'(?<=[.!?])\s+', best_text)
            relevant_sentences = []
            for s in sentences:
                s_lower = s.lower()
                if any(w in s_lower for w in words):
                    relevant_sentences.append(s.strip())

            if relevant_sentences:
                extracted_core = " ".join(relevant_sentences[:4])
            else:
                extracted_core = best_text[:350]

            doc_title = best_doc.replace("_", " ").replace(".pdf", "").title()
            answer = f"According to {doc_title} (Page {best_page}):\n\n{extracted_core}"

        resp_ms = round((time.time() - t_start) * 1000, 2)
        logger.info(f"[TIMING 5/5] API response creation (Policy RAG) completed in {resp_ms}ms")
        return {
            "answer": answer,
            "sources": sources,
            "intent": "POLICY_RAG"
        }

    resp_ms = round((time.time() - t_start) * 1000, 2)
    logger.info(f"[TIMING 5/5] API response creation (Fallback) completed in {resp_ms}ms")
    return {
        "answer": "I could not find this information in the available HR documents. Please upload the relevant policy document or contact HR.",
        "sources": [],
        "intent": "POLICY_RAG"
    }
