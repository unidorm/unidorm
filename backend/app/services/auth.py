from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password, hash_session_token, new_session_token, verify_password
from app.models.auth_session import AuthSession
from app.models.user import User, UserRole
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserOut

_WRONG_LOGIN = "Email or password is incorrect."


def _start_session(db: Session, user: User) -> AuthResponse:
    token = new_session_token()
    now = datetime.now(UTC)
    expires_at = now + timedelta(days=get_settings().session_days)
    # Housekeeping: drop this user's expired sessions.
    db.execute(delete(AuthSession).where(AuthSession.user_id == user.id, AuthSession.expires_at <= now))
    db.add(AuthSession(user_id=user.id, token_hash=hash_session_token(token), expires_at=expires_at))
    db.commit()
    db.refresh(user)
    return AuthResponse(token=token, expires_at=expires_at, user=UserOut.model_validate(user))


def register_student(db: Session, data: RegisterRequest) -> AuthResponse:
    """Public registration creates student accounts only. Housing managers are added by the Housing Office."""
    existing = db.scalar(select(User).where(User.email == data.email))
    if existing is not None and existing.password_hash:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    if existing is not None and existing.role != UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")

    # A Stage 1 student row without a password can be claimed by registering with its email.
    user = existing or User(email=data.email, role=UserRole.STUDENT)
    user.full_name = data.full_name
    user.password_hash = hash_password(data.password)
    db.add(user)
    try:
        db.flush()
    except IntegrityError:  # two registrations with the same email at the same moment
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    return _start_session(db, user)


def login(db: Session, data: LoginRequest) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == data.email))
    # Same message whether the email exists or not, so accounts cannot be discovered.
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=_WRONG_LOGIN)
    return _start_session(db, user)


def logout(db: Session, session: AuthSession) -> None:
    db.delete(session)
    db.commit()
