"""
AI Hedge Funding — Authentication
Owner (Robin): Full access
CTO (Felix): Full technical access
Investor: Read-only separate portal
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from backend.config import settings

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserRole:
    OWNER = "owner"
    CTO = "cto"
    INVESTOR = "investor"


class User(BaseModel):
    username: str
    role: str
    full_name: str


# Pre-defined users — the team is locked
USERS = {
    "robin": {
        "username": "robin",
        "password_hash": pwd_context.hash("change-me"),
        "role": UserRole.OWNER,
        "full_name": "Robin",
    },
    "felix": {
        "username": "felix",
        "password_hash": pwd_context.hash("change-me"),
        "role": UserRole.CTO,
        "full_name": "Felix",
    },
}


def create_token(username: str, role: str) -> str:
    """Create JWT token."""
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    payload = {
        "sub": username,
        "role": role,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Verify JWT and return user."""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        username = payload.get("sub")
        role = payload.get("role")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_data = USERS.get(username)
        if user_data:
            return User(
                username=username,
                role=role,
                full_name=user_data["full_name"],
            )

        # Could be an investor
        return User(username=username, role=role, full_name=username)

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_owner(user: User = Depends(verify_token)) -> User:
    """Require owner role."""
    if user.role not in (UserRole.OWNER, UserRole.CTO):
        raise HTTPException(status_code=403, detail="Owner access required")
    return user


def require_investor(user: User = Depends(verify_token)) -> User:
    """Allow investor or higher."""
    return user
