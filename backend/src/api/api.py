import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {
        "message": "Welcome to the DocuChat AI API",
        "version": "0.1.0",
        "description": "API for document processing, embedding generation, and RAG querying",
        "endpoints": [
            {"path": "/api/documents/upload", "method": "POST", "description": "Upload documents for processing"},
            {"path": "/health", "method": "GET", "description": "Check the health of the API"}
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"} 
