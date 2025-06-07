"""
Test RAG Pipeline

A test implementation of the RAG pipeline for document processing.
"""

from typing import List, Dict, Any
import numpy as np
from src.services import DocumentProcessor, Chunker, OpenAIEmbeddingModel


class TestRAGPipeline:
    """
    Test RAG Pipeline for processing documents and generating embeddings.
    """
    
    def __init__(self):
        self.document_processor = DocumentProcessor()
        self.chunker = Chunker()
        self.embedding_model = OpenAIEmbeddingModel()
        
    async def process_document(self, file_path: str) -> Dict[str, Any]:
        """
        Process a document from file path and return embeddings
        
        Args:
            file_path: Path to the document file
            
        Returns:
            dict: Processing results with embeddings and metadata
        """
        try:
            # Read file content
            with open(file_path, 'rb') as file:
                file_content = file.read()
            
            # Create mock upload file
            class MockUploadFile:
                def __init__(self, filename: str, content: bytes):
                    self.filename = filename
                    self._content = content
                    self._position = 0
                
                async def read(self) -> bytes:
                    return self._content
                
                async def seek(self, position: int) -> None:
                    self._position = position
            
            mock_file = MockUploadFile(file_path, file_content)
            
            # Extract text
            text, file_type = await self.document_processor.extract_text_from_upload(mock_file)
            
            # Chunk text
            chunks = await self.chunker.chunk_text(text)
            
            # Generate embeddings
            embeddings = await self.embedding_model.generate_embeddings(chunks)
            
            return {
                "status": "success",
                "file_type": file_type,
                "text_length": len(text),
                "num_chunks": len(chunks),
                "embeddings_shape": embeddings.shape,
                "embeddings": embeddings
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
