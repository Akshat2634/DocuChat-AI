from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config import RAGIndexingConfig


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
            return []
        
        return self.text_splitter.split_text(text)
        
        