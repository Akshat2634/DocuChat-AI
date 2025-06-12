import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routers import document_upload
from src.api.routers import chat
from src.api.routers import cleanup
from config.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DocuChat AI: AI-powered Interactive Document Chat Platform",
    description="API for document processing, embedding generation, and RAG querying",
    version="0.1.0"
)

origins = [
    "*",
]


app.include_router(document_upload.router)
app.include_router(chat.router)
app.include_router(cleanup.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize scheduled tasks on startup."""
    logger.info("Starting up application and initializing scheduled tasks...")
    
    # Import and start the scheduled cleanup task
    from src.tasks.cleanup import scheduled_vector_db_cleanup
    
    # The @repeat_every decorator will handle the scheduling
    # We just need to call it once to start the periodic execution
    await scheduled_vector_db_cleanup()
    
    logger.info("Scheduled vector DB cleanup task initialized")


@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {
        "message": "Welcome to the DocuChat AI API",
        "version": "0.1.0",
        "description": "API for document processing, embedding generation, and RAG querying",
        "endpoints": [
            {"path": "/api/documents/upload", "method": "POST", "description": "Upload documents for processing"},
            {"path": "/api/cleanup/vector-db", "method": "POST", "description": "Manually trigger vector DB cleanup"},
            {"path": "/api/cleanup/status", "method": "GET", "description": "Get cleanup configuration and status"},
            {"path": "/health", "method": "GET", "description": "Check the health of the API"}
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"} 
