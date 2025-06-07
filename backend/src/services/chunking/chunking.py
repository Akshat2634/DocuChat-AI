from typing import List
from langchain_core.text_splitter import RecursiveCharacterTextSplitter
from config import RAGIndexingConfig


class Chunker:
    def __init__(self):
        self.chunk_size = RAGIndexingConfig.CHUNK_SIZE
        self.overlap_size = RAGIndexingConfig.OVERLAP_SIZE
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=self.chunk_size, chunk_overlap=self.overlap_size)
        
    async def chunk_text(self, text: str) -> List[str]:
        return self.text_splitter.split_text(text)
        
        