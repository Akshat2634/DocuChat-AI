# """
# Qwen3 Embedding Model

# Implementation of embedding model using Qwen3-Embedding models.
# """

# import logging
# from typing import List, Optional, Union
# import numpy as np

# try:
#     from sentence_transformers import SentenceTransformer
#     SENTENCE_TRANSFORMERS_AVAILABLE = True
# except ImportError:
#     SENTENCE_TRANSFORMERS_AVAILABLE = False

# try:
#     from transformers import AutoTokenizer, AutoModel
#     import torch
#     TRANSFORMERS_AVAILABLE = True
# except ImportError:
#     TRANSFORMERS_AVAILABLE = False

# from .base_embedding import BaseEmbeddingModel

# logger = logging.getLogger(__name__)


# class QwenEmbeddingModel(BaseEmbeddingModel):
#     """
#     Qwen3 embedding model implementation.
    
#     Supports Qwen3-Embedding models using either sentence-transformers
#     or transformers library.
#     """
    
#     def __init__(
#         self,
#         model_name: str = "Qwen/Qwen3-Embedding-0.6B",
#         device: Optional[str] = None,
#         use_sentence_transformers: bool = True,
#         batch_size: int = 32,
#         **kwargs
#     ):
#         """
#         Initialize Qwen3 embedding model.
        
#         Args:
#             model_name: Qwen3 model name (default: Qwen/Qwen3-Embedding-0.6B)
#             device: Device to use ('cuda', 'cpu', 'mps', or None for auto)
#             use_sentence_transformers: Whether to use sentence-transformers library
#             batch_size: Batch size for processing
#             **kwargs: Additional parameters
#         """
#         super().__init__(model_name, **kwargs)
#         self.device = device or self._get_best_device()
#         self.use_sentence_transformers = use_sentence_transformers
#         self.batch_size = batch_size
#         self.model = None
#         self.tokenizer = None
        
#         # Model dimensions mapping for Qwen3 models
#         self.model_dimensions = {
#             "Qwen/Qwen3-Embedding-0.6B": 1024,
#             "Qwen/Qwen3-Embedding-4B": 2560,
#             "Qwen/Qwen3-Embedding-8B": 4096
#         }
    
#     def _get_best_device(self) -> str:
#         """Automatically select the best available device."""
#         if TRANSFORMERS_AVAILABLE:
#             if torch.cuda.is_available():
#                 return "cuda"
#             elif torch.backends.mps.is_available():
#                 return "mps"
#         return "cpu"
    
#     def initialize(self) -> None:
#         """Initialize the Qwen3 model."""
#         if self.use_sentence_transformers and SENTENCE_TRANSFORMERS_AVAILABLE:
#             self._initialize_with_sentence_transformers()
#         elif TRANSFORMERS_AVAILABLE:
#             self._initialize_with_transformers()
#         else:
#             raise ImportError(
#                 "Neither sentence-transformers nor transformers library is available. "
#                 "Install with: pip install sentence-transformers transformers torch"
#             )
    
#     def _initialize_with_sentence_transformers(self) -> None:
#         """Initialize using sentence-transformers library."""
#         try:
#             logger.info(f"Loading Qwen3 model with sentence-transformers: {self.model_name}")
            
#             self.model = SentenceTransformer(
#                 self.model_name,
#                 device=self.device,
#                 trust_remote_code=True
#             )
            
#             self.embedding_dim = self.model.get_sentence_embedding_dimension()
#             self.is_initialized = True
            
#             logger.info(f"Qwen3 model initialized successfully with dimension {self.embedding_dim}")
            
#         except Exception as e:
#             logger.error(f"Failed to initialize with sentence-transformers: {e}")
#             if TRANSFORMERS_AVAILABLE:
#                 logger.info("Falling back to transformers library")
#                 self._initialize_with_transformers()
#             else:
#                 raise
    
#     def _initialize_with_transformers(self) -> None:
#         """Initialize using transformers library."""
#         try:
#             logger.info(f"Loading Qwen3 model with transformers: {self.model_name}")
            
#             self.tokenizer = AutoTokenizer.from_pretrained(
#                 self.model_name,
#                 trust_remote_code=True
#             )
            
#             self.model = AutoModel.from_pretrained(
#                 self.model_name,
#                 trust_remote_code=True,
#                 torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
#             ).to(self.device)
            
#             # Set embedding dimension
#             self.embedding_dim = self.model_dimensions.get(
#                 self.model_name, 
#                 self.model.config.hidden_size
#             )
            
#             self.use_sentence_transformers = False
#             self.is_initialized = True
            
#             logger.info(f"Qwen3 model initialized with transformers, dimension {self.embedding_dim}")
            
#         except Exception as e:
#             logger.error(f"Failed to initialize with transformers: {e}")
#             raise
    
#     def generate_embeddings(self, texts: List[str]) -> np.ndarray:
#         """
#         Generate embeddings for multiple texts.
        
#         Args:
#             texts: List of texts to embed
            
#         Returns:
#             numpy array of embeddings
#         """
#         if not self.is_initialized:
#             raise ValueError("Model not initialized. Call initialize() first.")
        
#         if not texts:
#             return np.array([])
        
#         try:
#             if self.use_sentence_transformers:
#                 return self._generate_with_sentence_transformers(texts)
#             else:
#                 return self._generate_with_transformers(texts)
                
#         except Exception as e:
#             logger.error(f"Error generating embeddings: {e}")
#             # Return zero vectors as fallback
#             return np.zeros((len(texts), self.embedding_dim))
    
#     def _generate_with_sentence_transformers(self, texts: List[str]) -> np.ndarray:
#         """Generate embeddings using sentence-transformers."""
#         embeddings = self.model.encode(
#             texts,
#             batch_size=self.batch_size,
#             show_progress_bar=True,
#             convert_to_numpy=True
#         )
#         return embeddings
    
#     def _generate_with_transformers(self, texts: List[str]) -> np.ndarray:
#         """Generate embeddings using transformers library."""
#         embeddings = []
        
#         self.model.eval()
#         with torch.no_grad():
#             for i in range(0, len(texts), self.batch_size):
#                 batch_texts = texts[i:i + self.batch_size]
                
#                 # Tokenize
#                 inputs = self.tokenizer(
#                     batch_texts,
#                     padding=True,
#                     truncation=True,
#                     max_length=32000,  # Qwen3 supports up to 32K context
#                     return_tensors="pt"
#                 ).to(self.device)
                
#                 # Get embeddings
#                 outputs = self.model(**inputs)
                
#                 # Mean pooling
#                 attention_mask = inputs['attention_mask']
#                 token_embeddings = outputs.last_hidden_state
#                 input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
#                 batch_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)
                
#                 embeddings.extend(batch_embeddings.cpu().numpy())
        
#         return np.array(embeddings)
    
#     def generate_single_embedding(self, text: str) -> np.ndarray:
#         """
#         Generate embedding for a single text.
        
#         Args:
#             text: Text to embed
            
#         Returns:
#             numpy array representing the embedding
#         """
#         return self.generate_embeddings([text])[0]
    
#     def get_model_info(self) -> dict:
#         """Get detailed model information."""
#         base_info = super().get_model_info()
#         base_info.update({
#             "provider": "Qwen/Alibaba",
#             "api_based": False,
#             "supports_batch": True,
#             "max_context_length": 32000,
#             "device": self.device,
#             "library": "sentence-transformers" if self.use_sentence_transformers else "transformers"
#         })
#         return base_info 