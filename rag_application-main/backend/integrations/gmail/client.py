import base64
import email
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import html
import logging
import re
from typing import Any, Dict, List, Optional
import requests

from backend.integrations.gmail.oauth import oauth_manager

logger = logging.getLogger(__name__)

GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me"


class GmailClient:
    """REST API Client for Gmail operations."""

    def __init__(self):
        self.oauth = oauth_manager
        self.last_api_error: Optional[Dict[str, Any]] = None

    def _get_headers(self) -> Dict[str, str]:
        """Gets authorized headers with auto-refreshed token."""
        token = self.oauth.get_valid_access_token()
        if not token:
            raise RuntimeError("Gmail account is not connected or token expired.")
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    def list_messages(self, query: Optional[str] = None, max_results: int = 20) -> List[Dict[str, Any]]:
        """Lists message headers/stubs from Gmail inbox."""
        url = f"{GMAIL_API_BASE}/messages"
        params: Dict[str, Any] = {"maxResults": min(max_results, 50)}
        if query:
            params["q"] = query

        try:
            res = requests.get(url, headers=self._get_headers(), params=params, timeout=15)
            if res.ok:
                self.last_api_error = None
                return res.json().get("messages", [])

            err_text = res.text
            logger.error(f"Gmail list_messages failed: {err_text}")
            enable_url = None
            msg = "Failed to fetch Gmail inbox"
            try:
                err_data = res.json().get("error", {})
                msg = err_data.get("message", msg)
                for detail in err_data.get("details", []):
                    if "activationUrl" in detail.get("metadata", {}):
                        enable_url = detail["metadata"]["activationUrl"]
                    for link in detail.get("links", []):
                        if "activation" in link.get("description", "").lower() or "url" in link:
                            enable_url = link.get("url")
            except Exception:
                pass

            self.last_api_error = {
                "status_code": res.status_code,
                "message": msg,
                "enable_url": enable_url or "https://console.developers.google.com/apis/api/gmail.googleapis.com/overview"
            }
        except Exception as e:
            logger.error(f"Failed to query Gmail messages: {e}")
            self.last_api_error = {"status_code": 500, "message": str(e), "enable_url": None}
        return []

    def get_message(self, message_id: str) -> Optional[Dict[str, Any]]:
        """Fetches full email message object and parses content."""
        url = f"{GMAIL_API_BASE}/messages/{message_id}?format=full"
        try:
            res = requests.get(url, headers=self._get_headers(), timeout=15)
            if not res.ok:
                logger.error(f"Failed to fetch Gmail message {message_id}: {res.text}")
                return None
            data = res.json()
            return self._parse_gmail_message(data)
        except Exception as e:
            logger.error(f"Error fetching Gmail message {message_id}: {e}")
            return None

    def _parse_gmail_message(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Extracts sanitized sender, subject, date, bodyText, and bodyHtml from raw Gmail payload."""
        payload = raw.get("payload", {})
        headers_list = payload.get("headers", [])
        headers_map = {h.get("name", "").lower(): h.get("value", "") for h in headers_list}

        subject = headers_map.get("subject", "No Subject")
        from_header = headers_map.get("from", "Unknown Sender")
        to_header = headers_map.get("to", "")
        date_header = headers_map.get("date", "")
        message_id_header = headers_map.get("message-id", "")
        in_reply_to = headers_map.get("in-reply-to")
        references = headers_map.get("references")

        # Parse sender name and email
        sender_name, sender_email = self._parse_address(from_header)

        # Extract body text and html
        body_text, body_html = self._extract_body(payload)

        # Timestamp
        internal_date = int(raw.get("internalDate", "0"))
        labels = raw.get("labelIds", [])
        is_unread = "UNREAD" in labels

        return {
            "id": raw.get("id"),
            "threadId": raw.get("threadId"),
            "sender": {
                "name": sender_name,
                "email": sender_email,
            },
            "recipient": to_header,
            "subject": subject,
            "snippet": raw.get("snippet", ""),
            "date": date_header,
            "timestamp": internal_date,
            "isRead": not is_unread,
            "labels": labels,
            "bodyText": body_text,
            "bodyHtml": body_html,
            "headers": {
                "Message-ID": message_id_header,
                "In-Reply-To": in_reply_to or "",
                "References": references or "",
            }
        }

    def _parse_address(self, addr: str) -> tuple[str, str]:
        """Splits 'John Doe <john@company.com>' into ('John Doe', 'john@company.com')."""
        match = re.search(r"^(.*?)\s*<([^>]+)>$", addr.strip())
        if match:
            name = match.group(1).strip().strip('"').strip("'")
            email_addr = match.group(2).strip()
            return name or email_addr.split("@")[0], email_addr
        return addr.split("@")[0], addr.strip()

    def _extract_body(self, payload: Dict[str, Any]) -> tuple[str, str]:
        """Recursively traverses Gmail MIME payload parts for text and HTML."""
        body_text = ""
        body_html = ""

        def decode_data(b64_str: str) -> str:
            try:
                # Gmail uses base64url encoding
                padding = 4 - (len(b64_str) % 4)
                if padding < 4:
                    b64_str += "=" * padding
                raw_bytes = base64.urlsafe_b64decode(b64_str)
                return raw_bytes.decode("utf-8", errors="replace")
            except Exception:
                return ""

        parts = [payload]
        while parts:
            part = parts.pop(0)
            mime_type = part.get("mimeType", "")
            data = part.get("body", {}).get("data")

            if data:
                decoded = decode_data(data)
                if "text/plain" in mime_type:
                    body_text += decoded
                elif "text/html" in mime_type:
                    body_html += decoded

            sub_parts = part.get("parts", [])
            if sub_parts:
                parts.extend(sub_parts)

        # Fallback if only HTML is available
        if not body_text and body_html:
            clean_text = re.sub(r"<[^>]+>", " ", body_html)
            body_text = html.unescape(clean_text).strip()

        return body_text.strip(), body_html.strip()

    def send_message(
        self,
        to: str,
        subject: str,
        body: str,
        thread_id: Optional[str] = None,
        in_reply_to: Optional[str] = None,
        references: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Builds RFC 2822 MIME message, encodes in base64url, and sends via Gmail API.
        Preserves thread context with In-Reply-To and References headers.
        """
        msg = MIMEMultipart("alternative")
        msg["To"] = to
        msg["Subject"] = subject if subject.startswith("Re:") else f"Re: {subject}"
        if in_reply_to:
            msg["In-Reply-To"] = in_reply_to
        if references:
            msg["References"] = references

        text_part = MIMEText(body, "plain", "utf-8")
        msg.attach(text_part)

        raw_bytes = msg.as_bytes()
        encoded_raw = base64.urlsafe_b64encode(raw_bytes).decode("ascii")

        payload: Dict[str, Any] = {"raw": encoded_raw}
        if thread_id:
            payload["threadId"] = thread_id

        url = f"{GMAIL_API_BASE}/messages/send"
        response = requests.post(url, headers=self._get_headers(), json=payload, timeout=20)
        if not response.ok:
            logger.error(f"Gmail send_message failed: {response.text}")
            raise RuntimeError(f"Failed to send email via Gmail API: {response.text}")

        return response.json()

    def mark_as_read(self, message_id: str) -> bool:
        """Removes the UNREAD label from a message."""
        url = f"{GMAIL_API_BASE}/messages/{message_id}/modify"
        payload = {"removeLabelIds": ["UNREAD"]}
        try:
            res = requests.post(url, headers=self._get_headers(), json=payload, timeout=10)
            return res.ok
        except Exception as e:
            logger.warning(f"Failed to mark message {message_id} as read: {e}")
            return False


gmail_client = GmailClient()
