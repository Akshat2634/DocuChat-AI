import asyncio
import logging
from config import RAGIndexingConfig
from src import TestRAGPipeline
from config.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

async def process_documents_from_folder():
    """Process all documents from the data folder"""
    rag_pipeline = TestRAGPipeline()
    
    # Get the data directory path
    config = RAGIndexingConfig()
    data_dir = config.data_dir
    logger.info(f"Processing documents from folder: {data_dir}")
    # Use the method from TestRAGPipeline
    await rag_pipeline.process_documents_from_folder(data_dir)


if __name__ == "__main__":
    asyncio.run(process_documents_from_folder())