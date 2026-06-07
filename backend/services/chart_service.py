import threading
from collections import defaultdict
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

from models.repo import LanguageBreakdown, RepoInfo
from models.stats import ActivityHeatmap, CommitStats
from utils.exceptions import ChartGenerationError
from utils.helpers import get_color_palette
from utils.logger import get_logger

logger = get_logger(__name__)

_CHART_TTL = 3600


class ChartService:

    def __init__(self, chart_dir: str) -> None:
        self._chart_dir = Path(chart_dir)
        self._chart_dir.mkdir(parents=True, exist_ok=True)
        self._locks: dict[tuple[str, str], threading.Lock] = defaultdict(threading.Lock)
        logger.info("ChartService initialised — chart_dir=%s", self._chart_dir)

    def _chart_path(self, username: str, chart_type: str) -> Path:
        return self._chart_dir / f"{username}_{chart_type}.png"

    def _is_fresh(self, path: Path) -> bool:
        if not path.exists():
            return False
        import time
        age = time.time() - path.stat().st_mtime
        return age < _CHART_TTL

    def _apply_style(self) -> None:
        sns.set_theme(style="whitegrid")

    def language_pie(self, username: str, languages: list[LanguageBreakdown]) -> Path:
        chart_type = "languages"
        lock = self._locks[(username, chart_type)]
        lock.acquire()
        try:
            path = self._chart_path(username, chart_type)
            if self._is_fresh(path):
                logger.debug("Chart cache hit: %s", path)
                return path

            self._apply_style()
            fig, ax = plt.subplots(figsize=(9, 5))

            if not languages:
                ax.text(0.5, 0.5, "No language data", ha="center", va="center", fontsize=14)
            else:
                labels = [lb.language for lb in languages]
                sizes = [lb.percentage for lb in languages]
                colors = get_color_palette(len(languages))
                wedges, texts, autotexts = ax.pie(
                    sizes,
                    labels=labels,
                    colors=colors,
                    autopct="%1.1f%%",
                    startangle=140,
                    pctdistance=0.85,
                )
                for t in autotexts:
                    t.set_fontsize(8)
                ax.set_title(f"Language Distribution — {username}", fontsize=13)

            fig.tight_layout()
            fig.savefig(str(path), dpi=100, transparent=False, facecolor="white")
            plt.close(fig)
            logger.debug("Rendered chart: %s", path)
            return path
        except Exception as exc:
            plt.close("all")
            logger.exception("Chart generation failed: %s", chart_type)
            raise ChartGenerationError(chart_type) from exc
        finally:
            lock.release()

    def stars_bar(self, username: str, repos: list[RepoInfo]) -> Path:
        chart_type = "stars"
        lock = self._locks[(username, chart_type)]
        lock.acquire()
        try:
            path = self._chart_path(username, chart_type)
            if self._is_fresh(path):
                logger.debug("Chart cache hit: %s", path)
                return path

            self._apply_style()
            fig, ax = plt.subplots(figsize=(9, 5))

            top = sorted(repos, key=lambda r: r.stars, reverse=True)[:10]
            if not top:
                ax.text(0.5, 0.5, "No repos", ha="center", va="center", fontsize=14)
            else:
                names = [r.name for r in reversed(top)]
                stars = [r.stars for r in reversed(top)]
                colors = get_color_palette(len(names))
                ax.barh(names, stars, color=colors)
                ax.set_xlabel("Stars")
                ax.set_title(f"Top Repos by Stars — {username}", fontsize=13)

            fig.tight_layout()
            fig.savefig(str(path), dpi=100, transparent=False, facecolor="white")
            plt.close(fig)
            logger.debug("Rendered chart: %s", path)
            return path
        except Exception as exc:
            plt.close("all")
            logger.exception("Chart generation failed: %s", chart_type)
            raise ChartGenerationError(chart_type) from exc
        finally:
            lock.release()

    def commit_frequency(self, username: str, stats: CommitStats) -> Path:
        chart_type = "commits"
        lock = self._locks[(username, chart_type)]
        lock.acquire()
        try:
            path = self._chart_path(username, chart_type)
            if self._is_fresh(path):
                logger.debug("Chart cache hit: %s", path)
                return path

            self._apply_style()
            fig, ax = plt.subplots(figsize=(9, 5))

            weeks = list(stats.commits_per_week.keys())
            counts = list(stats.commits_per_week.values())

            if not weeks:
                ax.text(0.5, 0.5, "No commit data", ha="center", va="center", fontsize=14)
            else:
                ax.plot(range(len(weeks)), counts, marker="o", markersize=3, linewidth=1.5, color="#4a90d9")
                ax.fill_between(range(len(weeks)), counts, alpha=0.15, color="#4a90d9")
                step = max(1, len(weeks) // 12)
                ax.set_xticks(range(0, len(weeks), step))
                ax.set_xticklabels([weeks[i] for i in range(0, len(weeks), step)], rotation=45, ha="right", fontsize=7)
                ax.set_ylabel("Commits")
                ax.set_title(f"Weekly Commit Frequency — {username}", fontsize=13)

            fig.tight_layout()
            fig.savefig(str(path), dpi=100, transparent=False, facecolor="white")
            plt.close(fig)
            logger.debug("Rendered chart: %s", path)
            return path
        except Exception as exc:
            plt.close("all")
            logger.exception("Chart generation failed: %s", chart_type)
            raise ChartGenerationError(chart_type) from exc
        finally:
            lock.release()

    def activity_heatmap(self, username: str, heatmap: ActivityHeatmap) -> Path:
        chart_type = "heatmap"
        lock = self._locks[(username, chart_type)]
        lock.acquire()
        try:
            path = self._chart_path(username, chart_type)
            if self._is_fresh(path):
                logger.debug("Chart cache hit: %s", path)
                return path

            self._apply_style()
            fig, ax = plt.subplots(figsize=(9, 5))

            day_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            hours = [str(h) for h in range(24)]
            matrix = []
            for day in day_order:
                row = [heatmap.data.get(day, {}).get(h, 0) for h in hours]
                matrix.append(row)

            data_array = np.array(matrix)
            sns.heatmap(
                data_array,
                ax=ax,
                xticklabels=hours,
                yticklabels=day_order,
                cmap="YlOrRd",
                linewidths=0.5,
                linecolor="white",
                cbar_kws={"label": "Commits"},
            )
            ax.set_xlabel("Hour of Day")
            ax.set_ylabel("Day of Week")
            ax.set_title(f"Activity Heatmap — {username}", fontsize=13)

            fig.tight_layout()
            fig.savefig(str(path), dpi=100, transparent=False, facecolor="white")
            plt.close(fig)
            logger.debug("Rendered chart: %s", path)
            return path
        except Exception as exc:
            plt.close("all")
            logger.exception("Chart generation failed: %s", chart_type)
            raise ChartGenerationError(chart_type) from exc
        finally:
            lock.release()
