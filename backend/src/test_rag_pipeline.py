"""
Test RAG Pipeline

A test implementation of the RAG pipeline for document processing.
"""

from typing import List, Dict, Any
import numpy as np
from pathlib import Path
from src.services import DocumentProcessor, Chunker, OpenAIEmbeddingModel, LanceDBVectorStore


class MockUploadFile:
    """Mock UploadFile class for processing local files"""
    def __init__(self, filename: str, content: bytes):
        self.filename = filename
        self.content_type = self._get_content_type(filename)
        self.size = len(content)
        self._content = content
        self._position = 0
    
    def _get_content_type(self, filename: str) -> str:
        """Get content type based on file extension"""
        ext = Path(filename).suffix.lower()
        content_types = {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.txt': 'text/plain'
        }
        return content_types.get(ext, 'application/octet-stream')
    
    async def read(self, size: int = -1) -> bytes:
        """Read file content"""
        if size == -1:
            return self._content
        else:
            return self._content[:size]
    
    async def seek(self, position: int) -> None:
        """Seek to position in file"""
        self._position = position
    
    async def close(self) -> None:
        """Close file (no-op for mock)"""
        pass


class TestRAGPipeline:
    """
    Test RAG Pipeline for processing documents and generating embeddings.
    """
    
    def __init__(self):
        self.document_processor = DocumentProcessor()
        self.chunker = Chunker()
        self.embedding_model = OpenAIEmbeddingModel()
        self.lance_db_vector_store = LanceDBVectorStore()
        
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
            file_name = Path(file_path).name
            mock_file = MockUploadFile(file_name, file_content)
            
            # Extract text
            text, file_type = await self.document_processor.extract_text_from_upload(mock_file)
            
            if not text or not text.strip():
                return {
                    "status": "error",
                    "error": "No text could be extracted from the document"
                }
                
            # Chunk text
            chunks = await self.chunker.chunk_text(text)
            
            if not chunks:
                return {
                    "status": "error",
                    "error": "No chunks could be created from the extracted text"
                }
            
            # Generate embeddings
            embeddings = await self.embedding_model.generate_embeddings(chunks)
            
            # Prepare metadata for each chunk
            metadata = []
            for i in range(len(chunks)):
                metadata.append({
                    "source": file_path,
                    "source_file": file_name,
                    "chunk_id": i,
                    "total_chunks": len(chunks),
                    "chunk_length": len(chunks[i]),
                    "file_path": file_path
                })
            
            # Add embeddings to LanceDB
            await self.lance_db_vector_store.add_embeddings(
                texts=chunks,
                embeddings=embeddings,
                metadata=metadata,
                file_name=file_name,
                file_type=file_type
            )
            
            return {
                "status": "success",
                "file_name": file_name,
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
    
    async def process_documents_from_folder(self, data_dir: Path) -> None:
        """Process all documents from the data folder"""
        # Initialize the embedding model
        await self.embedding_model.initialize()
        
        print(f"Looking for documents in: {data_dir}")
        
        # Find all supported files in the data directory
        supported_extensions = ['.pdf', '.docx', '.txt']
        documents_found = []
        
        for ext in supported_extensions:
            pattern = f"*{ext}"
            files = list(data_dir.glob(pattern))
            documents_found.extend(files)
        
        if not documents_found:
            print("No supported documents found in the data folder.")
            return
        
        print(f"Found {len(documents_found)} document(s):")
        for doc_path in documents_found:
            print(f"  - {doc_path.name}")
        
        # Process each document
        for doc_path in documents_found:
            try:
                print(f"\nProcessing: {doc_path.name}")
                
                # Read the file content
                with open(doc_path, 'rb') as file:
                    file_content = file.read()
                
                # Create a mock UploadFile object for the document processor
                mock_file = MockUploadFile(doc_path.name, file_content)
                
                # Extract text from the document
                extracted_text, file_type = await self.document_processor.extract_text_from_upload(mock_file)
                print(f"Extracted {len(extracted_text)} characters from {doc_path.name}")
                
                # Chunk the text
                chunks = await self.chunker.chunk_text(extracted_text)
                print(f"Created {len(chunks)} chunks")
                
                # Generate embeddings
                embeddings = await self.embedding_model.generate_embeddings(chunks)
                print(f"Generated embeddings with shape: {embeddings.shape}")
                
                # Create metadata for each chunk
                metadata = []
                for i, chunk in enumerate(chunks):
                    chunk_metadata = {
                        "chunk_id": i,
                        "source_file": doc_path.name,
                        "chunk_length": len(chunk),
                        "file_path": str(doc_path)
                    }
                    metadata.append(chunk_metadata)
                
                # Store embeddings in vector store
                await self.lance_db_vector_store.add_embeddings(
                    texts=chunks,
                    embeddings=embeddings,
                    metadata=metadata,
                    file_name=doc_path.name,
                    file_type=file_type
                )
                print(f"Stored {len(chunks)} embeddings in vector store")
                
                print(f"✅ Successfully processed: {doc_path.name}")
                
            except Exception as e:
                print(f"❌ Error processing {doc_path.name}: {str(e)}")
