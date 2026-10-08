import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from backend.integrations.gmail.client import gmail_client
from backend.integrations.gmail.oauth import oauth_manager
from backend.integrations.gmail.schemas import (
    ConnectedAccountSummary,
    EmailDetail,
    EmailSender,
    EmailSummary,
    GmailStatusResponse,
    SendEmailRequest,
    SendEmailResponse,
)

logger = logging.getLogger(__name__)

# Curated, realistic enterprise HR incoming inbox for instant evaluation & sandbox mode
SAMPLE_HR_EMAILS: List[Dict[str, Any]] = [
    {
        "id": "msg_hr_leave_001",
        "threadId": "thread_leave_001",
        "sender": {
            "name": "Alex Johnson",
            "email": "alex.johnson@enterprise.internal",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        },
        "recipient": "hr.desk@enterprise.internal",
        "subject": "Inquiry regarding Annual Leave allowance & year-end rollover policy",
        "snippet": "Hi HR Team, I am planning my vacation for November. Could you clarify how many days of annual leave I am entitled to...",
        "date": "Today, 09:15 AM",
        "timestamp": int(time.time() * 1000) - 3600000 * 2,
        "isRead": False,
        "isStarred": True,
        "labels": ["INBOX", "HR_LEAVE", "UNREAD"],
        "category": "Leave / Attendance",
        "status": "new",
        "is_sensitive": False,
        "bodyText": """Hi HR Team,

I hope you are doing well.

I am planning my vacation for November and wanted to double-check my remaining annual leave balance. Also, I have a quick question about unused leave: if I don't use all my annual leave before December 31st, how many days am I allowed to carry over into the next calendar year? Does the rollover expire if not used within a certain timeframe?

Thanks for your guidance!

Best regards,
Alex Johnson
Senior Software Engineer - Platform Team""",
        "bodyHtml": "<p>Hi HR Team,<br><br>I hope you are doing well.<br><br>I am planning my vacation for November and wanted to double-check my remaining annual leave balance. Also, I have a quick question about unused leave: if I don't use all my annual leave before December 31st, how many days am I allowed to carry over into the next calendar year? Does the rollover expire if not used within a certain timeframe?<br><br>Thanks for your guidance!<br><br>Best regards,<br><b>Alex Johnson</b><br>Senior Software Engineer - Platform Team</p>",
        "headers": {
            "Message-ID": "<alex.johnson.leave.001@enterprise.internal>",
        }
    },
    {
        "id": "msg_hr_payroll_002",
        "threadId": "thread_payroll_002",
        "sender": {
            "name": "David Miller",
            "email": "david.miller@enterprise.internal",
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        },
        "recipient": "payroll@enterprise.internal",
        "subject": "Discrepancy in October payslip tax deduction & bonus payout",
        "snippet": "Hello Payroll Specialists, I noticed that my latest payslip reflects an unexpected federal tax withholding increase...",
        "date": "Yesterday, 04:30 PM",
        "timestamp": int(time.time() * 1000) - 3600000 * 18,
        "isRead": False,
        "isStarred": False,
        "labels": ["INBOX", "PAYROLL"],
        "category": "Payroll",
        "status": "new",
        "is_sensitive": False,
        "bodyText": """Hello Payroll Specialists,

I noticed that my latest payslip reflects an unexpected tax withholding increase of approximately $340 compared to September, even though my base salary has not changed. Additionally, our Q3 performance milestone bonus does not appear on this cycle.

Could someone please review my payroll statement and let me know if a retroactive adjustment will be credited on the next cycle?

Thank you,
David Miller
Product Operations Lead""",
        "bodyHtml": "<p>Hello Payroll Specialists,<br><br>I noticed that my latest payslip reflects an unexpected tax withholding increase of approximately $340 compared to September, even though my base salary has not changed. Additionally, our Q3 performance milestone bonus does not appear on this cycle.<br><br>Could someone please review my payroll statement and let me know if a retroactive adjustment will be credited on the next cycle?<br><br>Thank you,<br><b>David Miller</b><br>Product Operations Lead</p>",
        "headers": {
            "Message-ID": "<david.miller.payroll.002@enterprise.internal>",
        }
    },
    {
        "id": "msg_hr_sensitive_003",
        "threadId": "thread_sensitive_003",
        "sender": {
            "name": "Confidential Employee",
            "email": "rachel.adams@enterprise.internal",
            "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
        },
        "recipient": "hr.director@enterprise.internal",
        "subject": "URGENT & CONFIDENTIAL: Formal complaint regarding workplace harassment and retaliation",
        "snippet": "Dear HR Management, I am writing to submit a formal and confidential complaint regarding repeated derogatory remarks...",
        "date": "Today, 08:05 AM",
        "timestamp": int(time.time() * 1000) - 3600000 * 3,
        "isRead": True,
        "isStarred": True,
        "labels": ["INBOX", "ESCALATED", "CONFIDENTIAL"],
        "category": "Sensitive / Escalation Required",
        "status": "escalated",
        "is_sensitive": True,
        "bodyText": """Dear HR Leadership,

I am writing to submit a formal, urgent, and strictly confidential grievance regarding ongoing hostile workplace behavior and targeted retaliation by my direct team manager over the past six weeks.

Following my refusal to sign off on an unvetted vendor agreement, I have been subjected to exclusion from team meetings, derogatory remarks about my professional capabilities, and veiled threats regarding my upcoming annual performance evaluation.

I request an immediate, private meeting with an HR Business Partner and assurance of protection under our company's Non-Retaliation Policy.

Sincerely,
Rachel Adams
Enterprise Architecture""",
        "bodyHtml": "<p>Dear HR Leadership,<br><br>I am writing to submit a formal, urgent, and strictly confidential grievance regarding ongoing hostile workplace behavior and targeted retaliation by my direct team manager over the past six weeks.<br><br>Following my refusal to sign off on an unvetted vendor agreement, I have been subjected to exclusion from team meetings, derogatory remarks about my professional capabilities, and veiled threats regarding my upcoming annual performance evaluation.<br><br>I request an immediate, private meeting with an HR Business Partner and assurance of protection under our company's Non-Retaliation Policy.<br><br>Sincerely,<br><b>Rachel Adams</b><br>Enterprise Architecture</p>",
        "headers": {
            "Message-ID": "<rachel.adams.sensitive.003@enterprise.internal>",
        }
    },
    {
        "id": "msg_hr_remote_004",
        "threadId": "thread_remote_004",
        "sender": {
            "name": "Maya Lin",
            "email": "maya.lin@enterprise.internal",
            "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
        },
        "recipient": "hr.desk@enterprise.internal",
        "subject": "Home office ergonomic setup stipend & hybrid attendance rules",
        "snippet": "Hello People Operations, Can you please clarify whether full-time remote employees qualify for the ergonomic equipment reimbursement...",
        "date": "Oct 28, 11:20 AM",
        "timestamp": int(time.time() * 1000) - 3600000 * 24,
        "isRead": True,
        "isStarred": False,
        "labels": ["INBOX", "BENEFITS"],
        "category": "Benefits",
        "status": "new",
        "is_sensitive": False,
        "bodyText": """Hello People Operations,

Can you please clarify whether full-time remote employees qualify for the annual $500 home office equipment stipend? I would like to purchase an ergonomic standing desk and dual monitor arm.

Also, what is the required documentation and timeline to submit receipts through the expense portal?

Warm regards,
Maya Lin
UX Research Lead""",
        "bodyHtml": "<p>Hello People Operations,<br><br>Can you please clarify whether full-time remote employees qualify for the annual $500 home office equipment stipend? I would like to purchase an ergonomic standing desk and dual monitor arm.<br><br>Also, what is the required documentation and timeline to submit receipts through the expense portal?<br><br>Warm regards,<br><b>Maya Lin</b><br>UX Research Lead</p>",
        "headers": {
            "Message-ID": "<maya.lin.remote.004@enterprise.internal>",
        }
    },
    {
        "id": "msg_hr_travel_005",
        "threadId": "thread_travel_005",
        "sender": {
            "name": "Marcus Vance",
            "email": "marcus.vance@enterprise.internal",
            "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        },
        "recipient": "hr.travel@enterprise.internal",
        "subject": "Per-diem meal allowance & client dinner expense policy guidelines",
        "snippet": "Hi HR & Finance, I am traveling to the Chicago regional summit next week. Could you confirm the maximum allowable per-diem rate...",
        "date": "Oct 27, 02:45 PM",
        "timestamp": int(time.time() * 1000) - 3600000 * 48,
        "isRead": True,
        "isStarred": False,
        "labels": ["INBOX", "POLICY"],
        "category": "HR Policy",
        "status": "new",
        "is_sensitive": False,
        "bodyText": """Hi HR & Travel Desk,

I am traveling to the Chicago Regional Client Summit next Tuesday through Thursday. Could you please confirm the daily meal per-diem limit for Tier-1 metropolitan areas?

Additionally, if I host an evening dinner with prospective enterprise clients, does that fall under standard per-diem or the Client Entertainment Expense section with itemized receipts?

Thanks!
Marcus Vance
Strategic Account Executive""",
        "bodyHtml": "<p>Hi HR & Travel Desk,<br><br>I am traveling to the Chicago Regional Client Summit next Tuesday through Thursday. Could you please confirm the daily meal per-diem limit for Tier-1 metropolitan areas?<br><br>Additionally, if I host an evening dinner with prospective enterprise clients, does that fall under standard per-diem or the Client Entertainment Expense section with itemized receipts?<br><br>Thanks!<br><b>Marcus Vance</b><br>Strategic Account Executive</p>",
        "headers": {
            "Message-ID": "<marcus.vance.travel.005@enterprise.internal>",
        }
    }
]


class GmailService:
    """Orchestrates Gmail synchronization, email fetching, detail parsing, and reply dispatching."""

    def __init__(self):
        self.oauth = oauth_manager
        self.client = gmail_client
        self._in_memory_emails: Dict[str, Dict[str, Any]] = {e["id"]: dict(e) for e in SAMPLE_HR_EMAILS}
        self._drafts: Dict[str, Dict[str, Any]] = {}

    def get_auth_url(
        self,
        user_id: Optional[str] = None,
        user_name: Optional[str] = None,
        state: Optional[str] = None
    ) -> tuple[str, str]:
        """Returns OAuth authorization URL and mode ('live' or 'demo') for a specific HR specialist."""
        return self.oauth.get_authorization_url(user_id=user_id, user_name=user_name, state=state)

    def exchange_code(
        self,
        code: str,
        state: Optional[str] = None,
        user_id: Optional[str] = None,
        user_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Exchanges authorization code for credentials for a specific HR specialist."""
        return self.oauth.exchange_code_for_token(code, state=state, user_id=user_id, user_name=user_name)

    def get_status(self, user_id: Optional[str] = None) -> GmailStatusResponse:
        """Returns Gmail connection status for requested user or active mailbox, including all organization accounts."""
        creds = self.oauth.get_credentials(user_id=user_id)
        is_conf = self.oauth.is_configured()
        raw_accounts = self.oauth.list_accounts()
        account_summaries = [
            ConnectedAccountSummary(
                user_id=acc["user_id"],
                user_name=acc.get("user_name"),
                email=acc["email"],
                display_name=acc["display_name"],
                mode=acc.get("mode", "live"),
                connected_at=acc.get("connected_at", ""),
                is_active=acc.get("is_active", False)
            )
            for acc in raw_accounts
        ]
        tokens = self.oauth._read_tokens()
        active_id = tokens.get("active_account_id")
        last_err = getattr(self.client, "last_api_error", None)
        err_msg = last_err.get("message") if last_err else None
        enable_url = last_err.get("enable_url") if last_err else None

        if not creds:
            return GmailStatusResponse(
                connected=False,
                mode="live" if is_conf else "demo",
                is_oauth_configured=is_conf,
                user_id=user_id,
                accounts=account_summaries,
                active_account_id=active_id,
                api_error=err_msg,
                api_enable_url=enable_url
            )

        return GmailStatusResponse(
            connected=True,
            email=creds.get("email"),
            display_name=creds.get("display_name"),
            connected_at=creds.get("connected_at"),
            mode=creds.get("mode", "live"),
            scopes=creds.get("scopes", []),
            is_oauth_configured=is_conf,
            user_id=creds.get("user_id") or user_id,
            accounts=account_summaries,
            active_account_id=active_id,
            api_error=err_msg,
            api_enable_url=enable_url
        )

    def list_accounts(self) -> List[ConnectedAccountSummary]:
        """Lists all connected HR accounts in the organization."""
        raw_accounts = self.oauth.list_accounts()
        return [
            ConnectedAccountSummary(
                user_id=acc["user_id"],
                user_name=acc.get("user_name"),
                email=acc["email"],
                display_name=acc["display_name"],
                mode=acc.get("mode", "live"),
                connected_at=acc.get("connected_at", ""),
                is_active=acc.get("is_active", False)
            )
            for acc in raw_accounts
        ]

    def switch_account(self, user_id: str) -> bool:
        """Switches active HR mailbox."""
        return self.oauth.set_active_account(user_id)

    def disconnect(self, user_id: Optional[str] = None) -> bool:
        """Disconnects a specific HR specialist's mailbox."""
        return self.oauth.disconnect(user_id=user_id)

    def list_emails(
        self,
        category: Optional[str] = None,
        unread_only: bool = False,
        search_query: Optional[str] = None,
        max_results: int = 20,
        limit: Optional[int] = None,
    ) -> List[EmailSummary]:
        """Lists incoming emails from live Gmail or fallback sandbox store."""
        effective_limit = limit or max_results
        status = self.get_status()

        # If connected to live Google OAuth and not demo mode, attempt real Gmail fetch
        if status.connected and status.mode == "live":
            try:
                raw_messages = self.client.list_messages(query=search_query, max_results=effective_limit)
                if getattr(self.client, "last_api_error", None) is None:
                    # Successful Gmail API call! Return real mailbox messages
                    live_summaries: List[EmailSummary] = []
                    for stub in raw_messages:
                        msg_id = stub.get("id")
                        if not msg_id:
                            continue
                        full_msg = self.client.get_message(msg_id)
                        if full_msg:
                            # Cache into in-memory store
                            self._in_memory_emails[msg_id] = full_msg
                            live_summaries.append(
                                EmailSummary(
                                    id=full_msg["id"],
                                    thread_id=full_msg["threadId"],
                                    sender=EmailSender(**full_msg["sender"]),
                                    recipient=full_msg["recipient"],
                                    subject=full_msg["subject"],
                                    snippet=full_msg["snippet"],
                                    date=full_msg["date"],
                                    timestamp=full_msg["timestamp"],
                                    is_read=full_msg.get("isRead", False),
                                    labels=full_msg.get("labels", []),
                                    category=full_msg.get("category"),
                                    status=full_msg.get("status", "new"),
                                    is_sensitive=full_msg.get("is_sensitive", False),
                                )
                            )
                    return self._filter_summaries(live_summaries, category, unread_only, search_query)
            except Exception as e:
                logger.warning(f"Live Gmail fetch failed, falling back to cached messages: {e}")

        # Sandbox / Local Synced Store
        summaries: List[EmailSummary] = []
        for msg in self._in_memory_emails.values():
            summaries.append(
                EmailSummary(
                    id=msg["id"],
                    thread_id=msg["threadId"],
                    sender=EmailSender(**msg["sender"]),
                    recipient=msg["recipient"],
                    subject=msg["subject"],
                    snippet=msg["snippet"],
                    date=msg["date"],
                    timestamp=msg["timestamp"],
                    is_read=msg.get("isRead", True),
                    labels=msg.get("labels", []),
                    category=msg.get("category"),
                    status=msg.get("status", "new"),
                    is_sensitive=msg.get("is_sensitive", False),
                )
            )

        # Sort by timestamp descending
        summaries.sort(key=lambda s: s.timestamp, reverse=True)
        return self._filter_summaries(summaries, category, unread_only, search_query)

    def _filter_summaries(
        self,
        summaries: List[EmailSummary],
        category: Optional[str],
        unread_only: bool,
        search_query: Optional[str]
    ) -> List[EmailSummary]:
        filtered = summaries
        if unread_only:
            filtered = [s for s in filtered if not s.is_read]
        if category and category != "All":
            filtered = [s for s in filtered if s.category and category.lower() in s.category.lower()]
        if search_query:
            q = search_query.lower()
            filtered = [
                s for s in filtered
                if q in s.subject.lower() or q in s.snippet.lower() or q in s.sender.name.lower() or q in s.sender.email.lower()
            ]
        return filtered

    def get_email_detail(self, email_id: str) -> Optional[EmailDetail]:
        """Fetches full email details and marks it as read."""
        msg = self._in_memory_emails.get(email_id)
        if not msg:
            # Try fetching from live Gmail
            status = self.get_status()
            if status.connected and status.mode == "live":
                msg = self.client.get_message(email_id)
                if msg:
                    self._in_memory_emails[email_id] = msg

        if not msg:
            return None

        # Mark read
        msg["isRead"] = True
        status = self.get_status()
        if status.connected and status.mode == "live":
            try:
                self.client.mark_as_read(email_id)
            except Exception as e:
                logger.warning(f"Failed to mark read on Gmail API: {e}")

        return EmailDetail(
            id=msg["id"],
            thread_id=msg["threadId"],
            sender=EmailSender(**msg["sender"]),
            recipient=msg["recipient"],
            subject=msg["subject"],
            snippet=msg["snippet"],
            date=msg["date"],
            timestamp=msg["timestamp"],
            is_read=True,
            labels=msg.get("labels", []),
            category=msg.get("category"),
            status=msg.get("status", "new"),
            is_sensitive=msg.get("is_sensitive", False),
            body_text=msg.get("bodyText", ""),
            body_html=msg.get("bodyHtml"),
            headers=msg.get("headers", {}),
            in_reply_to=msg.get("headers", {}).get("In-Reply-To"),
            references=msg.get("headers", {}).get("References"),
            draft=msg.get("draft"),
            triage=msg.get("triage"),
        )

    def save_email_draft(self, email_id: str, draft: Any):
        """Saves generated email response draft in memory for this email."""
        if email_id in self._in_memory_emails:
            draft_dict = draft.model_dump() if hasattr(draft, "model_dump") else (draft if isinstance(draft, dict) else draft.__dict__)
            self._in_memory_emails[email_id]["draft"] = draft_dict
            self._in_memory_emails[email_id]["has_draft"] = True
            self._in_memory_emails[email_id]["status"] = "draft_ready"

    def save_email_triage(self, email_id: str, triage: Any):
        """Saves triage metadata in memory for this email."""
        if email_id in self._in_memory_emails:
            triage_dict = triage.model_dump() if hasattr(triage, "model_dump") else (triage if isinstance(triage, dict) else triage.__dict__)
            self._in_memory_emails[email_id]["triage"] = triage_dict
            self._in_memory_emails[email_id]["category"] = getattr(triage, "category", None) or triage_dict.get("category")
            self._in_memory_emails[email_id]["is_sensitive"] = getattr(triage, "is_sensitive", False) or triage_dict.get("is_sensitive", False)
            self._in_memory_emails[email_id]["urgency"] = getattr(triage, "urgency", "Medium") or triage_dict.get("urgency", "Medium")
            self._in_memory_emails[email_id]["status"] = "analyzed"

    def update_email_status(self, email_id: str, status: str, category: Optional[str] = None):
        """Updates internal status (e.g. 'analyzed', 'draft_ready', 'sent', 'escalated')."""
        if email_id in self._in_memory_emails:
            self._in_memory_emails[email_id]["status"] = status
            if category:
                self._in_memory_emails[email_id]["category"] = category

    def send_reply(self, email_id: str, request: SendEmailRequest, user_id: Optional[str] = None) -> SendEmailResponse:
        """Sends HR-approved response through connected Gmail account for specific HR specialist."""
        if not request.approved_by_hr:
            raise ValueError("Email response requires explicit HR human approval before sending.")

        detail = self.get_email_detail(email_id)
        if not detail:
            raise KeyError(f"Email {email_id} not found.")

        status = self.get_status(user_id=user_id)
        if not status.connected:
            if not self.oauth.is_configured():
                self.oauth.exchange_code_for_token("demo_auth_code_hr_specialist", user_id=user_id)
                status = self.get_status(user_id=user_id)
            else:
                raise RuntimeError(f"Gmail account for HR user '{user_id or 'active'}' is not connected.")

        thread_id = request.thread_id or detail.thread_id
        original_msg_id = detail.headers.get("Message-ID")

        sent_msg_id = f"sent_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        if status.mode == "live":
            # Send through live Google Gmail API
            logger.info(f"Sending live email reply to {request.to} via Gmail API")
            live_result = self.client.send_message(
                to=request.to,
                subject=request.subject,
                body=request.body,
                thread_id=thread_id,
                in_reply_to=original_msg_id,
                references=original_msg_id,
            )
            sent_msg_id = live_result.get("id", sent_msg_id)
        else:
            logger.info(f"[Sandbox Demo] Dispatched HR reply to {request.to} for thread {thread_id}")

        # Update email status to 'sent'
        self.update_email_status(email_id, "sent")

        return SendEmailResponse(
            success=True,
            message_id=sent_msg_id,
            thread_id=thread_id,
            sent_at=now_iso,
            recipient=request.to,
            status="sent",
        )


gmail_service = GmailService()
