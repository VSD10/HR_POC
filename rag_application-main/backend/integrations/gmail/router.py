import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import HTMLResponse, RedirectResponse

from backend.config import settings
from backend.integrations.gmail.oauth import oauth_manager
from backend.integrations.gmail.schemas import (
    EmailDetail,
    EmailResponseDraft,
    EmailSummary,
    EmailTriageResult,
    GenerateResponseRequest,
    GmailAuthResponse,
    GmailStatusResponse,
    SendEmailRequest,
    SendEmailResponse,
)
from backend.integrations.gmail.service import gmail_service
from backend.services.email_triage import email_triage_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gmail", tags=["Gmail & Email Triage"])


@router.get(
    "/auth-url",
    response_model=GmailAuthResponse,
    summary="Get Google OAuth Authorization URL",
)
async def get_auth_url(state: Optional[str] = Query(None)):
    """
    Returns the Google OAuth 2.0 authorization URL for connecting HR Gmail inbox.
    Falls back to interactive Sandbox/Demo flow if Google credentials are not yet configured.
    """
    auth_url, mode = gmail_service.get_auth_url(state=state)
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
    exchanges it for tokens, and securely stores credentials server-side.
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
        user_info = gmail_service.exchange_code(code)
        email = user_info.get("email", "connected")
        logger.info(f"Successfully authenticated Gmail account: {email}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/?gmail_connected=true&email={email}",
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
async def get_status():
    """Returns current connection status, connected email account, and active mode."""
    return gmail_service.get_status()


@router.post("/disconnect", summary="Disconnect Gmail Account")
async def disconnect():
    """Disconnects the active Gmail account and clears stored tokens."""
    oauth_manager.clear_credentials()
    return {"status": "disconnected", "message": "Gmail account disconnected successfully."}


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

    triage_result = email_triage_service.analyze_email(
        subject=detail.subject,
        body=detail.body_text,
    )

    new_status = "escalated" if triage_result.is_sensitive else "analyzed"
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

    draft = email_triage_service.generate_draft_response(
        email=detail,
        triage=triage_result,
        tone=request.tone or "professional",
        refinement=request.refinement,
        custom_instructions=request.custom_instructions,
    )

    gmail_service.update_email_status(email_id=email_id, status="draft_ready")
    return draft


@router.post(
    "/emails/{email_id}/reply",
    response_model=SendEmailResponse,
    summary="Send HR-Approved Email Reply",
)
async def send_email_reply(email_id: str, request: SendEmailRequest):
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
        response = gmail_service.send_reply(email_id=email_id, request=request)
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
