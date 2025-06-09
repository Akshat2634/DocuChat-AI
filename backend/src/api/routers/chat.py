from fastapi import APIRouter
from src.ai import QueryEngine
from config.logger import setup_logging
import logging

setup_logging()
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/chat/{user_id}")
async def chat(user_id: str, query: str):
    query_engine = QueryEngine()
    response = await query_engine.chat_completion(query, [], user_id)
    return response     