from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class GmailAuthResponse(BaseModel):
    """Returned when initiating OAuth flow."""
    auth_url: str = Field(..., description="Google OAuth authorization consent URL")
    mode: str = Field(default="live", description="'live' for real Google OAuth or 'demo' for sandbox")
    message: str = Field(default="", description="Status explanation")


class ConnectedAccountSummary(BaseModel):
    """Summary of a connected HR mailbox account."""
    user_id: str = Field(..., description="HR User ID or Identifier")
    user_name: Optional[str] = Field(None, description="HR Specialist Name")
    email: str = Field(..., description="Connected Gmail / Work email address")
    display_name: str = Field(..., description="Display name for outgoing emails")
    mode: str = Field(default="live", description="'live' | 'custom' | 'demo'")
    connected_at: str = Field(..., description="ISO timestamp of connection")
    is_active: bool = Field(default=False, description="Whether this is the currently active mailbox")


class GmailStatusResponse(BaseModel):
    """Current connection state for Gmail."""
    connected: bool = Field(..., description="Whether a valid token is present")
    email: Optional[str] = Field(None, description="Authorized Gmail address")
    display_name: Optional[str] = Field(None, description="User's display name")
    connected_at: Optional[str] = Field(None, description="ISO timestamp of connection")
    mode: str = Field(default="live", description="'live' (Google API) or 'demo' (sandbox) or 'custom'")
    scopes: List[str] = Field(default_factory=list, description="Authorized OAuth scopes")
    is_oauth_configured: bool = Field(default=False, description="Whether Google Client ID and Secret are configured")
    user_id: Optional[str] = Field(None, description="User ID associated with current status")
    accounts: List[ConnectedAccountSummary] = Field(default_factory=list, description="All connected HR mailboxes in organization")
    active_account_id: Optional[str] = Field(None, description="Currently selected active account ID")
    api_error: Optional[str] = Field(None, description="Error message from Google API if requests fail")
    api_enable_url: Optional[str] = Field(None, description="Google Cloud link to enable Gmail API")


class ConfigureOAuthRequest(BaseModel):
    """Payload to configure Google OAuth 2.0 client credentials via portal."""
    client_id: str = Field(..., description="Google OAuth 2.0 Client ID")
    client_secret: str = Field(..., description="Google OAuth 2.0 Client Secret")
    redirect_uri: Optional[str] = Field(None, description="Google OAuth 2.0 Redirect URI")


class ConnectCustomEmailRequest(BaseModel):
    """Payload to connect a custom or developer email."""
    email: str = Field(..., description="Email address to connect")
    display_name: Optional[str] = Field(default="HR Specialist", description="Display name for authorized sender")
    user_id: Optional[str] = Field(default=None, description="HR Specialist User ID (e.g. HR001)")
    user_name: Optional[str] = Field(default=None, description="HR Specialist Name")


class SwitchAccountRequest(BaseModel):
    """Payload to switch active HR mailbox context."""
    user_id: str = Field(..., description="Target HR User ID to activate")


class EmailSender(BaseModel):
    """Sender information."""
    name: str = Field(..., description="Sender display name")
    email: str = Field(..., description="Sender email address")
    avatar: Optional[str] = Field(None, description="Avatar image URL")


class EmailSummary(BaseModel):
    """Brief representation of an email for inbox listing."""
    id: str = Field(..., description="Message ID")
    thread_id: str = Field(..., description="Gmail Thread ID")
    sender: EmailSender
    recipient: str = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Subject line")
    snippet: str = Field(..., description="Preview snippet text")
    date: str = Field(..., description="Human-readable date/time")
    timestamp: int = Field(..., description="Unix timestamp in milliseconds")
    is_read: bool = Field(default=False)
    is_starred: bool = Field(default=False)
    labels: List[str] = Field(default_factory=list)
    category: Optional[str] = Field(default=None, description="Detected HR category")
    status: str = Field(
        default="new",
        description="Workflow status: 'new' | 'analyzed' | 'draft_ready' | 'awaiting_approval' | 'approved' | 'sent' | 'escalated'"
    )
    is_sensitive: bool = Field(default=False, description="Flagged for sensitive HR issues")


