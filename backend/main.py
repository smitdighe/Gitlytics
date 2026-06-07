import traceback
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from api.dependencies import get_cache_service, init_services
from api.routes import charts, compare, profile, share
from config import get_settings
from utils.exceptions import GitHubRateLimitError, UserNotFoundError
from utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="Gitlytics",
    version="1.0.0",
    description="Analyse and compare GitHub profiles with rich visualisations.",
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for rendered charts
chart_dir = Path(settings.CHART_DIR)
chart_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/charts", StaticFiles(directory=str(chart_dir)), name="charts")

# Routers
app.include_router(profile.router)
app.include_router(charts.router)
app.include_router(compare.router)
app.include_router(share.router)

# Startup / Shutdown
@app.on_event("startup")
async def startup_event():

    logger.info("Starting Gitlytics v1.0.0")
    init_services(settings)

    cache_service = get_cache_service()
    purged = cache_service.purge_expired()
    logger.info("Purged %d expired cache entries on startup", purged)

    app.state.executor = ThreadPoolExecutor(max_workers=10)
    logger.info("Thread pool created (max_workers=10)")


@app.on_event("shutdown")
async def shutdown_event():

    executor = getattr(app.state, "executor", None)
    if executor is not None:
        executor.shutdown(wait=False)
        logger.info("Thread pool shut down")


# Global exception handlers
@app.exception_handler(UserNotFoundError)
async def user_not_found_handler(request: Request, exc: UserNotFoundError):
    logger.warning("User not found: %s", exc)
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(GitHubRateLimitError)
async def rate_limit_handler(request: Request, exc: GitHubRateLimitError):
    logger.warning("Rate limit hit: %s", exc)
    return JSONResponse(
        status_code=429,
        content={"detail": str(exc)},
        headers={"Retry-After": str(int(exc.reset_at.timestamp()))},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception: %s\n%s", exc, traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )
