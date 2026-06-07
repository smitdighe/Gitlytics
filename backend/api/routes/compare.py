import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from api.dependencies import AnalyticsDep, CacheDep, GitHubDep
from api.routes.profile import _build_profile_sync
from models.profile import UserProfile
from models.stats import CompareResult
from utils.exceptions import GitHubRateLimitError, UserNotFoundError
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/compare", tags=["compare"])


async def _fetch_profile(
    username: str,
    github_service,
    cache_service,
    analytics_service,
) -> UserProfile:
    
    cached = cache_service.get(username)
    if cached is not None:
        return cached

    loop = asyncio.get_event_loop()
    profile = await loop.run_in_executor(
        None, _build_profile_sync, username, github_service, analytics_service
    )
    cache_service.set(username, profile)
    return profile


def _compare_stat(val1, val2, user1: str, user2: str) -> dict:
    if val1 > val2:
        winner = user1
    elif val2 > val1:
        winner = user2
    else:
        winner = "tie"
    return {"user1": val1, "user2": val2, "winner": winner}


@router.get("/", response_model=CompareResult)
async def compare_users(
    u1: str,
    u2: str,
    github_service: GitHubDep,
    cache_service: CacheDep,
    analytics_service: AnalyticsDep,
):
    
    results = await asyncio.gather(
        _fetch_profile(u1, github_service, cache_service, analytics_service),
        _fetch_profile(u2, github_service, cache_service, analytics_service),
        return_exceptions=True,
    )

    for result in results:
        if isinstance(result, UserNotFoundError):
            raise HTTPException(status_code=404, detail=str(result))
        if isinstance(result, GitHubRateLimitError):
            raise HTTPException(
                status_code=429,
                detail=str(result),
                headers={"Retry-After": str(int(result.reset_at.timestamp()))},
            )
        if isinstance(result, Exception):
            raise result

    p1: UserProfile = results[0]
    p2: UserProfile = results[1]

    stats: dict[str, dict] = {
        "total_stars": _compare_stat(
            p1.summary.total_stars, p2.summary.total_stars, u1, u2
        ),
        "total_repos": _compare_stat(
            p1.summary.total_repos, p2.summary.total_repos, u1, u2
        ),
        "top_language": {
            "user1": p1.summary.top_language,
            "user2": p2.summary.top_language,
            "winner": "n/a",
        },
        "followers": _compare_stat(p1.followers, p2.followers, u1, u2),
        "account_age_days": _compare_stat(
            p1.summary.account_age_days, p2.summary.account_age_days, u1, u2
        ),
        "total_commits": _compare_stat(
            p1.commit_stats.total_commits, p2.commit_stats.total_commits, u1, u2
        ),
        "total_forks": _compare_stat(
            p1.summary.total_forks, p2.summary.total_forks, u1, u2
        ),
    }

    logger.info("Compared %s vs %s", u1, u2)
    return CompareResult(user1=u1, user2=u2, stats=stats)
