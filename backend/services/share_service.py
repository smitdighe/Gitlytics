import time

from db.database import Database
from utils.helpers import generate_token
from utils.logger import get_logger

logger = get_logger(__name__)


class ShareService:

    def __init__(self, db: Database) -> None:
        self._db = db

    def create_share(self, username: str) -> str:

        with self._db.get_connection() as conn:
            row = conn.execute(
                "SELECT token FROM share_links WHERE username = ?", (username,)
            ).fetchone()

            if row is not None:
                logger.debug("Existing share token for %s: %s", username, row["token"])
                return row["token"]

            token = generate_token()
            now = int(time.time())
            conn.execute(
                "INSERT INTO share_links (token, username, created_at) VALUES (?, ?, ?)",
                (token, username, now),
            )
        logger.debug("Created share token for %s: %s", username, token)
        return token

    def resolve_share(self, token: str) -> str | None:
        
        with self._db.get_connection() as conn:
            row = conn.execute(
                "SELECT username FROM share_links WHERE token = ?", (token,)
            ).fetchone()

        if row is None:
            logger.debug("Share token not found: %s", token)
            return None
        logger.debug("Resolved share token %s → %s", token, row["username"])
        return row["username"]
