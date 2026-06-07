import time
from datetime import datetime, timezone

from github import Github, GithubException

from utils.exceptions import GitHubRateLimitError, UserNotFoundError
from utils.logger import get_logger

logger = get_logger(__name__)


class GitHubService:

    def __init__(self, token: str) -> None:
        self._client = Github(token) if token else Github()
        logger.info("GitHubService initialised (authenticated=%s)", bool(token))

    def get_user(self, username: str):

        logger.debug("Fetching user: %s", username)
        try:
            user = self._client.get_user(username)
            _ = user.login
            logger.debug("User fetched: %s", user.login)
            return user
        except GithubException as exc:
            if exc.status == 404:
                raise UserNotFoundError(username) from exc
            if exc.status in (403, 429):
                reset_ts = self._client.get_rate_limit().core.reset
                raise GitHubRateLimitError(reset_at=reset_ts) from exc
            raise

    def get_repos(self, user):

        logger.debug("Fetching repos for: %s", user.login)
        repos = []
        for repo in user.get_repos(type="public", sort="stars", direction="desc"):
            if repo.fork:
                continue
            repos.append(repo)
            if len(repos) >= 100:
                break
        logger.debug("Fetched %d repos for %s", len(repos), user.login)
        return repos

    def get_commit_activity(self, repo) -> list[dict]:
        
        logger.debug("Fetching commit activity for: %s", repo.full_name)
        for attempt in range(1, 6):
            try:
                stats = repo.get_stats_commit_activity()
                if stats is not None:
                    result = [
                        {
                            "week": s.week.timestamp() if hasattr(s.week, "timestamp") else s.week,
                            "days": s.days,
                            "total": s.total,
                        }
                        for s in stats
                    ]
                    logger.debug(
                        "Got %d weeks of activity for %s", len(result), repo.full_name
                    )
                    return result
                logger.debug(
                    "Stats not ready for %s (attempt %d/5)", repo.full_name, attempt
                )
                time.sleep(2)
            except GithubException:
                logger.debug(
                    "Exception fetching stats for %s (attempt %d/5)",
                    repo.full_name,
                    attempt,
                    exc_info=True,
                )
                time.sleep(2)
        logger.warning("Commit activity unavailable for %s after 5 retries", repo.full_name)
        return []

    def get_languages(self, repo) -> dict[str, int]:
        
        logger.debug("Fetching languages for: %s", repo.full_name)
        try:
            langs = repo.get_languages()
            logger.debug("Languages for %s: %s", repo.full_name, langs)
            return {k: v for k, v in langs.items() if isinstance(v, int)}
        except Exception:
            logger.debug(
                "Failed to fetch languages for %s", repo.full_name, exc_info=True
            )
            return {}
