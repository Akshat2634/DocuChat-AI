import logging
import os
from config.logger import setup_logging
from openai import AsyncOpenAI
from openai.types.chat import ChatCompletion
from config import RAGIndexingConfig

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)
config = RAGIndexingConfig()

class ConfigError(Exception):
    """Custom exception for configuration errors"""
    pass

async def parse_openai_response(response: ChatCompletion) -> str:
    """
    Parse the content from an OpenAI ChatCompletion response.
    
    Args:
        response (ChatCompletion): The response from OpenAI API
        
    Returns:
        str: The extracted message content
    """
    return response.choices[0].message.content


async def get_api_key() -> str:
    """
    Retrieve OpenAI API key from environment variables.

    Returns:
        str: The OpenAI API key

    Raises:
        ConfigError: If API key is not found
    """
    try:
        api_key = config.OPENAI_API_KEY
        if api_key is None:
            raise ConfigError(
                "OPENAI_API_KEY not found in environment variables or Streamlit secrets"
            )
        return api_key
    except Exception as e:
        logger.error(f"Failed to retrieve OpenAI API key: {str(e)}")
        raise ConfigError(f"Failed to retrieve OpenAI API key: {str(e)}")


async def get_openai_client() -> AsyncOpenAI:
    """
    Create and configure a LangChain OpenAI chat model.

    Returns:
        ChatOpenAI: Configured LLM instance

    Raises:
        ConfigError: If API key cannot be loaded
    """
    try:
        api_key = await get_api_key()
        os.environ["OPENAI_API_KEY"] = api_key
        logger.info(f"OpenAI API key loaded successfully")
        client = AsyncOpenAI(api_key=api_key)
        return client
    except Exception as e:
        logger.error(f"Failed to create LLM: {str(e)}")
        raise ConfigError(f"Failed to initialize language model: {str(e)}")
