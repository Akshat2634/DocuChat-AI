import json
from config.logger import setup_logging
import logging
from src.ai.middleware import RAGAgent    

setup_logging()
logger = logging.getLogger(__name__)
    
async def process_tool_call(tool_name: str, tool_args: dict, user_id: str):
    logger.info(f"Processing tool call: {tool_name} with args: {tool_args}")
    try:
        if tool_name == "rag_agent_tool":
            logger.info(f"*********Processing RAG agent tool call*********")
            agent = RAGAgent()
            user_query = tool_args.get("user_query")
            rag_response = await agent.generate_answer_with_embeddings(user_query, user_id)
            return rag_response.get("answer")
    except Exception as e:
        logger.error(f"Error in process_tool_call: {e}")
        return json.dumps({"error": f"Error in {tool_name}: {str(e)}"})
