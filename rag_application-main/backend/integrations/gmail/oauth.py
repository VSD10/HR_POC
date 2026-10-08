import json
import logging
import time
import urllib.parse
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any, List
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

    def get_oauth_config(self) -> Dict[str, str]:
        """Returns active client_id, client_secret, and redirect_uri from settings or storage."""
        stored = self._read_tokens().get("oauth_config", {})
        client_id = stored.get("client_id", "") or (settings.GOOGLE_CLIENT_ID if "123456789" not in settings.GOOGLE_CLIENT_ID and "your-" not in settings.GOOGLE_CLIENT_ID else "")
        client_secret = stored.get("client_secret", "") or (settings.GOOGLE_CLIENT_SECRET if "your-" not in settings.GOOGLE_CLIENT_SECRET and "test_" not in settings.GOOGLE_CLIENT_SECRET else "")
        redirect_uri = stored.get("redirect_uri", "") or settings.GOOGLE_REDIRECT_URI
        return {
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
        }

    def save_oauth_config(self, client_id: str, client_secret: str, redirect_uri: Optional[str] = None):
        """Saves Google OAuth client configuration and activates it immediately."""
        tokens = self._read_tokens()
        tokens["oauth_config"] = {
            "client_id": client_id.strip(),
            "client_secret": client_secret.strip(),
            "redirect_uri": (redirect_uri or settings.GOOGLE_REDIRECT_URI).strip(),
            "configured_at": datetime.now(timezone.utc).isoformat(),
        }
        self._write_tokens(tokens)
        settings.GOOGLE_CLIENT_ID = client_id.strip()
        settings.GOOGLE_CLIENT_SECRET = client_secret.strip()
        if redirect_uri:
            settings.GOOGLE_REDIRECT_URI = redirect_uri.strip()
        logger.info("Updated Google OAuth credentials in storage and memory.")

    def clear_oauth_config(self):
        """Clears custom OAuth config and resets in-memory credentials."""
        tokens = self._read_tokens()
        tokens.pop("oauth_config", None)
        self._write_tokens(tokens)
        settings.GOOGLE_CLIENT_ID = ""
        settings.GOOGLE_CLIENT_SECRET = ""

    def is_configured(self) -> bool:
        """Returns True if real Google Client ID & Secret are set up."""
        cfg = self.get_oauth_config()
        cid = cfg.get("client_id", "").strip()
        csec = cfg.get("client_secret", "").strip()
        if not cid or not csec:
            return False
        if any(dummy in cid.lower() for dummy in ["your-", "test-", "123456789"]):
            return False
        if any(dummy in csec.lower() for dummy in ["your-", "test_"]):
            return False
        # Google OAuth Client IDs always end in .apps.googleusercontent.com and are >= 35 chars
        return cid.endswith(".apps.googleusercontent.com") and len(cid) >= 35

    def _normalize_tokens(self, tokens: Dict[str, Any]) -> Dict[str, Any]:
        """Ensures accounts dictionary and active_account_id exist for multi-user SaaS."""
        if "accounts" not in tokens or not isinstance(tokens.get("accounts"), dict):
            tokens["accounts"] = {}
            # Migrate legacy current_connection if present
            legacy = tokens.get("current_connection")
            if legacy and isinstance(legacy, dict) and legacy.get("email"):
                uid = legacy.get("user_id") or legacy.get("email") or "default"
                legacy["user_id"] = uid
                tokens["accounts"][uid] = legacy
                tokens["active_account_id"] = uid
        return tokens

    def parse_state(self, state: Optional[str]) -> Dict[str, str]:
        """Extracts user_id and user_name encoded in OAuth state parameter."""
        result: Dict[str, str] = {}
        if not state:
            return result
        parts = state.split("__")
        for part in parts:
            if part.startswith("uid_"):
                result["user_id"] = part[4:]
            elif part.startswith("name_"):
                try:
                    result["user_name"] = urllib.parse.unquote(part[5:])
                except Exception:
                    result["user_name"] = part[5:]
        return result

    def get_authorization_url(
        self,
        user_id: Optional[str] = None,
        user_name: Optional[str] = None,
        state: Optional[str] = None,
    ) -> tuple[str, str]:
        """
        Builds Google OAuth 2.0 authorization URL for a specific HR specialist.
        Encodes user_id and user_name into the state parameter.
        Returns: (auth_url, mode)
        """
        if not state:
            nonce = uuid.uuid4().hex[:8]
            state_parts = [f"hr_{nonce}"]
            if user_id:
                state_parts.append(f"uid_{user_id.strip()}")
            if user_name:
                clean_name = urllib.parse.quote(user_name.strip()[:40])
                state_parts.append(f"name_{clean_name}")
            state = "__".join(state_parts)

        if not self.is_configured():
            # Demo/Sandbox Mode: direct callback simulation with test code
            logger.info("Google OAuth credentials not configured. Returning Demo OAuth URL.")
            demo_callback = f"/api/gmail/callback?code=demo_auth_code_hr_specialist&state={state}"
            return demo_callback, "demo"

        cfg = self.get_oauth_config()
        params = {
            "client_id": cfg["client_id"],
            "redirect_uri": cfg["redirect_uri"],
            "response_type": "code",
            "scope": " ".join(GMAIL_SCOPES),
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
        }
        query_string = urllib.parse.urlencode(params)
        auth_url = f"{GOOGLE_AUTH_URL}?{query_string}"
        return auth_url, "live"

    def exchange_code_for_token(
        self,
        code: str,
        state: Optional[str] = None,
        user_id: Optional[str] = None,
        user_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Exchanges authorization code for access and refresh tokens for a specific HR specialist.
        Never returns credentials to the frontend.
        """
        parsed_state = self.parse_state(state)
        resolved_user_id = user_id or parsed_state.get("user_id") or "default"
        resolved_user_name = user_name or parsed_state.get("user_name") or "HR Operations Specialist"

        # Handle Sandbox / Demo Code
        if code.startswith("demo_auth_code") or not self.is_configured():
            logger.info(f"Exchanging demo authorization code for sandbox credentials (user: {resolved_user_id}).")
            token_payload = {
                "user_id": resolved_user_id,
                "user_name": resolved_user_name,
                "access_token": f"demo_access_token_{uuid.uuid4().hex}",
                "refresh_token": f"demo_refresh_token_{uuid.uuid4().hex}",
                "token_type": "Bearer",
                "expires_in": 3600,
                "expires_at": int(time.time()) + 3600,
                "email": f"{resolved_user_id.lower()}@enterprise-solutions.internal" if resolved_user_id != "default" else "hr.specialist@enterprise-solutions.internal",
                "display_name": f"{resolved_user_name} (HR Ops Lead)",
                "connected_at": datetime.now(timezone.utc).isoformat(),
                "mode": "demo",
                "scopes": GMAIL_SCOPES,
            }
            self.save_credentials(token_payload, user_id=resolved_user_id)
            return token_payload

        # Live Google OAuth 2.0 Token Exchange
        cfg = self.get_oauth_config()
        data = {
            "code": code,
            "client_id": cfg["client_id"],
            "client_secret": cfg["client_secret"],
            "redirect_uri": cfg["redirect_uri"],
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
        user_email = user_info.get("email", "unknown@gmail.com")
        google_name = user_info.get("name") or resolved_user_name

        token_payload = {
            "user_id": resolved_user_id,
            "user_name": resolved_user_name,
            "access_token": access_token,
            "refresh_token": token_data.get("refresh_token"),
            "token_type": token_data.get("token_type", "Bearer"),
            "expires_in": token_data.get("expires_in", 3600),
            "expires_at": int(time.time()) + token_data.get("expires_in", 3600),
            "email": user_email,
            "display_name": google_name,
            "connected_at": datetime.now(timezone.utc).isoformat(),
            "mode": "live",
            "scopes": GMAIL_SCOPES,
        }
        self.save_credentials(token_payload, user_id=resolved_user_id)
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

    def refresh_access_token(self, user_id: Optional[str] = None) -> Optional[str]:
        """Refreshes expired access token using the stored refresh token for a specific user."""
        creds = self.get_credentials(user_id=user_id)
        if not creds:
            return None

        if creds.get("mode") == "demo" or creds.get("mode") == "custom":
            creds["expires_at"] = int(time.time()) + 3600
            self.save_credentials(creds, user_id=creds.get("user_id"))
            return creds.get("access_token")

        refresh_token = creds.get("refresh_token")
        if not refresh_token:
            logger.warning(f"No refresh token available for user {user_id or 'active'}.")
            return None

        cfg = self.get_oauth_config()
        data = {
            "client_id": cfg["client_id"],
            "client_secret": cfg["client_secret"],
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        try:
            response = requests.post(GOOGLE_TOKEN_URL, data=data, timeout=15)
            if response.ok:
                token_data = response.json()
                creds["access_token"] = token_data.get("access_token")
                creds["expires_at"] = int(time.time()) + token_data.get("expires_in", 3600)
                self.save_credentials(creds, user_id=creds.get("user_id"))
                return creds["access_token"]
        except Exception as e:
            logger.error(f"Token refresh failed for user {user_id}: {e}")

        return None

    def get_valid_access_token(self, user_id: Optional[str] = None) -> Optional[str]:
        """Returns valid access token, auto-refreshing if expired."""
        creds = self.get_credentials(user_id=user_id)
        if not creds:
            return None

        expires_at = creds.get("expires_at", 0)
        # If expired or expiring within 60 seconds
        if time.time() >= (expires_at - 60):
            return self.refresh_access_token(user_id=user_id)

        return creds.get("access_token")

    def save_credentials(self, token_payload: Dict[str, Any], user_id: Optional[str] = None):
        """Persists credentials server-side under specific HR specialist account."""
        uid = (user_id or token_payload.get("user_id") or token_payload.get("email") or "default").strip()
        token_payload["user_id"] = uid

        tokens = self._read_tokens()
        tokens = self._normalize_tokens(tokens)
        tokens["accounts"][uid] = token_payload
        tokens["active_account_id"] = uid
        tokens["current_connection"] = token_payload  # Backward compatibility
        self._write_tokens(tokens)
        logger.info(f"Saved OAuth credentials for HR account '{uid}' ({token_payload.get('email')}).")

    def get_credentials(self, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieves stored credentials for a specific HR account or active mailbox."""
        tokens = self._read_tokens()
        tokens = self._normalize_tokens(tokens)
        accounts = tokens.get("accounts", {})

        if user_id and user_id in accounts:
            return accounts[user_id]

        active_id = tokens.get("active_account_id")
        if active_id and active_id in accounts:
            return accounts[active_id]

        if tokens.get("current_connection"):
            return tokens["current_connection"]

        if accounts:
            return next(iter(accounts.values()))

        return None

    def list_accounts(self) -> List[Dict[str, Any]]:
        """Returns public summary of all connected HR accounts in the organization."""
        tokens = self._read_tokens()
        tokens = self._normalize_tokens(tokens)
        accounts = tokens.get("accounts", {})
        active_id = tokens.get("active_account_id")

        results = []
        for uid, acc in accounts.items():
            results.append({
                "user_id": uid,
                "user_name": acc.get("user_name"),
                "email": acc.get("email", ""),
                "display_name": acc.get("display_name", "HR Specialist"),
                "mode": acc.get("mode", "live"),
                "connected_at": acc.get("connected_at", ""),
                "is_active": uid == active_id,
            })
        return results

    def set_active_account(self, user_id: str) -> bool:
        """Sets the active HR mailbox context."""
        tokens = self._read_tokens()
        tokens = self._normalize_tokens(tokens)
        if user_id in tokens.get("accounts", {}):
            tokens["active_account_id"] = user_id
            tokens["current_connection"] = tokens["accounts"][user_id]
            self._write_tokens(tokens)
            return True
        return False

    def disconnect(self, user_id: Optional[str] = None) -> bool:
        """Disconnects a specific HR specialist's mailbox without affecting other HRs or oauth_config."""
        tokens = self._read_tokens()
        tokens = self._normalize_tokens(tokens)
        accounts = tokens.get("accounts", {})

        target_id = user_id or tokens.get("active_account_id")
        if not target_id and accounts:
            target_id = next(iter(accounts.keys()))

        if target_id and target_id in accounts:
            creds = accounts[target_id]
            if creds.get("mode") == "live":
                token = creds.get("access_token")
                if token:
                    try:
                        requests.post(
                            f"https://oauth2.googleapis.com/revoke?token={token}",
                            headers={"Content-Type": "application/x-www-form-urlencoded"},
                            timeout=5,
                        )
                    except Exception as e:
                        logger.warning(f"Error revoking token for {target_id}: {e}")

            del accounts[target_id]
            logger.info(f"Disconnected HR mailbox for user {target_id}.")

        # Update active account if needed
        if tokens.get("active_account_id") == target_id:
            tokens["active_account_id"] = next(iter(accounts.keys())) if accounts else None
            tokens["current_connection"] = accounts.get(tokens["active_account_id"]) if tokens["active_account_id"] else None

        self._write_tokens(tokens)
        return True

    def clear_credentials(self) -> bool:
        """Alias for disconnect."""
        return self.disconnect()


oauth_manager = OAuthManager()
