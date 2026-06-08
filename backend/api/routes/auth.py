from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, Response
from slowapi import Limiter
from slowapi.util import get_remote_address

from api.dependencies import AuthDep, CurrentUser
from models.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


def _set_refresh_cookie(
    response: Response,
    raw_token: str,
    max_age_days: int,
) -> None:
    
    response.set_cookie(
        key="refresh_token",
        value=raw_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=max_age_days * 86400,
    )


@router.post("/register", response_model=AuthResponse)
async def register(
    body: RegisterRequest,
    auth_service: AuthDep,
    response: Response,
) -> AuthResponse:
    
    user = auth_service.register(body.username, body.email, body.password)
    access_token = auth_service.create_access_token(user.id, user.username)
    raw_refresh, _ = auth_service.create_refresh_token(user.id)
    expire_seconds = auth_service._settings.access_token_expire_minutes * 60

    _set_refresh_cookie(
        response,
        raw_refresh,
        auth_service._settings.refresh_token_expire_days,
    )

    logger.info("User registered: %s (id=%d)", user.username, user.id)

    return AuthResponse(
        user=user,
        access_token=access_token,
        token_type="bearer",
        expires_in=expire_seconds,
    )

limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    body: LoginRequest,
    auth_service: AuthDep,
    response: Response,
) -> AuthResponse:
    
    user_row = auth_service.login(body.email, body.password)

    access_token = auth_service.create_access_token(
        user_row["id"], user_row["username"]
    )
    raw_refresh, _ = auth_service.create_refresh_token(user_row["id"])

    expire_seconds = auth_service._settings.access_token_expire_minutes * 60

    _set_refresh_cookie(
        response,
        raw_refresh,
        auth_service._settings.refresh_token_expire_days,
    )

    user = UserResponse(
        id=user_row["id"],
        username=user_row["username"],
        email=user_row["email"],
        is_active=bool(user_row["is_active"]),
        created_at=datetime.fromtimestamp(user_row["created_at"], tz=timezone.utc),
    )

    logger.info("User logged in: %s (id=%d)", user.username, user.id)

    return AuthResponse(
        user=user,
        access_token=access_token,
        token_type="bearer",
        expires_in=expire_seconds,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    auth_service: AuthDep,
    response: Response,
) -> TokenResponse:
    
    raw_token = request.cookies.get("refresh_token")
    if not raw_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    user_id = auth_service.verify_refresh_token(raw_token)

    user = auth_service.get_user_by_id(user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    auth_service.revoke_refresh_token(raw_token)
    access_token = auth_service.create_access_token(user.id, user.username)
    new_raw_refresh, _ = auth_service.create_refresh_token(user.id)

    expire_seconds = auth_service._settings.access_token_expire_minutes * 60

    _set_refresh_cookie(
        response,
        new_raw_refresh,
        auth_service._settings.refresh_token_expire_days,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=expire_seconds,
    )


@router.post("/logout")
async def logout(
    request: Request,
    auth_service: AuthDep,
    response: Response,
) -> dict:
    
    raw_token = request.cookies.get("refresh_token")
    if raw_token:
        auth_service.revoke_refresh_token(raw_token)

    response.delete_cookie("refresh_token")

    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: CurrentUser) -> UserResponse:
    return current_user
