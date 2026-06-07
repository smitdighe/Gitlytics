import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from api.dependencies import AnalyticsDep, CacheDep, CurrentUser, GitHubDep
from models.profile import UserProfile
from models.repo import RepoInfo
from utils.exceptions import GitHubRateLimitError, UserNotFoundError
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/profile", tags=["profile"])


def _build_profile_sync(
    username: str,
    github_service,
    analytics_service,
) -> UserProfile:

    user = github_service.get_user(username)
    repos = github_service.get_repos(user)

    repos_languages = [github_service.get_languages(r) for r in repos]

    top_repos = sorted(repos, key=lambda r: r.stargazers_count, reverse=True)[:10]
    all_weekly: list[dict] = []
    for repo in top_repos:
        all_weekly.extend(github_service.get_commit_activity(repo))

    languages = analytics_service.compute_language_breakdown(repos_languages)
    commit_stats = analytics_service.compute_commit_stats(all_weekly)
    heatmap = analytics_service.compute_activity_heatmap(all_weekly)
    summary = analytics_service.compute_summary(user, repos)

    top_repo_models = [
        RepoInfo(
            name=r.name,
            description=r.description,
            language=r.language,
            stars=r.stargazers_count,
            forks=r.forks_count,
            size_kb=r.size,
            is_fork=r.fork,
            created_at=r.created_at,
            updated_at=r.updated_at,
            url=r.html_url,
        )
        for r in top_repos
    ]

    profile = UserProfile(
        username=user.login,
        display_name=user.name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        location=user.location,
        blog=user.blog,
        followers=user.followers,
        following=user.following,
        summary=summary,
        top_repos=top_repo_models,
        languages=languages,
        commit_stats=commit_stats,
        activity_heatmap=heatmap,
        fetched_at=datetime.now(timezone.utc),
    )
    return profile


@router.get("/{username}", response_model=UserProfile)
async def get_profile(
    username: str,
    current_user: CurrentUser,
    github_service: GitHubDep,
    cache_service: CacheDep,
    analytics_service: AnalyticsDep,
):

    cached = cache_service.get(username)
    if cached is not None:
        logger.info("Serving cached profile for %s", username)
        return cached

    loop = asyncio.get_event_loop()
    try:
        profile = await loop.run_in_executor(
            None,
            _build_profile_sync,
            username,
            github_service,
            analytics_service,
        )
    except UserNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except GitHubRateLimitError as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
            headers={"Retry-After": str(int(exc.reset_at.timestamp()))},
        ) from exc

    cache_service.set(username, profile)
    logger.info("Fetched and cached profile for %s", username)
    return profile
