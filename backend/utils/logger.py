import logging
import json
import os
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)


def get_logger(name: str) -> logging.Logger:
    
    logger = logging.getLogger(name)

    if not logger.handlers:
        app_env = os.getenv("APP_ENV", "development")
        level = logging.DEBUG if app_env == "development" else logging.INFO

        logger.setLevel(level)

        handler = logging.StreamHandler()
        handler.setLevel(level)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)

        logger.propagate = False

    return logger
