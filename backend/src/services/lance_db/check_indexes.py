#!/usr/bin/env python3
"""
Check LanceDB Indexes and Table Structure

This script inspects the LanceDB vector database to verify:
1. Table schema and structure
2. Index configuration
3. Data integrity
4. Search functionality
"""

import asyncio
import logging
import lancedb
import pandas as pd
import numpy as np
from pathlib import Path
from config import RAGIndexingConfig
from src.services import OpenAIEmbeddingModel
from config.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

async def check_lancedb_indexes():
    """Check LanceDB table structure and indexes"""
    
    try:
        # Get configuration
        config = RAGIndexingConfig()
        db_path = Path(config.LANCEDB_PATH)
        table_name = config.LANCEDB_TABLE_NAME
        
        logger.info(f"🔍 Checking LanceDB at: {db_path}")
        logger.info(f"📊 Table name: {table_name}")
        logger.info("-" * 50)
        
        # Connect to LanceDB
        db = lancedb.connect(str(db_path))
        
        # List all tables
        table_names = db.table_names()
        logger.info(f"📋 Available tables: {table_names}")
        
        if table_name not in table_names:
            logger.error(f"❌ Table '{table_name}' not found!")
            return
        
        # Open the table
        table = db.open_table(table_name)
        
        # Get basic table info
        row_count = table.count_rows()
        schema = table.schema
        
        logger.info(f"\n📈 Table Statistics:")
        logger.info(f"  - Row count: {row_count}")
        logger.info(f"  - Schema: {schema}")
        
        # Check if table has data
        if row_count == 0:
            logger.warning("⚠️  Table is empty - no data to analyze")
            return
        
        # Sample some data
        logger.info(f"\n📄 Sample Data (first 3 rows):")
        sample_data = table.to_pandas().head(3)
        
        for idx, row in sample_data.iterrows():
            logger.info(f"\nRow {idx + 1}:")
            logger.info(f"  - ID: {row.get('id', 'N/A')}")
            logger.info(f"  - File: {row.get('file_name', 'N/A')}")
            logger.info(f"  - Type: {row.get('file_type', 'N/A')}")
            logger.info(f"  - Chunk: {row.get('chunk_index', 'N/A')}")
            logger.info(f"  - Text preview: {str(row.get('text', 'N/A'))[:100]}...")
            
            # Check embedding
            embedding = row.get('embedding')
            if embedding is not None:
                if isinstance(embedding, list):
                    logger.info(f"  - Embedding: List with {len(embedding)} dimensions")
                elif isinstance(embedding, np.ndarray):
                    logger.info(f"  - Embedding: Array with shape {embedding.shape}")
                else:
                    logger.info(f"  - Embedding: {type(embedding)}")
            else:
                logger.info(f"  - Embedding: None")
        
        # Check for indexes
        logger.info(f"\n🔍 Index Information:")
        try:
            # Try to get index information (this might vary by LanceDB version)
            if hasattr(table, 'list_indices'):
                indices = table.list_indices()
                logger.info(f"  - Available indices: {indices}")
            else:
                logger.info("  - Index listing not available in this LanceDB version")
        except Exception as e:
            logger.error(f"  - Could not retrieve index info: {e}")
        
        # Test vector search functionality
        logger.info(f"\n🔍 Testing Vector Search:")
        try:
            # Initialize embedding model to create a test query
            embedding_model = OpenAIEmbeddingModel()
            await embedding_model.initialize()
            
            # Create a test query embedding
            test_query = "What is this document about?"
            query_embedding = await embedding_model.generate_embeddings([test_query])
            
            # Perform search with explicit vector column name
            search_results = (
                table.search(query_embedding[0].tolist(), vector_column_name="embedding")
                .limit(3)
                .to_pandas()
            )
            
            print(f"  - Search successful! Found {len(search_results)} results")
            
            if len(search_results) > 0:
                print(f"  - Top result distance: {search_results.iloc[0].get('_distance', 'N/A')}")
                print(f"  - Top result file: {search_results.iloc[0].get('file_name', 'N/A')}")
            
        except Exception as e:
            logger.error(f"  - Vector search test failed: {e}")
        
        # Check for null embeddings
        df = table.to_pandas()
        null_embeddings = df['embedding'].isnull().sum()
        logger.info(f"  - Null embeddings: {null_embeddings}")
        
        # Check embedding dimensions consistency
        if 'embedding' in df.columns and len(df) > 0:
            first_embedding = df['embedding'].iloc[0]
            if isinstance(first_embedding, list):
                embedding_dim = len(first_embedding)
                logger.info(f"  - Embedding dimension: {embedding_dim}")
                
                # Check if all embeddings have same dimension
                inconsistent_dims = 0
                for idx, emb in enumerate(df['embedding']):
                    if isinstance(emb, list) and len(emb) != embedding_dim:
                        inconsistent_dims += 1
                
                logger.info(f"  - Inconsistent embedding dimensions: {inconsistent_dims}")
        
        # Check file distribution
        if 'file_name' in df.columns:
            file_counts = df['file_name'].value_counts()
            logger.info(f"  - Files indexed: {len(file_counts)}")
            logger.info(f"  - Chunks per file:")
            for file_name, count in file_counts.head(5).items():
                logger.info(f"    * {file_name}: {count} chunks")
        
        logger.info(f"\n🎉 Index check completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error checking indexes: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")


if __name__ == "__main__":
    asyncio.run(check_lancedb_indexes()) 