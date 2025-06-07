"""
OpenAI Embedding Model

Implementation of embedding model using OpenAI's API.
"""

import logging
from typing import List, Optional, Dict, Any 
import numpy as np
from config import RAGIndexingConfig
from openai import AsyncOpenAI
from .base_embedding import BaseEmbeddingModel

logger = logging.getLogger(__name__)


class OpenAIEmbeddingModel(BaseEmbeddingModel):
    """
    OpenAI embedding model implementation.
    
    Uses OpenAI's embedding API to generate text embeddings.
    """
    
    def __init__(self):
        config = RAGIndexingConfig()
        super().__init__(config.OPENAI_EMBEDDING_MODEL)
        self.api_key = config.OPENAI_API_KEY
        self.client = None
        self.batch_size = config.BATCH_SIZE
        # Set embedding dimension based on model
        if "text-embedding-3-small" in self.model_name:
            self.embedding_dim = 1536
        elif "text-embedding-3-large" in self.model_name:
            self.embedding_dim = 3072
        else:
            self.embedding_dim = 1536  # default

    
    async def initialize(self) -> None:
        """Initialize the OpenAI client."""
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Please set OPENAI_API_KEY in your environment.")
        
        try:
            self.client = AsyncOpenAI(api_key=self.api_key)
            self.is_initialized = True
            logger.info(f"OpenAI embedding model '{self.model_name}' initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI model: {e}")
            raise
    
    async def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            numpy array of embeddings
        """
        if not self.is_initialized:
            raise ValueError("Model not initialized. Call initialize() first.")
        
        if not texts:
            return np.array([])
        
        embeddings = []
        
        try:
            # Process texts in batches
            for i in range(0, len(texts), self.batch_size):
                batch_texts = texts[i:i + self.batch_size]
                
                # OpenAI API supports batch processing
                response = await self.client.embeddings.create(
                    model=self.model_name,
                    input=batch_texts,
                )
                
                for data in response.data:
                    embeddings.append(data.embedding)
            
            logger.info(f"Generated embeddings for {len(texts)} texts in batches of {self.batch_size}")
            return np.array(embeddings)
            
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            # Return zero vectors as fallback
            fallback_embeddings = np.zeros((len(texts), self.embedding_dim))
            return fallback_embeddings
    
    async def generate_single_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            numpy array representing the embedding
        """
        if not self.is_initialized:
            raise ValueError("Model not initialized. Call initialize() first.")
        
        try:
            response = await self.client.embeddings.create(
                model=self.model_name,
                input=text,
            )
            
            embedding = response.data[0].embedding
            return np.array(embedding)
            
        except Exception as e:
            logger.error(f"Error generating single embedding: {e}")
            # Return zero vector as fallback
            return np.zeros(self.embedding_dim)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get detailed model information."""
        base_info = super().get_model_info()
        base_info.update({
            "provider": "openai",
            "batch_size": self.batch_size,
        })
        return base_info