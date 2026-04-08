"""Authentication module: registration, login, JWT, and user dependency."""

from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request, Response
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings
from app.schemas import TokenResponse, UserCreate, UserLogin

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
COOKIE_NAME = "access_token"


def _get_users_db_path() -> str:
    return os.path.join(settings.DATA_DIR, "users.db")


def init_users_db() -> None:
    """Create the users table if it doesn't exist."""
    db_path = _get_users_db_path()
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """
    )
    conn.commit()
    conn.close()


def _get_users_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(_get_users_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def create_access_token(user_id: int, username: str) -> str:
    """Create a JWT with user_id, username, and expiration claim."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    """Decode and validate a JWT. Returns the payload dict."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user(request: Request) -> dict:
    """FastAPI dependency that extracts the user from the httpOnly cookie.

    Returns a dict with 'user_id' and 'username'.
    """
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = verify_token(token)
    user_id = payload.get("sub")
    username = payload.get("username")
    if user_id is None or username is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return {"user_id": int(user_id), "username": username}


@router.post("/register", response_model=TokenResponse)
def register(data: UserCreate, response: Response):
    """Register a new user, set JWT cookie, return confirmation."""
    conn = _get_users_conn()
    try:
        existing = conn.execute(
            "SELECT id FROM users WHERE username = ?", (data.username,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")

        password_hash = pwd_context.hash(data.password)
        cursor = conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (data.username, password_hash),
        )
        conn.commit()
        user_id = cursor.lastrowid

        token = create_access_token(user_id, data.username)
        response.set_cookie(
            key=COOKIE_NAME,
            value=token,
            httponly=True,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
        return TokenResponse(message="Registration successful", username=data.username)
    finally:
        conn.close()


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, response: Response):
    """Authenticate user, set JWT cookie, return confirmation."""
    conn = _get_users_conn()
    try:
        row = conn.execute(
            "SELECT id, username, password_hash FROM users WHERE username = ?",
            (data.username,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="Invalid username or password")

        if not pwd_context.verify(data.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid username or password")

        token = create_access_token(row["id"], row["username"])
        response.set_cookie(
            key=COOKIE_NAME,
            value=token,
            httponly=True,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
        return TokenResponse(message="Login successful", username=row["username"])
    finally:
        conn.close()


@router.post("/logout")
def logout(response: Response):
    """Clear the JWT cookie."""
    response.delete_cookie(key=COOKIE_NAME)
    return {"message": "Logged out"}
