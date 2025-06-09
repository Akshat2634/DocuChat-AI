import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
from src.rag_pipeline import RAGPipeline
from config.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload-document/{user_id}")
async def upload_document(user_id: uuid.UUID, file: UploadFile = File(...)):
    try:
        logger.info(f"Uploading document for user {user_id}")
        rag_pipeline = RAGPipeline()
        result = await rag_pipeline.process_document(file, file.filename, file.content_type, user_id)
        logger.info(f"Document uploaded successfully for user {user_id}")
        return result
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))