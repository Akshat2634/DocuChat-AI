# from typing import List

# from llama_index_client import Document
# from services import DocumentProcessor, Chunker, OpenAIEmbeddingModel


# class RAGPipeline:
#     def __init__(self):
#         self.document_processor = DocumentProcessor()
#         self.chunker = Chunker()
#         self.embedding_model = OpenAIEmbeddingModel()
        
#     async def process_document(self, document: Document) -> List[str]:
#         text = await self.document_processor.process_document(document)
#         chunks = await self.chunker.chunk_text(text)
#         embeddings = await self.embedding_model.generate_embeddings(chunks)
#         return "Document processed successfully"
    
        
        