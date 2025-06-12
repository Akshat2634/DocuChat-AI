import redis.asyncio as redis
import json
import logging
from typing import List, Dict, Optional
from config import RAGIndexingConfig
from config.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

class RedisConversationStore:
    def __init__(self):
        config = RAGIndexingConfig()
        # Add these to your config
        self.redis_host = config.REDIS_HOST
        self.redis_port = config.REDIS_PORT
        self.redis_db = config.REDIS_DB
        self.conversation_ttl = config.CONVERSATION_TTL
        self.max_conversation_length = config.MAX_CONVERSATION_LENGTH
        self.redis_client = None
        logger.info(f"Redis initialized with host: {self.redis_host}, port: {self.redis_port}, db: {self.redis_db}")
    
    async def get_redis_client(self):
        if not self.redis_client:
            self.redis_client = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                db=self.redis_db,
                decode_responses=True
            )
        return self.redis_client
    
    def _get_conversation_key(self, user_id: str) -> str:
        return f"conversation:{user_id}"
    
    async def get_conversation_history(self, user_id: str) -> List[Dict]:
        """Retrieve conversation history for a user"""
        try:
            client = await self.get_redis_client()
            key = self._get_conversation_key(user_id)
            
            # Get all messages from the list
            messages = await client.lrange(key, 0, -1)
            
            if not messages:
                return []
            
            # Parse JSON messages
            conversation_history = []
            for message in messages:
                try:
                    conversation_history.append(json.loads(message))
                except json.JSONDecodeError:
                    logger.error(f"Failed to decode message for user {user_id}")
                    continue
            
            return conversation_history
            
        except Exception as e:
            logger.error(f"Error retrieving conversation history for user {user_id}: {str(e)}")
            return []
    
    async def add_message_to_conversation(self, user_id: str, message: Dict):
        """Add a single message to conversation history"""
        try:
            client = await self.get_redis_client()
            key = self._get_conversation_key(user_id)
            
            # Add message to the end of the list
            await client.rpush(key, json.dumps(message))
            
            # Trim conversation if it gets too long
            await client.ltrim(key, -self.max_conversation_length, -1)
            
            # Set TTL on the key
            await client.expire(key, self.conversation_ttl)
            
        except Exception as e:
            logger.error(f"Error adding message to conversation for user {user_id}: {str(e)}")
    
    async def add_messages_to_conversation(self, user_id: str, messages: List[Dict]):
        """Add multiple messages to conversation history"""
        try:
            client = await self.get_redis_client()
            key = self._get_conversation_key(user_id)
            
            # Add all messages
            pipeline = client.pipeline()
            for message in messages:
                pipeline.rpush(key, json.dumps(message))
            
            # Trim and set TTL
            pipeline.ltrim(key, -self.max_conversation_length, -1)
            pipeline.expire(key, self.conversation_ttl)
            
            await pipeline.execute()
            
        except Exception as e:
            logger.error(f"Error adding messages to conversation for user {user_id}: {str(e)}")
    
    async def clear_conversation(self, user_id: str):
        """Clear conversation history for a user"""
        try:
            client = await self.get_redis_client()
            key = self._get_conversation_key(user_id)
            await client.delete(key)
            
        except Exception as e:
            logger.error(f"Error clearing conversation for user {user_id}: {str(e)}")
    
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()