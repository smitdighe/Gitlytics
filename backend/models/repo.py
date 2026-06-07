from datetime import datetime
from pydantic import BaseModel

class RepoInfo(BaseModel):
    name: str
    description: str | None = None
    language: str | None = None
    stars: int
    forks: int
    size_kb: int
    is_fork: bool
    created_at: datetime
    updated_at: datetime
    url: str


class LanguageBreakdown(BaseModel):
    language: str
    percentage: float
    repo_count: int
