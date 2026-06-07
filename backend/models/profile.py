from datetime import datetime
from pydantic import BaseModel
from models.repo import LanguageBreakdown, RepoInfo
from models.stats import ActivityHeatmap, CommitStats, ProfileSummary


class UserProfile(BaseModel):
    
    username: str
    display_name: str | None = None
    avatar_url: str
    bio: str | None = None
    location: str | None = None
    blog: str | None = None
    followers: int
    following: int
    summary: ProfileSummary
    top_repos: list[RepoInfo]
    languages: list[LanguageBreakdown]
    commit_stats: CommitStats
    activity_heatmap: ActivityHeatmap
    fetched_at: datetime
