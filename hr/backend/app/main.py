import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import SessionLocal, engine, db_type
from app.services.seed_service import seed_database
from app.ws.manager import ws_manager

from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.requests import router as requests_router
from app.api.triage import router as triage_router
from app.api.copilot import router as copilot_router
from app.api.deliverables import router as deliverables_router
from app.api.actions import router as actions_router
from app.api.insights import router as insights_router
from app.api.policies import router as policies_router
from app.api.chat import router as chat_router
from app.schemas.auth import UserProfile
from app.api.auth import get_profile

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("hr_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up HR AI Backend Core API...")
    logger.info("Active Database Engine: %s", db_type.upper())
    # Seed DB with initial enterprise demo data
    db = SessionLocal()
    try:
        seed_database(db)
        # Ensure knowledge base documents are synced on startup
        from app.services.document_service import sync_knowledge_base_documents
        sync_knowledge_base_documents(db)
    finally:
        db.close()
    yield
    logger.info("Shutting down HR AI Backend Core API...")

from fastapi.responses import RedirectResponse

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

@app.get("/api/v1/docs", include_in_schema=False)
def redirect_to_docs():
    return RedirectResponse(url="/docs")

@app.get("/api/v1/openapi.json", include_in_schema=False)
def redirect_to_openapi():
    return RedirectResponse(url="/openapi.json")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 Routers
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(requests_router, prefix=api_prefix)
app.include_router(triage_router, prefix=api_prefix)
app.include_router(copilot_router, prefix=api_prefix)
app.include_router(deliverables_router, prefix=api_prefix)
app.include_router(actions_router, prefix=api_prefix)
app.include_router(insights_router, prefix=api_prefix)
app.include_router(policies_router, prefix=api_prefix)
app.include_router(chat_router, prefix=api_prefix)

# Direct aliases for frontend client compatibility (/api/chat, /api/v1/profile, /profile, /policies)
app.include_router(chat_router, prefix="/api")
app.include_router(policies_router, prefix="")
app.add_api_route(f"{api_prefix}/profile", get_profile, methods=["GET"], response_model=UserProfile, tags=["Authentication"])
app.add_api_route("/profile", get_profile, methods=["GET"], response_model=UserProfile, tags=["Authentication"])


@app.get("/health", tags=["System Health"])
def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "database": db_type,
        "timestamp": "2026-10-24T12:00:00Z"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "HR AI Ecosystem Core API is active",
        "docs": f"{settings.API_V1_STR}/docs",
        "version": settings.VERSION,
        "database": db_type
    }

# Real-time WebSocket Protocol
@app.websocket(f"{settings.API_V1_STR}/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Receive client ping or heartbeat messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning("WebSocket connection dropped: %s", e)
        ws_manager.disconnect(websocket)
