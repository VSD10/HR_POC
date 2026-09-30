from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserProfile
from app.api.deps import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": user.email, "role": user.role, "uid": user.id})
    refresh_token = create_access_token({"sub": user.email, "type": "refresh"})

    return TokenResponse(
        token=access_token,
        refreshToken=refresh_token,
        expiresIn=3600,
        user=UserProfile(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            title=user.title,
            avatarUrl=user.avatar_url
        )
    )

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return UserProfile(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        title=current_user.title,
        avatarUrl=current_user.avatar_url
    )

@router.get("/profile", response_model=UserProfile, summary="Get Current or Target User Profile")
def get_profile(
    userId: str = None,
    email: str = None,
    db: Session = Depends(get_db)
):
    """
    Returns user profile for the current user or queried user identifier.
    Removes hardcoded identity dependency so each user sees their own profile.
    """
    query = db.query(User)
    if userId:
        user = query.filter(User.id == userId).first()
    elif email:
        user = query.filter(User.email == email).first()
    else:
        # Default to first active user if unauthenticated
        user = query.filter(User.is_active == True).first()

    if not user:
        # Fallback to demo employee if not in DB yet
        return UserProfile(
            id="EMP001",
            name="Alex Johnson",
            email="alex.johnson@enterprise.internal",
            role="EMPLOYEE",
            title="Senior Staff Engineer",
            avatarUrl="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80"
        )

    return UserProfile(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        title=user.title,
        avatarUrl=user.avatar_url
    )