class EmailDetail(EmailSummary):
    """Full representation of an email including complete body and headers."""
    body_text: str = Field(..., description="Plain-text body content")
    body_html: Optional[str] = Field(None, description="Sanitized HTML body content")
    headers: Dict[str, str] = Field(default_factory=dict, description="Key headers")
    in_reply_to: Optional[str] = Field(None, description="In-Reply-To Message-ID")
    references: Optional[str] = Field(None, description="References header")
    draft: Optional[Any] = Field(None, description="Saved draft if generated")
    triage: Optional[Any] = Field(None, description="Saved triage if completed")


class PolicyCitation(BaseModel):
    """Grounded policy source citation."""
    document: str = Field(..., description="Policy document file name")
    title: str = Field(..., description="Human-readable policy title")
    page: int = Field(default=1, description="Page number")
    excerpt: str = Field(default="", description="Relevant policy excerpt")


class EmailTriageResult(BaseModel):
    """Automated AI classification and triage metadata."""
    category: str = Field(
        ...,
        description="HR Category: Leave / Attendance, Payroll, Benefits, HR Policy, Recruitment, Workplace Issue, Documentation, General HR, Sensitive / Escalation Required"
    )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0.0 - 1.0")
    urgency: str = Field(default="Medium", description="'Low' | 'Medium' | 'High' | 'Urgent'")
    is_sensitive: bool = Field(default=False, description="Whether topic requires legal/HR director review")
    sensitive_reason: Optional[str] = Field(None, description="Explanation if flagged as sensitive")
    requires_human_escalation: bool = Field(default=False)
    extracted_intent: str = Field(default="", description="Summary of employee's specific request or question")
    key_entities: List[str] = Field(default_factory=list, description="Key entities detected")
    policy_lookup_query: Optional[str] = Field(None, description="Refined query for policy search")


class EmailResponseDraft(BaseModel):
    """AI-generated editable response draft grounded in HR policies."""
    id: str = Field(..., description="Draft identifier")
    email_id: str = Field(..., description="Original email ID")
    subject: str = Field(..., description="Reply subject line")
    recipient: str = Field(..., description="Recipient email address")
    draft_body: str = Field(..., description="Editable AI-generated email body")
    tone: str = Field(default="professional", description="'professional' | 'empathetic' | 'concise'")
    citations: List[PolicyCitation] = Field(default_factory=list, description="Grounded policy citations")
    needs_hr_review: bool = Field(default=False, description="True if policy information was insufficient")
    review_reason: Optional[str] = Field(None, description="Reason if marked for HR review")
    status: str = Field(
        default="awaiting_approval",
        description="'draft_generated' | 'awaiting_approval' | 'approved' | 'escalated'"
    )
    created_at: str = Field(..., description="ISO creation timestamp")


class GenerateResponseRequest(BaseModel):
    """Parameters for response generation."""
    tone: Optional[str] = Field(default="professional", description="'professional' | 'empathetic' | 'concise'")
    refinement: Optional[str] = Field(
        default=None,
        description="'shorten' | 'make_empathetic' | 'make_professional' | 'regenerate'"
    )
    custom_instructions: Optional[str] = Field(default=None, description="Optional custom guidance from HR specialist")


class SendEmailRequest(BaseModel):
    """Payload to send an approved response through Gmail."""
    to: str = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Final approved email text")
    thread_id: Optional[str] = Field(None, description="Gmail thread ID to maintain thread continuity")
    message_id: Optional[str] = Field(None, description="Message ID being replied to")
    approved_by_hr: bool = Field(default=True, description="Mandatory explicit human approval affirmation")


class SendEmailResponse(BaseModel):
    """Result of sending email through Gmail."""
    success: bool
    message_id: str
    thread_id: str
    sent_at: str
    recipient: str
    status: str = "sent"
