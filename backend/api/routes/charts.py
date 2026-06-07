import asyncio
from enum import Enum

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from api.dependencies import CacheDep, ChartDep, CurrentUser
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/charts", tags=["charts"])

class ChartType(str, Enum):
    languages = "languages"
    stars = "stars"
    commits = "commits"
    heatmap = "heatmap"


@router.get("/{username}/{chart_type}")
async def get_chart(
    username: str,
    chart_type: ChartType,
    cache_service: CacheDep,
    chart_service: ChartDep,
):

    profile = cache_service.get(username)
    if profile is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Profile for '{username}' is not cached. "
                f"Fetch it first via GET /api/profile/{username}"
            ),
        )

    loop = asyncio.get_event_loop()

    if chart_type == ChartType.languages:
        path = await loop.run_in_executor(
            None, chart_service.language_pie, username, profile.languages
        )
    elif chart_type == ChartType.stars:
        path = await loop.run_in_executor(
            None, chart_service.stars_bar, username, profile.top_repos
        )
    elif chart_type == ChartType.commits:
        path = await loop.run_in_executor(
            None, chart_service.commit_frequency, username, profile.commit_stats
        )
    elif chart_type == ChartType.heatmap:
        path = await loop.run_in_executor(
            None, chart_service.activity_heatmap, username, profile.activity_heatmap
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unknown chart type: {chart_type}")

    logger.info("Serving chart %s for %s", chart_type.value, username)
    return FileResponse(str(path), media_type="image/png")
