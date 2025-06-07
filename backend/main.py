import asyncio
import os
from pathlib import Path
from fastapi import UploadFile
from src import TestRAGPipeline
from config import RAGIndexingConfig


async def process_documents_from_folder():
    """Process all documents from the data folder"""
    rag_pipeline = TestRAGPipeline()
    
    # Initialize the embedding model
    await rag_pipeline.embedding_model.initialize()
    
    # Get the data directory path
    config = RAGIndexingConfig()
    data_dir = config.data_dir
    
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
            class MockUploadFile:
                def __init__(self, filename: str, content: bytes):
                    self.filename = filename
                    self._content = content
                    self._position = 0
                
                async def read(self) -> bytes:
                    return self._content
                
                async def seek(self, position: int) -> None:
                    self._position = position
            
            mock_file = MockUploadFile(doc_path.name, file_content)
            
            # Extract text from the document
            extracted_text, file_type = await rag_pipeline.document_processor.extract_text_from_upload(mock_file)
            print(f"Extracted {len(extracted_text)} characters from {doc_path.name}")
            
            # Chunk the text
            chunks = await rag_pipeline.chunker.chunk_text(extracted_text)
            print(f"Created {len(chunks)} chunks")
            
            # Generate embeddings
            embeddings = await rag_pipeline.embedding_model.generate_embeddings(chunks)
            print(f"Generated embeddings with shape: {embeddings.shape}")
            
            print(f"✅ Successfully processed: {doc_path.name}")
            
        except Exception as e:
            print(f"❌ Error processing {doc_path.name}: {str(e)}")


if __name__ == "__main__":
    asyncio.run(process_documents_from_folder())