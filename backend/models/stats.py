from pydantic import BaseModel

class CommitStats(BaseModel):
    total_commits: int
    commits_per_week: dict[str, int]
    most_active_day: str
    most_active_hour: int


class ActivityHeatmap(BaseModel):
    data: dict[str, dict[str, int]]


class ProfileSummary(BaseModel):
    total_repos: int
    total_stars: int
    total_forks: int
    top_language: str | None = None
    account_age_days: int
    public_gists: int


class CompareResult(BaseModel):
    user1: str
    user2: str
    stats: dict[str, dict]
