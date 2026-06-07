from datetime import datetime

class UserNotFoundError(Exception):

    def __init__(self, username: str) -> None:
        self.username = username
        super().__init__(f"GitHub user '{username}' not found")

    def __str__(self) -> str:
        return f"GitHub user '{self.username}' not found"

    def to_dict(self) -> dict:
        return {
            "error": "UserNotFoundError",
            "message": str(self),
        }


class GitHubRateLimitError(Exception):

    def __init__(self, reset_at: datetime) -> None:
        self.reset_at = reset_at
        super().__init__(
            f"GitHub API rate limit exceeded. Resets at {reset_at.isoformat()}"
        )

    def __str__(self) -> str:
        return (
            f"GitHub API rate limit exceeded. Resets at {self.reset_at.isoformat()}"
        )

    def to_dict(self) -> dict:
        return {
            "error": "GitHubRateLimitError",
            "message": str(self),
        }


class CacheError(Exception):

    def __init__(self, message: str) -> None:
        self.msg = message
        super().__init__(message)

    def __str__(self) -> str:
        return self.msg

    def to_dict(self) -> dict:
        return {
            "error": "CacheError",
            "message": str(self),
        }


class ChartGenerationError(Exception):

    def __init__(self, chart_type: str) -> None:
        self.chart_type = chart_type
        super().__init__(f"Failed to generate chart of type '{chart_type}'")

    def __str__(self) -> str:
        return f"Failed to generate chart of type '{self.chart_type}'"

    def to_dict(self) -> dict:
        return {
            "error": "ChartGenerationError",
            "message": str(self),
        }
