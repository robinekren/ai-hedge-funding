"""
AI Hedge Funding — FastAPI Application
Main entry point for the backend server.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.agents.agent_manager import AgentManager
from backend.autonomy.protocol import AutonomyProtocol
from backend.notifications.notifier import Notifier
from backend.data.store import store
from backend.api import routes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize all system components on startup."""
    logger.info("=" * 60)
    logger.info("  AI HEDGE FUNDING — System Starting")
    logger.info("  Eko Growth LLC — Wyoming")
    logger.info("  Robin (Owner) · Felix (CTO / Owner)")
    logger.info("=" * 60)

    # Initialize core components
    manager = AgentManager()
    protocol = AutonomyProtocol()
    notif = Notifier()

    # Wire up shared state for routes
    routes.agent_manager = manager
    routes.autonomy_protocol = protocol
    routes.notifier = notif
    routes.data_store = store

    # Start all 8 agents
    manager.start_all()

    logger.info("All systems initialized — AI Hedge Funding is LIVE")
    yield

    # Shutdown
    manager.stop_all()
    logger.info("AI Hedge Funding — System shutdown complete")


app = FastAPI(
    title="AI Hedge Funding",
    description="The World's Most Autonomous AI-Driven Hedge Fund",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow dashboard frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(routes.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "AI Hedge Funding",
        "status": "operational",
        "entity": "Eko Growth LLC — Wyoming",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
