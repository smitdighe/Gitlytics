import time

from db.database import Database
from models.profile import UserProfile
from utils.logger import get_logger

logger = get_logger(__name__)

class CacheService:

    def __init__(self, db: Database, ttl_seconds: int) -> None:
        self._db = db
        self._ttl = ttl_seconds

    def get(self, username: str) -> UserProfile | None:
        
        with self._db.get_connection() as conn:
            row = conn.execute(
                "SELECT data, expires_at FROM profile_cache WHERE username = ?",
                (username,),
            ).fetchone()

        if row is None:
            logger.debug("Cache MISS for %s (not found)", username)
            return None

        now = int(time.time())
        if row["expires_at"] <= now:
            logger.debug("Cache MISS for %s (expired)", username)
            return None

        logger.debug("Cache HIT for %s", username)
        return UserProfile.model_validate_json(row["data"])

    def set(self, username: str, profile: UserProfile) -> None:
        now = int(time.time())
        data = profile.model_dump_json()
        with self._db.get_connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO profile_cache (username, data, cached_at, expires_at)
                VALUES (?, ?, ?, ?)
                """,
                (username, data, now, now + self._ttl),
            )
        logger.debug("Cache SET for %s (ttl=%ds)", username, self._ttl)

    def invalidate(self, username: str) -> None:
        with self._db.get_connection() as conn:
            conn.execute("DELETE FROM profile_cache WHERE username = ?", (username,))
        logger.debug("Cache INVALIDATED for %s", username)

    def purge_expired(self) -> int:
        now = int(time.time())
        with self._db.get_connection() as conn:
            cursor = conn.execute(
                "DELETE FROM profile_cache WHERE expires_at < ?", (now,)
            )
            count = cursor.rowcount
        logger.info("Purged %d expired cache entries", count)
        return count
