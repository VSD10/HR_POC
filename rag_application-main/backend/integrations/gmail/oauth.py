import json
import logging
import time
import urllib.parse
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any
import requests

from backend.config import settings

logger = logging.getLogger(__name__)

GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


class OAuthManager:
    """Manages Google OAuth 2.0 flow, token exchange, and secure server-side persistence."""

    def __init__(self):
        self.storage_dir = settings.GMAIL_STORAGE_DIR
        self.storage_file = self.storage_dir / "gmail_tokens.json"
        self._ensure_storage()

    def _ensure_storage(self):
        """Ensures the storage directory and file exist."""
        try:
            self.storage_dir.mkdir(parents=True, exist_ok=True)
            if not self.storage_file.exists():
                self.storage_file.write_text("{}", encoding="utf-8")
        except Exception as e:
            logger.error(f"Failed to initialize token storage: {e}")

    def _read_tokens(self) -> Dict[str, Any]:
        """Reads raw token store."""
        try:
            if self.storage_file.exists():
                content = self.storage_file.read_text(encoding="utf-8").strip()
                if content:
                    return json.loads(content)
        except Exception as e:
            logger.error(f"Error reading token storage: {e}")
        return {}

    def _write_tokens(self, data: Dict[str, Any]):
        """Writes token store securely."""
        try:
            self.storage_file.write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception as e:
            logger.error(f"Error writing token storage: {e}")

    def is_configured(self) -> bool:
        """Returns True if real Google Client ID & Secret are set up."""
        return settings.is_google_oauth_configured()

    def get_authorization_url(self, state: Optional[str] = None) -> tuple[str, str]:
        """
        Builds Google OAuth 2.0 authorization URL.
        Returns: (auth_url, mode)
        """
        if not state:
            state = f"hr_state_{uuid.uuid4().hex[:12]}"

        if not self.is_configured():
            # Demo/Sandbox Mode: direct callback simulation with test code
            logger.info("Google OAuth credentials not configured in .env. Returning Demo OAuth URL.")
            demo_callback = f"/api/gmail/callback?code=demo_auth_code_hr_specialist&state={state}"
            return demo_callback, "demo"

        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": " ".join(GMAIL_SCOPES),
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        query_string = urllib.parse.urlencode(params)
        auth_url = f"{GOOGLE_AUTH_URL}?{query_string}"
        return auth_url, "live"

    def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Exchanges authorization code for access and refresh tokens.
        Never returns credentials to the frontend.
        """
        # Handle Sandbox / Demo Code
        if code.startswith("demo_auth_code") or not self.is_configured():
            logger.info("Exchanging demo authorization code for sandbox credentials.")
            token_payload = {
                "access_token": f"demo_access_token_{uuid.uuid4().hex}",
                "refresh_token": f"demo_refresh_token_{uuid.uuid4().hex}",
                "token_type": "Bearer",
                "expires_in": 3600,
                "expires_at": int(time.time()) + 3600,
                "email": "hr.specialist@enterprise-solutions.internal",
                "display_name": "Sarah Jenkins (HR Ops Lead)",
                "connected_at": datetime.now(timezone.utc).isoformat(),
                "mode": "demo",
                "scopes": GMAIL_SCOPES,
            }
            self.save_credentials(token_payload)
            return token_payload

        # Live Google OAuth 2.0 Token Exchange
        data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        response = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=15)
        if not response.ok:
            logger.error(f"Google token exchange failed: {response.text}")
            raise RuntimeError(f"Google OAuth token exchange failed: {response.text}")

        token_data = response.json()
        access_token = token_data.get("access_token")

        # Fetch authorized user profile
        user_info = self._fetch_user_profile(access_token)

        token_payload = {
            "access_token": access_token,
            "refresh_token": token_data.get("refresh_token"),
            "token_type": token_data.get("token_type", "Bearer"),
            "expires_in": token_data.get("expires_in", 3600),
            "expires_at": int(time.time()) + token_data.get("expires_in", 3600),
            "email": user_info.get("email", "unknown@gmail.com"),
            "display_name": user_info.get("name", "HR Specialist"),
            "connected_at": datetime.now(timezone.utc).isoformat(),
            "mode": "live",
            "scopes": GMAIL_SCOPES,
        }
        self.save_credentials(token_payload)
        return token_payload

    def _fetch_user_profile(self, access_token: str) -> Dict[str, Any]:
        """Fetches email and name from Google userinfo API."""
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            res = requests.get(GOOGLE_USERINFO_URL, headers=headers, timeout=10)
            if res.ok:
                return res.json()
        except Exception as e:
            logger.warning(f"Failed to fetch user profile: {e}")
        return {"email": "authorized-hr@gmail.com", "name": "HR Specialist"}

    def refresh_access_token(self) -> Optional[str]:
        """Refreshes expired access token using the stored refresh token."""
        creds = self.get_credentials()
        if not creds:
            return None

        if creds.get("mode") == "demo":
            creds["expires_at"] = int(time.time()) + 3600
            self.save_credentials(creds)
            return creds.get("access_token")

        refresh_token = creds.get("refresh_token")
        if not refresh_token:
            logger.warning("No refresh token available.")
            return None

        data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        try:
            response = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=15)
            if response.ok:
                token_data = response.json()
                creds["access_token"] = token_data.get("access_token")
                creds["expires_at"] = int(time.time()) + token_data.get("expires_in", 3600)
                self.save_credentials(creds)
                return creds["access_token"]
        except Exception as e:
            logger.error(f"Token refresh failed: {e}")

        return None

    def get_valid_access_token(self) -> Optional[str]:
        """Returns valid access token, auto-refreshing if expired."""
        creds = self.get_credentials()
        if not creds:
            return None

        expires_at = creds.get("expires_at", 0)
        # If expired or expiring within 60 seconds
        if time.time() >= (expires_at - 60):
            return self.refresh_access_token()

        return creds.get("access_token")

    def save_credentials(self, token_payload: Dict[str, Any]):
        """Persists credentials server-side."""
        tokens = self._read_tokens()
        tokens["current_connection"] = token_payload
        self._write_tokens(tokens)

    def get_credentials(self) -> Optional[Dict[str, Any]]:
        """Retrieves stored credentials."""
        tokens = self._read_tokens()
        return tokens.get("current_connection")

    def disconnect(self) -> bool:
        """Revokes and wipes stored credentials."""
        creds = self.get_credentials()
        if creds and creds.get("mode") == "live":
            token = creds.get("access_token")
            if token:
                try:
                    requests.post(
                        f"https://oauth2.googleapis.com/revoke?token={token}",
                        headers={"Content-Type": "application/x-www-form-urlencoded"},
                        timeout=5
                    )
                except Exception as e:
                    logger.warning(f"Error revoking token with Google: {e}")

        self._write_tokens({})
        return True

    def clear_credentials(self) -> bool:
        """Alias for disconnect."""
        return self.disconnect()


oauth_manager = OAuthManager()
