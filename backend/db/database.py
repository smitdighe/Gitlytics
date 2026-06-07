import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from utils.logger import get_logger

logger = get_logger(__name__)


class Database:

    def __init__(self, db_path: str) -> None:
        self._db_path = Path(db_path)
        self._db_path.parent.mkdir(parents=True, exist_ok=True)

        self._conn = sqlite3.connect(
            str(self._db_path),
            check_same_thread=False,
        )
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA foreign_keys = ON")

        self._write_lock = threading.Lock()

        self.run_migrations()
        logger.info("Database initialised at %s", self._db_path)

    def run_migrations(self) -> None:
        migrations_dir = Path(__file__).parent / "migrations"
        if not migrations_dir.exists():
            logger.warning("Migrations directory not found: %s", migrations_dir)
            return

        sql_files = sorted(migrations_dir.glob("*.sql"))
        for sql_file in sql_files:
            logger.debug("Running migration: %s", sql_file.name)
            sql = sql_file.read_text(encoding="utf-8")
            self._conn.executescript(sql)

        logger.info("Ran %d migration(s)", len(sql_files))

    @contextmanager
    def get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        self._write_lock.acquire()
        try:
            yield self._conn
            self._conn.commit()
        except Exception:
            self._conn.rollback()
            logger.exception("Database operation failed — rolled back")
            raise
        finally:
            self._write_lock.release()
