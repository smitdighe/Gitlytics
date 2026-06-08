import traceback
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from api.dependencies import get_auth_service, get_cache_service, init_services
from api.routes import auth, charts, compare, profile, share
from config import get_settings
from utils.exceptions import GitHubRateLimitError, UserNotFoundError
from utils.logger import get_logger

logger = get_logger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Gitlytics",
    version="1.0.0",
    description="Analyse and compare GitHub profiles with rich visualisations.",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chart_dir = Path(settings.CHART_DIR)
chart_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/charts", StaticFiles(directory=str(chart_dir)), name="charts")
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(charts.router)
app.include_router(compare.router)
app.include_router(share.router)


@app.on_event("startup")
async def startup_event():

    logger.info("Starting Gitlytics v1.0.0")
    init_services(settings)

    cache_service = get_cache_service()
    purged = cache_service.purge_expired()
    logger.info("Purged %d expired cache entries on startup", purged)

    auth_service = get_auth_service()
    purged_tokens = auth_service.purge_expired_refresh_tokens()
    logger.info("Purged %d expired refresh tokens on startup", purged_tokens)

    app.state.executor = ThreadPoolExecutor(max_workers=10)
    logger.info("Thread pool created (max_workers=10)")


@app.on_event("shutdown")
async def shutdown_event():

    executor = getattr(app.state, "executor", None)
    if executor is not None:
        executor.shutdown(wait=False)
        logger.info("Thread pool shut down")

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
