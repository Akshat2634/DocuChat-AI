import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
import lancedb
from lancedb.table import Table
from lancedb.db import DBConnection
import pyarrow as pa
from config import RAGIndexingConfig
from config.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

class LanceDBVectorStore:
    """
    LanceDB Vector Store for managing document embeddings.
    
    Provides methods to store, retrieve, and search document embeddings
    with associated metadata.
    """
    
    def __init__(self):
        """
        Initialize LanceDB Vector Store.
        
        """
        config = RAGIndexingConfig()
        self.db_path = Path(config.LANCEDB_PATH)
        self.table_name = config.LANCEDB_TABLE_NAME
        self.db: Optional[DBConnection] = None
        self.table: Optional[Table] = None
        self.dimension = config.OPENAI_EMBEDDING_DIMENSION

        
    async def setup_lance_db(self) -> DBConnection:
        """
        Set up LanceDB connection and create database directory if needed.
        
        Returns:
            LanceDB connection object
        """
        try:
            # Create database directory if it doesn't exist
            self.db_path.mkdir(parents=True, exist_ok=True)
            
            # Connect to LanceDB
            self.db = lancedb.connect(str(self.db_path))
            logger.info(f"Connected to LanceDB at: {self.db_path}")
            
            return self.db
            
        except Exception as e:
            logger.error(f"Failed to setup LanceDB: {e}")
            raise
    
    def create_table_schema(self) -> pa.Schema:
        """
        Create PyArrow schema for the embeddings table.
        
        Returns:
            PyArrow schema for the table
        """
        return pa.schema([
            pa.field("id", pa.string()),
            pa.field("text", pa.string()),
            pa.field("embedding", pa.list_(pa.float32(), self.dimension)),  # Fixed-size list with 1536 dimensions
            pa.field("metadata", pa.string()),  # JSON string for flexibility
            pa.field("file_name", pa.string()),
            pa.field("file_type", pa.string()),
            pa.field("chunk_index", pa.int32()),
            pa.field("created_at", pa.timestamp('us'))
        ])
    
    async def create_or_get_table(self) -> Table:
        """
        Create or get existing table for storing embeddings.
        Always deletes existing table completely and creates a new one.
        
        Returns:
            LanceDB table object
        """
        if not hasattr(self, 'db') or not self.db:
            await self.setup_lance_db()
        
        try:
            # Always delete existing table if it exists
            if self.table_name in self.db.table_names():
                logger.info(f"Deleting existing table: {self.table_name}")
                self.db.drop_table(self.table_name)
                logger.info(f"Deleted existing table: {self.table_name}")
            
            # Create new table with proper schema
            import json
            from datetime import datetime
            import uuid
            
            # Define the schema first
            schema = pa.schema([
                pa.field("id", pa.string()),
                pa.field("text", pa.string()),
                pa.field("embedding", pa.list_(pa.float32(), self.dimension)),  # Fixed-size list
                pa.field("metadata", pa.string()),
                pa.field("file_name", pa.string()),
                pa.field("file_type", pa.string()),
                pa.field("chunk_index", pa.int32()),
                pa.field("created_at", pa.timestamp('us'))
            ])
            
            # Create sample data with proper vector format
            sample_data = [{
                "id": str(uuid.uuid4()),
                "text": "sample text",
                "embedding": [0.1] * self.dimension,  # List of 1536 float values
                "metadata": json.dumps({"sample": True}),
                "file_name": "sample.txt",
                "file_type": "txt",
                "chunk_index": 0,
                "created_at": datetime.now()
            }]
            
            df = pd.DataFrame(sample_data)
            self.table = self.db.create_table(
                self.table_name,
                data=df,
                schema=schema,
                mode="create"
            )
            
            # Remove the sample data
            self.table.delete("true")
            
            logger.info(f"Created new table: {self.table_name}")
            
            return self.table
            
        except Exception as e:
            logger.error(f"Failed to create/get table: {e}")
            raise
    
    async def add_embeddings(
        self,
        texts: List[str],
        embeddings: np.ndarray,
        metadata: List[Dict[str, Any]],
        file_name: str,
        file_type: str
    ) -> None:
        """
        Add embeddings to the vector store.
        
        Args:
            texts: List of text chunks
            embeddings: Numpy array of embeddings (2D array: [n_chunks, embedding_dim])
            metadata: List of metadata dictionaries for each chunk
            file_name: Name of the source file
            file_type: Type of the source file
        """
        # Automatically setup LanceDB and create/get table if not already done
        if not hasattr(self, 'table') or not self.table:
            await self.setup_lance_db()
            await self.create_or_get_table()
        
        if len(texts) != len(embeddings) or len(texts) != len(metadata):
            raise ValueError("Texts, embeddings, and metadata must have the same length")
        
        try:
            import json
            from datetime import datetime
            import uuid
            
            # Ensure embeddings are 2D numpy array with correct shape
            if embeddings.ndim == 1:
                embeddings = embeddings.reshape(1, -1)
            
            # Validate embedding dimensions
            expected_dim = self.dimension  # OpenAI embedding dimension
            if embeddings.shape[1] != expected_dim:
                logger.warning(f"Embedding dimension mismatch: got {embeddings.shape[1]}, expected {expected_dim}")
            
            # Prepare data for insertion
            data_to_insert = []
            
            for i, (text, embedding, meta) in enumerate(zip(texts, embeddings, metadata)):
                # Ensure embedding is a list of floats (not numpy array)
                embedding_list = embedding.tolist() if isinstance(embedding, np.ndarray) else list(embedding)
                
                # Ensure we have exactly dimension dimensions
                if len(embedding_list) != expected_dim:
                    # Pad or truncate to expected dimension
                    if len(embedding_list) < expected_dim:
                        embedding_list.extend([0.0] * (expected_dim - len(embedding_list)))
                    else:
                        embedding_list = embedding_list[:expected_dim]
                
                record = {
                    "id": str(uuid.uuid4()),
                    "text": text,
                    "embedding": embedding_list,  # List of exactly dimension floats
                    "metadata": json.dumps(meta),
                    "file_name": file_name,
                    "file_type": file_type,
                    "chunk_index": i,
                    "created_at": datetime.now()
                }
                data_to_insert.append(record)
            
            # Convert to DataFrame and add to table
            df = pd.DataFrame(data_to_insert)
            self.table.add(data=df, mode="append")
            
            logger.info(f"Added {len(texts)} embeddings to table {self.table_name}")
            
        except Exception as e:
            logger.error(f"Failed to add embeddings: {e}")
            raise
    
    async def search_similar(
        self,
        query_embedding: np.ndarray,
        limit: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Search for similar embeddings.
        
        Args:
            query_embedding: Query embedding vector (1D numpy array)
            limit: Maximum number of results to return
            similarity_threshold: Minimum similarity threshold
            
        Returns:
            List of similar documents with metadata
        """
        # Automatically setup LanceDB and create/get table if not already done
        if not hasattr(self, 'table') or not self.table:
            await self.setup_lance_db()
            await self.create_or_get_table()
        
        try:
            # Ensure query embedding is 1D and convert to list
            if query_embedding.ndim > 1:
                query_embedding = query_embedding.flatten()
            
            # Ensure we have exactly 1536 dimensions
            expected_dim = self.dimension
            if len(query_embedding) != expected_dim:
                if len(query_embedding) < expected_dim:
                    # Pad with zeros
                    padded = np.zeros(expected_dim)
                    padded[:len(query_embedding)] = query_embedding
                    query_embedding = padded
                else:
                    # Truncate
                    query_embedding = query_embedding[:expected_dim]
            
            query_vector = query_embedding.tolist()
            
            # Perform vector search
            results = (
                self.table.search(query_vector)
                .limit(limit)
                .to_pandas()
            )
            
            # Filter by similarity threshold if needed
            if similarity_threshold > 0:
                results = results[results['_distance'] <= (1 - similarity_threshold)]
            
            # Convert results to list of dictionaries
            search_results = []
            for _, row in results.iterrows():
                import json
                
                result = {
                    "id": row["id"],
                    "text": row["text"],
                    "metadata": json.loads(row["metadata"]) if row["metadata"] else {},
                    "file_name": row["file_name"],
                    "file_type": row["file_type"],
                    "chunk_index": row["chunk_index"],
                    "similarity_score": 1 - row["_distance"],
                    "created_at": row["created_at"]
                }
                search_results.append(result)
            
            logger.info(f"Found {len(search_results)} similar documents")
            return search_results
            
        except Exception as e:
            logger.error(f"Failed to search similar embeddings: {e}")
            raise
    
    async def get_table_info(self) -> Dict[str, Any]:
        """
        Get information about the table.
        
        Returns:
            Dictionary with table information
        """
        # Automatically setup LanceDB and create/get table if not already done
        if not hasattr(self, 'table') or not self.table:
            await self.setup_lance_db()
            await self.create_or_get_table()
        
        try:
            count = self.table.count_rows()
            schema = self.table.schema
            
            return {
                "table_name": self.table_name,
                "db_path": str(self.db_path),
                "row_count": count,
                "schema": str(schema)
            }
            
        except Exception as e:
            logger.error(f"Failed to get table info: {e}")
            return {"error": str(e)}
    
    async def delete_by_file(self, file_name: str) -> int:
        """
        Delete all embeddings for a specific file.
        
        Args:
            file_name: Name of the file to delete embeddings for
            
        Returns:
            Number of deleted records
        """
        # Automatically setup LanceDB and create/get table if not already done
        if not hasattr(self, 'table') or not self.table:
            await self.setup_lance_db()
            await self.create_or_get_table()
        
        try:
            # Get current count
            initial_count = self.table.count_rows()
            
            # Delete records for the file
            self.table.delete(f"file_name = '{file_name}'")
            
            # Get new count
            final_count = self.table.count_rows()
            deleted_count = initial_count - final_count
            
            logger.info(f"Deleted {deleted_count} embeddings for file: {file_name}")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Failed to delete embeddings for file {file_name}: {e}")
            raise

    async def process_multiple_documents(
        self,
        documents: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """
        Process multiple documents in batch.
        
        Args:
            documents: List of document dictionaries with structure:
                {
                    'file_name': str,
                    'file_type': str,
                    'texts': List[str],
                    'embeddings': np.ndarray,
                    'metadata': List[Dict[str, Any]]
                }
                
        Returns:
            Dictionary with file_name as key and number of chunks stored as value
        """
        results = {}
        
        for doc in documents:
            file_name = doc['file_name']
            
            # First, remove any existing embeddings for this file (prevents duplicates)
            await self.delete_by_file(file_name)
            
            # Add new embeddings
            await self.add_embeddings(
                texts=doc['texts'],
                embeddings=doc['embeddings'],
                metadata=doc['metadata'],
                file_name=file_name,
                file_type=doc['file_type']
            )
            
            results[file_name] = len(doc['texts'])
            logger.info(f"Processed {file_name}: {len(doc['texts'])} chunks")
        
        return results

    async def get_files_summary(self) -> Dict[str, Any]:
        """
        Get summary of all files stored in the vector database.
        
        Returns:
            Dictionary with file statistics
        """
        if not hasattr(self, 'table') or not self.table:
            await self.setup_lance_db()
            await self.create_or_get_table()
        
        try:
            # Get all data
            df = self.table.to_pandas()
            
            if df.empty:
                return {"total_files": 0, "total_chunks": 0, "files": []}
            
            # Group by file_name
            file_stats = df.groupby('file_name').agg({
                'chunk_index': 'count',
                'file_type': 'first',
                'created_at': 'first'
            }).reset_index()
            
            file_stats.columns = ['file_name', 'chunk_count', 'file_type', 'created_at']
            
            files_info = []
            for _, row in file_stats.iterrows():
                files_info.append({
                    "file_name": row['file_name'],
                    "file_type": row['file_type'],
                    "chunk_count": int(row['chunk_count']),
                    "created_at": row['created_at']
                })
            
            return {
                "total_files": len(files_info),
                "total_chunks": int(df.shape[0]),
                "files": files_info
            }
            
        except Exception as e:
            logger.error(f"Failed to get files summary: {e}")
            return {"error": str(e)}
