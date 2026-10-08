import logging
import uuid
import time
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import HTMLResponse, RedirectResponse

from backend.config import settings
from backend.integrations.gmail.oauth import oauth_manager, GMAIL_SCOPES
from backend.integrations.gmail.schemas import (
    ConnectedAccountSummary,
    SwitchAccountRequest,
    EmailDetail,
    EmailResponseDraft,
    EmailSummary,
    EmailTriageResult,
    GenerateResponseRequest,
    GmailAuthResponse,
    GmailStatusResponse,
    ConnectCustomEmailRequest,
    ConfigureOAuthRequest,
    SendEmailRequest,
    SendEmailResponse,
)
from backend.integrations.gmail.service import gmail_service
from backend.services.email_triage import email_triage_service
from backend.services.telemetry_client import record_invocation_async

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gmail", tags=["Gmail & Email Triage"])


@router.get(
    "/auth-url",
    response_model=GmailAuthResponse,
    summary="Get Google OAuth Authorization URL",
)
async def get_auth_url(
    user_id: Optional[str] = Query(None, description="HR Specialist User ID"),
    user_name: Optional[str] = Query(None, description="HR Specialist Name"),
    state: Optional[str] = Query(None),
):
    """
    Returns the Google OAuth 2.0 authorization URL for connecting a specific HR specialist's Gmail inbox.
    Encodes user_id into OAuth state so multiple HR specialists can each connect their own accounts.
    """
    auth_url, mode = gmail_service.get_auth_url(user_id=user_id, user_name=user_name, state=state)
    message = (
        "Google OAuth ready for authorization."
        if mode == "live"
        else "Running in Demo Sandbox mode. Use demo code to simulate authorization."
    )
    return GmailAuthResponse(auth_url=auth_url, mode=mode, message=message)


@router.get("/callback", summary="Google OAuth Redirect Callback")
async def oauth_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
):
    """
    Receives authorization code from Google OAuth 2.0 consent screen,
    exchanges it for tokens, and securely stores credentials under that specific HR specialist.
    Redirects user back to HR Operations Portal.
    """
    if error:
        logger.warning(f"OAuth callback received error: {error}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/?gmail_error={error}",
            status_code=status.HTTP_302_FOUND,
        )

    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing 'code' query parameter in OAuth callback.",
        )

    try:
        user_info = gmail_service.exchange_code(code, state=state)
        email = user_info.get("email", "connected")
        user_id = user_info.get("user_id", "")
        logger.info(f"Successfully authenticated Gmail account: {email} for HR specialist: {user_id}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/?gmail_connected=true&email={email}&userId={user_id}",
            status_code=status.HTTP_302_FOUND,
        )
    except Exception as exc:
        logger.error(f"Failed to exchange OAuth authorization code: {exc}", exc_info=True)
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/?gmail_error=auth_exchange_failed",
            status_code=status.HTTP_302_FOUND,
        )


@router.get(
    "/status",
    response_model=GmailStatusResponse,
    summary="Get Gmail Connection Status",
)
async def get_status(user_id: Optional[str] = Query(None, description="HR Specialist User ID")):
    """Returns connection status for specified HR specialist or active organization mailbox."""
    return gmail_service.get_status(user_id=user_id)


@router.get(
    "/accounts",
    response_model=List[ConnectedAccountSummary],
    summary="List All Connected HR Mailboxes",
)
async def list_connected_accounts():
    """Returns all connected HR mailboxes across the organization."""
    return gmail_service.list_accounts()


@router.post(
    "/switch-active",
    summary="Switch Active HR Mailbox Context",
)
async def switch_active_account(request: SwitchAccountRequest):
    """Switches active HR mailbox context in the organization."""
    success = gmail_service.switch_account(request.user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account with ID '{request.user_id}' not found.",
        )
    return {
        "status": "switched",
        "active_account_id": request.user_id,
        "account": gmail_service.get_status(user_id=request.user_id),
    }


@router.post("/disconnect", summary="Disconnect Gmail Account")
async def disconnect(user_id: Optional[str] = Query(None, description="HR Specialist User ID to disconnect")):
    """Disconnects a specific HR specialist's Gmail account without affecting other team members."""
    gmail_service.disconnect(user_id=user_id)
    return {"status": "disconnected", "user_id": user_id, "message": "HR Mailbox disconnected successfully."}


@router.post(
    "/connect-custom",
    response_model=GmailStatusResponse,
    summary="Connect Custom HR Email Inbox",
)
async def connect_custom_email(request: ConnectCustomEmailRequest):
    """
    Connects a specific HR email address for a designated HR team member.
    """
    uid = (request.user_id or request.email).strip()
    name = (request.user_name or request.display_name or "HR Specialist").strip()
    token_payload = {
        "user_id": uid,
        "user_name": name,
        "access_token": f"custom_token_{uuid.uuid4().hex[:16]}",
        "refresh_token": f"custom_refresh_{uuid.uuid4().hex[:16]}",
        "token_type": "Bearer",
        "expires_in": 86400 * 30,
        "expires_at": int(time.time()) + (86400 * 30),
        "email": request.email.strip(),
        "display_name": (request.display_name or name),
        "connected_at": datetime.now(timezone.utc).isoformat(),
        "mode": "custom",
        "scopes": GMAIL_SCOPES,
    }
    oauth_manager.save_credentials(token_payload, user_id=uid)
    return gmail_service.get_status(user_id=uid)


