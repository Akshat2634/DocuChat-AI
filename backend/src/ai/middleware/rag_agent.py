"""
Simplified RAG Agent Module

This module contains simplified RAG agent functionality that fetches all vector embeddings
for a user and lets OpenAI handle the semantic matching and answer generation.
"""

import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import json
import numpy as np
from src.services.embedding_models import OpenAIEmbeddingModel
from src.services.lance_db import LanceDBVectorStore
from config.logger import setup_logging
from config.openai import get_openai_client, parse_openai_response
from config import RAGIndexingConfig

setup_logging()
logger = logging.getLogger(__name__)


class RAGAgent:
    """
    Simplified RAG Agent that fetches all user embeddings and lets OpenAI handle matching.
    
    This class handles user queries by:
    1. Generating embeddings for the query
    2. Fetching all vector embeddings from user-specific vector DB
    3. Sending both query embedding and all document embeddings to OpenAI
    4. Letting OpenAI find relevant documents and generate the answer
    """
    
    def __init__(self):
        """Initialize the RAG agent with required components."""
        self.embedding_model = OpenAIEmbeddingModel()
        self.vector_store = LanceDBVectorStore()
        self.openai_client = None
        self.config = RAGIndexingConfig()
        self.initialized = False
    async def initialize(self) -> None:
        """Initialize the embedding model and OpenAI client."""
        self.initialized = True
        self.openai_client = await get_openai_client()
        logger.info("RAG Agent initialized successfully")
    
    async def _embed_query(self, user_query: str) -> np.ndarray:
        """
        Generate embedding for the user query.
        
        Args:
            user_query: The user's question
            
        Returns:
            Query embedding as numpy array
            
        Raises:
            RuntimeError: If embedding generation fails
        """
        logger.info(f"Generating embedding for query: {user_query[:100]}...")
        query_embedding = await self.embedding_model.generate_single_embedding(user_query)
        if query_embedding is None or len(query_embedding) == 0:
            raise RuntimeError("Failed to generate query embedding")
        return np.array(query_embedding)

    async def _retrieve_relevant_chunks(
        self, 
        query_embedding: np.ndarray, 
        user_id: str, 
        top_k: int
    ) -> List[Dict[str, Any]]:
        """
        Retrieve the most relevant document chunks from vector store.
        
        Args:
            query_embedding: The embedded query
            user_id: User ID for filtering
            top_k: Number of chunks to retrieve
            
        Returns:
            List of relevant document chunks
            
        Raises:
            RuntimeError: If no relevant documents found
        """
        logger.info(f"Searching top {top_k} chunks for user {user_id}")
        self.vector_store.db_path = Path(f"vector_db/{user_id}")
        
        # First, check if there are any documents at all for this user
        table_info = await self.vector_store.get_table_info()
        logger.info(f"Table info for user {user_id}: {table_info}")
        
        if table_info.get("row_count", 0) == 0:
            raise RuntimeError("No documents found in your vector database. Please upload some documents first.")
        
        
        relevant = await self.vector_store.search_similar(
            query_embedding=query_embedding,
            limit=top_k,
            similarity_threshold=0.0  # No similarity filtering
        )
        
        if not relevant:
            raise RuntimeError("No documents found in your vector database, even without similarity filtering. There might be a technical issue.")
        
        logger.info(f"Found {len(relevant)} relevant documents")
        # Log similarity scores for debugging
        for i, doc in enumerate(relevant):
            logger.info(f"Document {i+1} similarity score: {doc.get('similarity_score', 'N/A')}")
        
        return relevant

    def _build_context(self, relevant_chunks: List[Dict[str, Any]]) -> str:
        """
        Build context string from relevant document chunks.
        
        Args:
            relevant_chunks: List of relevant document chunks
            
        Returns:
            Formatted context string
        """
        context_parts = []
        for doc in relevant_chunks:
            context_parts.append(f"---\nFile: {doc['file_name']}, Chunk: {doc['chunk_index']}\n{doc['text']}")
        
        return "\n\n".join(context_parts)

    def _prepare_chat_messages(self, user_query: str, context: str) -> List[Dict[str, str]]:
        """
        Prepare messages for OpenAI chat completion.
        
        Args:
            user_query: The user's question
            context: The context built from relevant chunks
            
        Returns:
            List of message dictionaries for OpenAI API
        """
        system_prompt = (
            "You are a helpful assistant that answers questions using the provided document excerpts.\n"
            "Use only the content in the context to answer the user. If the answer is not contained, say so."
        )
        user_prompt = (
            f"User Query: {user_query}\n\n"
            f"Context:\n{context}\n\n"
            "Please answer the question based on the above context."
        )
        
        return [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

    async def _generate_openai_response(self, messages: List[Dict[str, str]], user_id: str) -> str:
        """
        Generate response using OpenAI chat completion.
        
        Args:
            messages: List of messages for OpenAI API
            user_id: User ID for logging
            
        Returns:
            Generated answer from OpenAI
        """
        logger.info(f"Calling OpenAI chat completion for user {user_id}...")
        response = await self.openai_client.chat.completions.create(
            model=self.config.OPENAI_CHAT_MODEL,
            messages=messages,
            temperature=0.2
        )
        return await parse_openai_response(response)

    async def generate_answer_with_embeddings(
        self,
        user_query: str,
        user_id: str,
        top_k: int = 5,
    ) -> Dict[str, Any]:
        """
        Generate an answer by:
            1. Embedding the query
            2. Retrieving the top_k most similar document chunks
            3. Sending only those chunks + query to OpenAI
        """
        try:
            if not self.initialized:
                await self.initialize()
                
            # 1. Embed the query
            query_embedding = await self._embed_query(user_query)

            # 2. Retrieve relevant chunks
            relevant_chunks = await self._retrieve_relevant_chunks(
                query_embedding, user_id, top_k
            )

            # 3. Build the context string
            context = self._build_context(relevant_chunks)

            # 4. Prepare messages for OpenAI Chat completion
            messages = self._prepare_chat_messages(user_query, context)

            # 5. Generate response using OpenAI
            answer = await self._generate_openai_response(messages, user_id)

            return {
                "status": "success",
                "message": "Answer generated successfully",
                "user_id": user_id,
                "query": user_query,
                "answer": answer
            }

        except RuntimeError as e:
            return {
                "status": "error",
                "message": str(e),
                "user_id": user_id,
                "query": user_query,
                "answer": "I'm sorry, I couldn't find anything relevant in your documents."
            }
        except Exception as e:
            logger.error(f"Error in generate_answer_with_embeddings: {e}", exc_info=True)
            return {
                "status": "error",
                "message": str(e),
                "user_id": user_id,
                "query": user_query,
                "answer": "I encountered an error while processing your request."
            }
