from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from api.dependencies import CurrentUser, ShareDep
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/share", tags=["share"])

class ShareRequest(BaseModel):
    username: str

class ShareResponse(BaseModel):
    token: str
    url: str


@router.post("/", response_model=ShareResponse)
async def create_share(
    body: ShareRequest,
    current_user: CurrentUser,
    share_service: ShareDep,
):
    token = share_service.create_share(body.username)
    url = f"/share/{token}"
    logger.info("Share link for %s: %s", body.username, url)
    return ShareResponse(token=token, url=url)


@router.get("/{token}")
async def resolve_share(
    token: str,
    current_user: CurrentUser,
    share_service: ShareDep,
):
    username = share_service.resolve_share(token)
    if username is None:
        raise HTTPException(status_code=404, detail=f"Share token '{token}' not found")
    logger.info("Resolved share token %s → %s", token, username)
    return RedirectResponse(url=f"/api/profile/{username}", status_code=307)
