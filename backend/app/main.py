"""
CyberAI-Expert v8.0 — FastAPI Main Application
Production-ready async SOC platform backend.
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
import socketio

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import router as api_v1_router
from app.middleware.rate_limiter import RateLimitMiddleware
from app.middleware.metrics import PrometheusMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("cyberai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("=" * 60)
    logger.info("CyberAI-Expert v8.0 — Starting SOC Platform Backend")
    logger.info("=" * 60)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized")

    yield

    logger.info("Shutting down CyberAI-Expert backend")
    await engine.dispose()


# FastAPI App
app = FastAPI(
    title="CyberAI-Expert v8.0",
    description="SOC AI Platform — Real-time Cyber Threat Detection & Response",
    version="8.0.0",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware
app.add_middleware(RateLimitMiddleware)
app.add_middleware(PrometheusMiddleware)

# Socket.IO for real-time alerts (désactivé temporairement)
# sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
# sio_app = socketio.ASGIApp(sio, app, socketio_path="/ws/socket.io")

# @sio.on("connect")
# async def ws_connect(sid, environ):
#     logger.info("WebSocket client connected: %s", sid)

# @sio.on("disconnect")
# async def ws_disconnect(sid):
#     logger.info("WebSocket client disconnected: %s", sid)


# API Routes
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/api/health")
async def health():
    return {"status": "healthy", "version": "8.0.0", "service": "CyberAI-Expert"}


# Mount Socket.IO (désactivé temporairement)
# app.mount("/ws", sio_app)
