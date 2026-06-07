from collections import Counter, defaultdict
from datetime import datetime, timezone

import pandas as pd

from models.repo import LanguageBreakdown
from models.stats import ActivityHeatmap, CommitStats, ProfileSummary
from utils.logger import get_logger

logger = get_logger(__name__)

DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


class AnalyticsService:

    @classmethod
    def compute_language_breakdown(
        cls, repos_languages: list[dict[str, int]]
    ) -> list[LanguageBreakdown]:

        totals: Counter[str] = Counter()
        repo_counts: Counter[str] = Counter()

        for lang_dict in repos_languages:
            for lang, byte_count in lang_dict.items():
                if byte_count > 0:
                    totals[lang] += byte_count
                    repo_counts[lang] += 1

        grand_total = sum(totals.values())
        if grand_total == 0:
            return []

        breakdown = [
            LanguageBreakdown(
                language=lang,
                percentage=round((byte_count / grand_total) * 100, 2),
                repo_count=repo_counts[lang],
            )
            for lang, byte_count in totals.most_common()
        ]
        logger.debug("Language breakdown: %d languages", len(breakdown))
        return breakdown

    @classmethod
    def compute_commit_stats(cls, weekly_activity: list[dict]) -> CommitStats:

        if not weekly_activity:
            return CommitStats(
                total_commits=0,
                commits_per_week={},
                most_active_day="Mon",
                most_active_hour=12,
            )

        total_commits = sum(w["total"] for w in weekly_activity)

        commits_per_week: dict[str, int] = {}
        for w in weekly_activity:
            ts = w["week"]
            if isinstance(ts, (int, float)):
                dt = datetime.fromtimestamp(ts, tz=timezone.utc)
            else:
                dt = ts
            key = dt.strftime("%Y-%W")
            commits_per_week[key] = w["total"]

        day_totals = [0] * 7
        for w in weekly_activity:
            for i, count in enumerate(w["days"]):
                day_totals[i] += count

        most_active_day_idx = day_totals.index(max(day_totals))
        most_active_day = DAY_NAMES[most_active_day_idx]

        most_active_hour = 12

        logger.debug(
            "Commit stats: total=%d, active_day=%s", total_commits, most_active_day
        )
        return CommitStats(
            total_commits=total_commits,
            commits_per_week=commits_per_week,
            most_active_day=most_active_day,
            most_active_hour=most_active_hour,
        )

    @classmethod
    def compute_activity_heatmap(cls, weekly_activity: list[dict]) -> ActivityHeatmap:
        
        BUSINESS_HOURS = list(range(9, 18))  

        heatmap: dict[str, dict[str, int]] = {}
        for day in DAY_NAMES:
            heatmap[day] = {str(h): 0 for h in range(24)}

        for w in weekly_activity:
            for day_idx, count in enumerate(w["days"]):
                if count <= 0:
                    continue
                day_name = DAY_NAMES[day_idx]
                per_hour = count // len(BUSINESS_HOURS)
                remainder = count % len(BUSINESS_HOURS)
                for h in BUSINESS_HOURS:
                    heatmap[day_name][str(h)] += per_hour

                for i in range(remainder):
                    heatmap[day_name][str(BUSINESS_HOURS[i])] += 1

        logger.debug("Activity heatmap built")
        return ActivityHeatmap(data=heatmap)

    @classmethod
    def compute_summary(cls, user, repos) -> ProfileSummary:
        if repos:
            df = pd.DataFrame(
                [
                    {"stars": r.stargazers_count, "forks": r.forks_count, "language": r.language}
                    for r in repos
                ]
            )
            total_stars = int(df["stars"].sum())
            total_forks = int(df["forks"].sum())
            lang_counts = df["language"].dropna().value_counts()
            top_language = str(lang_counts.index[0]) if not lang_counts.empty else None
        else:
            total_stars = 0
            total_forks = 0
            top_language = None

        now = datetime.now(timezone.utc)
        created = user.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        account_age_days = (now - created).days

        summary = ProfileSummary(
            total_repos=len(repos),
            total_stars=total_stars,
            total_forks=total_forks,
            top_language=top_language,
            account_age_days=account_age_days,
            public_gists=user.public_gists,
        )
        logger.debug("Profile summary for %s: %s", user.login, summary)
        return summary
