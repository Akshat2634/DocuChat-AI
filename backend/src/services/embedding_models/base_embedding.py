"""
Base Embedding Model

Abstract base class for all embedding models.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any
import numpy as np


class BaseEmbeddingModel(ABC):
    """
    Abstract base class for embedding models.
    
    All embedding models should inherit from this class and implement
    the required methods.
    """
    
    def __init__(self, model_name: str, **kwargs):
        """
        Initialize the embedding model.
        
        Args:
            model_name: Name of the model
            **kwargs: Additional model-specific parameters
        """
        self.model_name = model_name
        self.embedding_dim = None
        self.is_initialized = False
    
    @abstractmethod
    def initialize(self) -> None:
        """Initialize the model. Must be implemented by subclasses."""
        pass
    
    @abstractmethod
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            numpy array of embeddings
        """
        pass
    
    @abstractmethod
    def generate_single_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
            
        Returns:
            numpy array representing the embedding
        """
        pass
    
    def get_embedding_dimension(self) -> int:
        """Get the embedding dimension."""
        if self.embedding_dim is None:
            raise ValueError("Model not initialized. Call initialize() first.")
        return self.embedding_dim
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information."""
        return {
            "model_name": self.model_name,
            "embedding_dimension": self.embedding_dim,
            "is_initialized": self.is_initialized
        }
    
    def __str__(self) -> str:
        return f"{self.__class__.__name__}(model_name='{self.model_name}')"
    
    def __repr__(self) -> str:
        return self.__str__() 