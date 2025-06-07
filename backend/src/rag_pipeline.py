from services import DocumentProcessor, Chunker, OpenAIEmbeddingModel


class RAGPipeline:
    def __init__(self):
        self.document_processor = DocumentProcessor()
        self.chunker = Chunker()
        self.embedding_model = OpenAIEmbeddingModel()
        
        
        