@router.post("/configure-oauth", summary="Configure Google Cloud OAuth Credentials")
async def configure_oauth(request: ConfigureOAuthRequest):
    """
    Saves Google OAuth 2.0 client credentials (Client ID and Secret) directly from the portal,
    enabling live Google authorization and OAuth consent without modifying files on disk.
    """
    oauth_manager.save_oauth_config(
        client_id=request.client_id,
        client_secret=request.client_secret,
        redirect_uri=request.redirect_uri
    )
    return {
        "status": "configured",
        "is_configured": oauth_manager.is_configured(),
        "client_id_preview": f"{request.client_id[:8]}...{request.client_id[-6:]}" if len(request.client_id) > 16 else request.client_id,
        "message": "Google OAuth credentials updated and activated successfully."
    }


@router.post("/reset-oauth", summary="Reset Google OAuth Credentials")
async def reset_oauth():
    """Resets custom OAuth credentials and falls back to sandbox/demo mode."""
    oauth_manager.clear_oauth_config()
    return {"status": "reset", "is_configured": False, "message": "Google OAuth credentials reset successfully."}


@router.get(
    "/emails",
    response_model=List[EmailSummary],
    summary="List Incoming HR Emails",
)
async def list_emails(
    category: Optional[str] = Query(None, description="Filter by HR category"),
    search: Optional[str] = Query(None, description="Search query across subject and snippet"),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
):
    """
    Fetches inbox email summaries.
    Supports filtering by category, search text, and read status.
    """
    return gmail_service.list_emails(
        category=category,
        search_query=search,
        limit=limit,
        unread_only=unread_only,
    )


@router.get(
    "/emails/{email_id}",
    response_model=EmailDetail,
    summary="Get Email Detail",
)
async def get_email_detail(email_id: str):
    """Fetches full email message content and marks the email as read."""
    detail = gmail_service.get_email_detail(email_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email with ID '{email_id}' was not found.",
        )
    return detail


@router.post(
    "/emails/{email_id}/triage",
    response_model=EmailTriageResult,
    summary="Automated Email Triage & Policy Classification",
)
async def triage_email(email_id: str):
    """
    Analyzes email body and subject:
    - Categorizes into standard HR taxonomy
    - Detects sensitive topics (harassment, discrimination, legal escalation)
    - Extracts employee intent and key entities
    - Formulates policy search queries
    """
    detail = gmail_service.get_email_detail(email_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email with ID '{email_id}' was not found.",
        )

    t0 = time.time()
    triage_result = email_triage_service.analyze_email(
        subject=detail.subject,
        body=detail.body_text,
    )
    latency_ms = int((time.time() - t0) * 1000)

    record_invocation_async(
        service="AI Triage",
        model="intent-classifier",
        prompt_text=f"Triage email: {detail.subject}",
        response_text=f"Category: {triage_result.category} | Sensitivity: {triage_result.is_sensitive}",
        latency_ms=latency_ms,
        status="200_OK",
    )

    new_status = "escalated" if triage_result.is_sensitive else "analyzed"
    gmail_service.save_email_triage(email_id=email_id, triage=triage_result)
    gmail_service.update_email_status(
        email_id=email_id,
        status=new_status,
        category=triage_result.category,
    )

    return triage_result


@router.post(
    "/emails/{email_id}/draft",
    response_model=EmailResponseDraft,
    summary="Generate AI-Assisted Policy Grounded Response Draft",
)
async def generate_response_draft(
    email_id: str,
    request: GenerateResponseRequest = GenerateResponseRequest(),
):
    """
    Synthesizes an HR response draft grounded in official company policy documents:
    - Runs RAG retrieval against company policy vector store
    - Enforces appropriate tone (professional, empathetic, concise)
    - Incorporates citations with document names and page numbers
    - Flags sensitive topics for mandatory human escalation
    """
    detail = gmail_service.get_email_detail(email_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email with ID '{email_id}' was not found.",
        )

    triage_result = email_triage_service.analyze_email(
        subject=detail.subject,
        body=detail.body_text,
    )

    t0 = time.time()
    draft = email_triage_service.generate_draft_response(
        email=detail,
        triage=triage_result,
        tone=request.tone or "professional",
        refinement=request.refinement,
        custom_instructions=request.custom_instructions,
    )
    latency_ms = int((time.time() - t0) * 1000)

    record_invocation_async(
        service="Gmail Deliverables",
        model="gpt-4o",
        prompt_text=f"Draft HR reply for: {detail.subject}",
        response_text=draft.draft_body,
        latency_ms=latency_ms,
        status="200_OK",
    )

    gmail_service.save_email_draft(email_id=email_id, draft=draft)
    return draft


@router.post(
    "/emails/{email_id}/reply",
    response_model=SendEmailResponse,
    summary="Send HR-Approved Email Reply",
)
async def send_email_reply(
    email_id: str,
    request: SendEmailRequest,
    user_id: Optional[str] = Query(None, description="HR Specialist User ID dispatching reply"),
):
    """
    Dispatches final, human-approved email reply through connected Gmail account.
    Enforces mandatory human review affirmation before transmission.
    """
    if not request.approved_by_hr:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Human HR approval is strictly required before sending email responses.",
        )

    try:
        response = gmail_service.send_reply(email_id=email_id, request=request, user_id=user_id)
        return response
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email with ID '{email_id}' was not found.",
        )
    except RuntimeError as r_err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(r_err),
        )
    except Exception as exc:
        logger.error(f"Error sending email reply: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email reply: {str(exc)}",
        )
