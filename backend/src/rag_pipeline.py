from datetime import datetime
import logging
from typing import List
import uuid
import os
from pathlib import Path
from fastapi import UploadFile
from src.services import DocumentProcessor, Chunker, OpenAIEmbeddingModel, LanceDBVectorStore
from config.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

class RAGPipeline:
    def __init__(self):
        self.document_processor = DocumentProcessor()
        self.chunker = Chunker()
        self.embedding_model = OpenAIEmbeddingModel()
        
    async def process_document(self, file: UploadFile, file_name: str, file_type: str, user_id: uuid.UUID) -> dict:
        """
        Process a document through the complete RAG pipeline and store in LanceDB.
        
        Args:
            file: UploadFile object from FastAPI
            file_name: Name of the original file
            file_type: Type of the file (pdf, txt, docx, etc.)
            user_id: User ID for the document
        Returns:
            dict: Processing results with user_id and stats
        """
        logger.info(f"Starting document processing for user {user_id}, file: {file_name}")
        
        try:
            # Create a unique LanceDB instance for this document with user_id-based path
            vector_store = LanceDBVectorStore()
            # Override the default db path to include the user_id
            vector_store.db_path = Path(f"vector_db/{user_id}")
            logger.info(f"Vector store initialized with path: {vector_store.db_path}")
            
            # Process document text - pass the UploadFile directly
            logger.info(f"Extracting text from document: {file_name}")
            text, file_type = await self.document_processor.extract_text_from_upload(file)
            logger.info(f"Text extracted successfully from {file_name}, length: {len(text)} characters")
            
            # Chunk the text
            logger.info(f"Starting text chunking for document: {file_name}")
            chunks = await self.chunker.chunk_text(text)
            logger.info(f"Text chunked successfully into {len(chunks)} chunks")
            
            # Generate embeddings for all chunks
            logger.info(f"Generating embeddings for {len(chunks)} chunks")
            embeddings = await self.embedding_model.generate_embeddings(chunks)
            logger.info(f"Embeddings generated successfully for {len(embeddings)} chunks")
            
            # Prepare metadata for each chunk
            logger.info(f"Preparing metadata for {len(chunks)} chunks")
            metadata = []
            for i, chunk in enumerate(chunks):
                meta = {
                    "chunk_index": i,
                    "user_id": str(user_id),
                    "chunk_length": len(chunk),
                    "processing_timestamp": str(datetime.now()),
                    "total_chunks": len(chunks),
                }
                metadata.append(meta)
            logger.info(f"Metadata prepared for {len(metadata)} chunks")
            
            # Store embeddings in LanceDB
            logger.info(f"Storing embeddings in LanceDB at path: {vector_store.db_path}")
            await vector_store.add_embeddings(
                texts=chunks,
                embeddings=embeddings,
                metadata=metadata,
                file_name=file_name,
                file_type=file_type
            )
            logger.info(f"Embeddings stored successfully in LanceDB")
            
            result = {
                "status": "success",
                "message": "Document indexed successfully",
                "user_id": str(user_id),
                "db_path": str(vector_store.db_path),
                "chunks_processed": len(chunks),
                "file_name": file_name,
                "file_type": file_type
            }
            
            logger.info(f"Document processing completed successfully for user {user_id}, file: {file_name}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing document {file_name} for user {user_id}: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": f"Error processing document: {str(e)}",
                "user_id": str(user_id),
                "db_path": None,
                "chunks_processed": 0,
                "file_name": file_name,
                "file_type": file_type
            }
    
        
        