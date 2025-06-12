import json
from config import openai as openai_client
from config.logger import setup_logging
import openai
from config.openai import get_openai_client, parse_openai_response
from config import RAGIndexingConfig
from src.ai.prompt import SYSTEM_PROMPT
from src.ai.tools import TOOLS
from src.ai.tool_call import process_tool_call
import logging
from typing import List, Dict
import asyncio
from src.ai.middleware import RedisConversationStore

setup_logging()
logger = logging.getLogger(__name__)

class QueryEngine:
    def __init__(self):
        self.client = None
        config = RAGIndexingConfig()
        self.model = config.OPENAI_CHAT_MODEL
        self.system_prompt = SYSTEM_PROMPT
        self.tools = TOOLS
        self.redis = RedisConversationStore()
        logger.info(f"QueryEngine initialized with model: {self.model}")
        
    async def chat_completion(self, user_query: str,conversation_history: List[Dict], user_id: str):
        
        try:
            self.client = await openai_client.get_openai_client()
            logger.debug("OpenAI client initialized successfully")
        
            # Track the starting length of conversation history to identify new messages
            initial_history_length = len(conversation_history)
            
            if not any(message["role"] == "system" for message in conversation_history):
                conversation_history.insert(0, {"role": "system", "content": self.system_prompt})
                
            conversation_history.append({"role": "user", "content": user_query})
            
            response =  await self.client.chat.completions.create(
                model=self.model,
                messages= conversation_history,
                temperature=0.2,
                max_tokens=2500,
                tools = self.tools
            )
            logger.info("Initial OpenAI response received")
            
            if response.choices[0].message.tool_calls:
                tool_calls = response.choices[0].message.tool_calls
                logger.info(f"Tool calls detected: {len(tool_calls)} tools to execute")
                
                # Process all tool calls concurrently
                async def process_single_tool_call(tool_call):
                    tool_name = tool_call.function.name
                    logger.info(f"Function Name: {tool_name}")
                    tool_args = json.loads(tool_call.function.arguments)
                    logger.info(f"Arguments: {tool_args}")
                    
                    tool_response = await process_tool_call(tool_name, tool_args, user_id)
                    return {
                        "function_name": tool_name,
                        "response": tool_response,
                        "tool_call_id": tool_call.id,
                        "raw_response": tool_response,
                    }
                
                # Execute all tool calls in parallel
                tool_call_results = await asyncio.gather(
                    *[process_single_tool_call(tool_call) for tool_call in tool_calls]
                )
                
                for tool_call, function_response in zip(tool_calls, tool_call_results):
                    try:
                            assistant_message = {
                                "role": "assistant",
                                "content": f"function called {tool_call.function.name}",
                                "tool_calls": [tool_call.model_dump()],
                            }
                            conversation_history.append(assistant_message)

                            tool_message = {
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "content": function_response["raw_response"],
                            }
                            conversation_history.append(tool_message)
                    except Exception as e:
                        logger.error(f"Error in tool call: {e}")
                        continue
                final_response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=conversation_history,
                    temperature=0.2,
                    max_tokens=2500
                )
                ai_response = await parse_openai_response(final_response)
                conversation_history.append({"role": "assistant", "content": ai_response})
                
                logger.info("Final response generated successfully with tool calls")
                
            else:
                logger.info("No tool calls detected, returning direct response")
                ai_response = await parse_openai_response(response)
                conversation_history.append({"role": "assistant", "content": ai_response})
                logger.info("Direct response generated successfully")
            
            # Save only the new messages to Redis (from the initial length onwards)
            new_messages = conversation_history[initial_history_length:]
            if new_messages:
                for message in new_messages:
                    await self.redis.add_message_to_conversation(user_id, message)
                logger.info(f"Saved {len(new_messages)} new messages to Redis for user {user_id}")
            
            return ai_response
            
        except openai.RateLimitError as e:
            logger.error(f"OpenAI API rate limit exceeded: {str(e)}")
            logger.exception(f"An error occurred: {str(e)}")
            raise Exception("Rate limit exceeded. Please try again later.")

        except openai.AuthenticationError as e:
            logger.error(f"OpenAI API authentication error: {str(e)}")
            logger.exception(f"An error occurred: {str(e)}")
            raise Exception("Authentication failed. Please check your API key.")

        except openai.APIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            logger.exception(f"An error occurred: {str(e)}")
            raise Exception("API error occurred. Please try again later.")

        except Exception as e:
            logger.error(f"Unexpected error in chat_completion for user {user_id}: {str(e)}")
            logger.exception(f"An error occurred: {str(e)}")
            raise Exception("An unexpected error occurred. Please try again later.")        