import hashlib
import secrets
import time
from datetime import datetime, timezone

from fastapi import HTTPException
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import Settings
from db.database import Database
from models.auth import UserResponse
from utils.logger import get_logger

logger = get_logger(__name__)

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    
    def __init__(self, db: Database, settings: Settings) -> None:
        self._db = db
        self._settings = settings

    @staticmethod
    def hash_password(plain: str) -> str:
        return _pwd_ctx.hash(plain)

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        return _pwd_ctx.verify(plain, hashed)

    def create_access_token(self, user_id: int, username: str) -> str:
        
        now = time.time()
        expire = now + self._settings.access_token_expire_minutes * 60
        payload = {
            "sub": str(user_id),
            "username": username,
            "type": "access",
            "exp": expire,
        }
        return jwt.encode(
            payload,
            self._settings.jwt_secret_key,
            algorithm=self._settings.jwt_algorithm,
        )

    def verify_access_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(
                token,
                self._settings.jwt_secret_key,
                algorithms=[self._settings.jwt_algorithm],
            )
        except JWTError:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    def create_refresh_token(self, user_id: int) -> tuple[str, str]:
        
        raw_token = secrets.token_urlsafe(64)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        now = int(time.time())
        expires_at = now + self._settings.refresh_token_expire_days * 86400

        with self._db.get_connection() as conn:
            conn.execute(
                "INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) "
                "VALUES (?, ?, ?, ?)",
                (user_id, token_hash, expires_at, now),
            )

        return raw_token, token_hash

    def verify_refresh_token(self, raw_token: str) -> int:
        
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        now = int(time.time())

        with self._db.get_connection() as conn:
            row = conn.execute(
                "SELECT user_id, expires_at FROM refresh_tokens "
                "WHERE token_hash = ?",
                (token_hash,),
            ).fetchone()

        if row is None or row["expires_at"] <= now:
            raise HTTPException(
                status_code=401,
                detail="Refresh token is invalid or expired",
            )

        return row["user_id"]

    def revoke_refresh_token(self, raw_token: str) -> None:
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        with self._db.get_connection() as conn:
            conn.execute(
                "DELETE FROM refresh_tokens WHERE token_hash = ?",
                (token_hash,),
            )

    def purge_expired_refresh_tokens(self) -> int:
        now = int(time.time())
        with self._db.get_connection() as conn:
            cursor = conn.execute(
                "DELETE FROM refresh_tokens WHERE expires_at < ?",
                (now,),
            )
            count = cursor.rowcount
        logger.info("Purged %d expired refresh token(s)", count)
        return count

    def register(self, username: str, email: str, plain_password: str) -> UserResponse:
        with self._db.get_connection() as conn:

            existing = conn.execute(
                "SELECT id FROM users WHERE username = ?", (username,)
            ).fetchone()
            if existing:
                raise HTTPException(status_code=409, detail="Username already taken")

            existing = conn.execute(
                "SELECT id FROM users WHERE email = ?", (email,)
            ).fetchone()
            if existing:
                raise HTTPException(status_code=409, detail="Email already registered")

            password_hash = self.hash_password(plain_password)
            now = int(time.time())

            cursor = conn.execute(
                "INSERT INTO users (username, email, password_hash, is_active, created_at) "
                "VALUES (?, ?, ?, 1, ?)",
                (username, email, password_hash, now),
            )
            user_id = cursor.lastrowid

        return UserResponse(
            id=user_id,
            username=username,
            email=email,
            is_active=True,
            created_at=datetime.fromtimestamp(now, tz=timezone.utc),
        )

    def login(self, email: str, plain_password: str) -> dict:

        with self._db.get_connection() as conn:
            row = conn.execute(
                "SELECT id, username, email, password_hash, is_active, created_at, last_login "
                "FROM users WHERE email = ?",
                (email,),
            ).fetchone()

        if row is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not self.verify_password(plain_password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not row["is_active"]:
            raise HTTPException(status_code=403, detail="Account disabled")

        now = int(time.time())
        with self._db.get_connection() as conn:
            conn.execute(
                "UPDATE users SET last_login = ? WHERE id = ?",
                (now, row["id"]),
            )

        return dict(row)

    def get_user_by_id(self, user_id: int) -> UserResponse | None:

        with self._db.get_connection() as conn:
            row = conn.execute(
                "SELECT id, username, email, is_active, created_at "
                "FROM users WHERE id = ?",
                (user_id,),
            ).fetchone()

        if row is None:
            return None

        return UserResponse(
            id=row["id"],
            username=row["username"],
            email=row["email"],
            is_active=bool(row["is_active"]),
            created_at=datetime.fromtimestamp(row["created_at"], tz=timezone.utc),
        )
