"""
RAG Configuration

Configuration for the RAG pipeline that processes documents
and creates embeddings for similarity search using Qwen3 models.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
from config.base import BaseConfig

class RAGIndexingConfig(BaseConfig):
    """
    Configuration for the RAG indexing pipeline.
    
    This pipeline processes documents (PDFs, DOCX, etc.) and creates embeddings 
    for similarity search using OpenAI embedding models.
    """
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    # Document Processing Configuration
    SUPPORTED_FILE_TYPES: List[str] = Field(
        default=["pdf", "docx", "txt"],
        description="Supported file types for document processing"
    )
    
    # Text Chunking Configuration
    CHUNK_SIZE: int = Field(
        default=1000,
        description="Size of text chunks for embedding"
    )
    
    OVERLAP_SIZE: int = Field(
        default=200,
        description="Overlap between text chunks"
    )
    
    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = Field(
        default=None,
        description="OpenAI API key for embeddings"
    )
    
    OPENAI_EMBEDDING_MODEL: str = Field(
        default="text-embedding-3-small",
        description="OpenAI embedding model"
    )
    
    OPENAI_CHAT_MODEL: str = Field(
        default="gpt-4.1-mini",
        description="OpenAI model"
    )
    
    OPENAI_EMBEDDING_DIMENSION: int = Field(
        default=1536,
        description="OpenAI embedding dimension"
    )
    
    EMBEDDING_PROVIDER: str = Field(
        default="openai",
        description="OpenAI embedding provider"
    )
    
    OPENAI_MAX_TOKENS: int = Field(
        default=8191,
        description="OpenAI maximum tokens per request"
    )
    
    # LanceDB Configuration
    LANCEDB_TABLE_NAME: str = Field(
        default="documents",
        description="Name of the LanceDB table"
    )
    
    LANCEDB_PATH: str = Field(
        default="vector_db",
        description="Path to the LanceDB database"
    )
    
    # Search Configuration
    DEFAULT_SEARCH_LIMIT: int = Field(
        default=5,
        description="Default number of search results to return"
    )
    
    SIMILARITY_THRESHOLD: float = Field(
        default=0.6,
        description="Minimum similarity threshold for search results"
    )
    
    # Processing Configuration
    BATCH_SIZE: int = Field(
        default=32,
        description="Batch size for embedding generation"
    )
    
    # Redis Configuration
    REDIS_HOST: str = Field(
        default="localhost",
        description="Redis host"
    )
    
    REDIS_PORT: int = Field(
        default=6379,
        description="Redis port"
    )
    
    REDIS_DB: int = Field(
        default=0,
        description="Redis database"
    )
    
    # Redis Cloud Configuration
    REDIS_USERNAME: Optional[str] = Field(
        default=None,
        description="Redis username (for Redis Cloud)"
    )
    
    REDIS_PASSWORD: Optional[str] = Field(
        default=None,
        description="Redis password (for Redis Cloud)"
    )
    
    REDIS_SSL: bool = Field(
        default=False,
        description="Use SSL for Redis connection"
    )
    
    CONVERSATION_TTL: int = Field(
        default=7200,
        description="Conversation TTL in seconds"
    )
    
    MAX_CONVERSATION_LENGTH: int = Field(
        default=50,
        description="Maximum messages per conversation"
    )