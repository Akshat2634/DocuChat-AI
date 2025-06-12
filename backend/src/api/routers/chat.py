from fastapi import APIRouter, HTTPException
from src.ai import QueryEngine
from config.logger import setup_logging
import logging
from src.ai.middleware import RedisConversationStore

setup_logging()
logger = logging.getLogger(__name__)

router = APIRouter()
redis = RedisConversationStore()

@router.post("/chat/{user_id}")
async def chat(user_id: str, query: str):
    try:
        query_engine = QueryEngine()
        conversation_history = await redis.get_conversation_history(user_id)
        logger.info(f"Conversation history: {len(conversation_history)} messages for user {user_id}")
        response = await query_engine.chat_completion(query, conversation_history, user_id)
        return response
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await redis.close()