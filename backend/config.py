import json
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    GITHUB_TOKEN: str = ""
    CACHE_TTL_SECONDS: int = 3600
    DB_PATH: str = "data/cache.db"
    CHART_DIR: str = "data/charts"
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

    @classmethod
    def __get_validators__(cls):
        yield cls._validate

    @classmethod
    def model_validate_cors(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, TypeError):
                return [item.strip() for item in v.split(",") if item.strip()]
        return v

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if isinstance(self.CORS_ORIGINS, str):
            try:
                parsed = json.loads(self.CORS_ORIGINS)
                if isinstance(parsed, list):
                    object.__setattr__(self, "CORS_ORIGINS", parsed)
            except (json.JSONDecodeError, TypeError):
                object.__setattr__(
                    self,
                    "CORS_ORIGINS",
                    [item.strip() for item in self.CORS_ORIGINS.split(",") if item.strip()],
                )


@lru_cache
def get_settings() -> Settings:
    return Settings()
