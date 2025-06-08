from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config import RAGIndexingConfig
from config.logger import setup_logging
import logging

setup_logging()
logger = logging.getLogger(__name__)


class Chunker:
    def __init__(self):
        config = RAGIndexingConfig()
        self.chunk_size = config.CHUNK_SIZE
        self.overlap_size = config.OVERLAP_SIZE
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size, 
            chunk_overlap=self.overlap_size
        )
        
    async def chunk_text(self, text: str) -> List[str]:
        """
        Split text into chunks.
        
        Args:
            text: Text to be chunked
            
        Returns:
            List of text chunks
        """
        if not text or not text.strip():
            logger.warning("No text to chunk")
            return []
    
        logger.info(f"Chunking text of length {len(text)}")
        chunks = self.text_splitter.split_text(text)
        logger.info(f"Split text into {len(chunks)} chunks")
        return chunks
        
        