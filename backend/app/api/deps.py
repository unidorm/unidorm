"""Shared FastAPI dependencies: who is calling, and are they allowed."""

from datetime import UTC, datetime

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_session_token
from app.db.session import get_db
from app.models.auth_session import AuthSession
from app.models.user import User, UserRole

_bearer = HTTPBearer(auto_error=False)


def _unauthorized(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail=message, headers={"WWW-Authenticate": "Bearer"}
    )


def get_current_session(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> AuthSession:
    if credentials is None:
        raise _unauthorized("Please sign in.")
    session = db.scalar(select(AuthSession).where(AuthSession.token_hash == hash_session_token(credentials.credentials)))
    if session is None or session.expires_at <= datetime.now(UTC):
        raise _unauthorized("Your session has expired. Please sign in again.")
    return session


def get_current_user(session: AuthSession = Depends(get_current_session)) -> User:
    return session.user


def require_student(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This page is for students.")
    return user
