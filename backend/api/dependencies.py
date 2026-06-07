from typing import Annotated
from fastapi import Depends
from config import Settings
from db.database import Database
from services.analytics_service import AnalyticsService
from services.cache_service import CacheService
from services.chart_service import ChartService
from services.github_service import GitHubService
from services.share_service import ShareService
from utils.logger import get_logger

logger = get_logger(__name__)

_db: Database | None = None
_github_service: GitHubService | None = None
_cache_service: CacheService | None = None
_analytics_service: AnalyticsService | None = None
_chart_service: ChartService | None = None
_share_service: ShareService | None = None


def init_services(settings: Settings) -> None:
    
    global _db, _github_service, _cache_service
    global _analytics_service, _chart_service, _share_service

    _db = Database(settings.DB_PATH)
    _github_service = GitHubService(settings.GITHUB_TOKEN)
    _cache_service = CacheService(_db, settings.CACHE_TTL_SECONDS)
    _analytics_service = AnalyticsService()
    _chart_service = ChartService(settings.CHART_DIR)
    _share_service = ShareService(_db)

    logger.info("All services initialised")


def get_db() -> Database:
    assert _db is not None, "Services not initialised — call init_services() first"
    return _db


def get_github_service() -> GitHubService:
    assert _github_service is not None, "Services not initialised"
    return _github_service


def get_cache_service() -> CacheService:
    assert _cache_service is not None, "Services not initialised"
    return _cache_service


def get_analytics_service() -> AnalyticsService:
    assert _analytics_service is not None, "Services not initialised"
    return _analytics_service


def get_chart_service() -> ChartService:
    assert _chart_service is not None, "Services not initialised"
    return _chart_service


def get_share_service() -> ShareService:
    assert _share_service is not None, "Services not initialised"
    return _share_service


DbDep = Annotated[Database, Depends(get_db)]
GitHubDep = Annotated[GitHubService, Depends(get_github_service)]
CacheDep = Annotated[CacheService, Depends(get_cache_service)]
AnalyticsDep = Annotated[AnalyticsService, Depends(get_analytics_service)]
ChartDep = Annotated[ChartService, Depends(get_chart_service)]
ShareDep = Annotated[ShareService, Depends(get_share_service)]
