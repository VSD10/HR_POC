from typing import Optional
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str
    title: Optional[str] = None
    avatarUrl: Optional[str] = None

class TokenResponse(BaseModel):
    token: str
    refreshToken: str
    expiresIn: int
    user: UserProfile
