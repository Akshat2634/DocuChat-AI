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
import lancedb
import pandas as pd
import numpy as np
from pathlib import Path
from config import RAGIndexingConfig
from src.services import OpenAIEmbeddingModel


async def check_lancedb_indexes():
    """Check LanceDB table structure and indexes"""
    
    try:
        # Get configuration
        config = RAGIndexingConfig()
        db_path = Path(config.LANCEDB_PATH)
        table_name = config.LANCEDB_TABLE_NAME
        
        print(f"🔍 Checking LanceDB at: {db_path}")
        print(f"📊 Table name: {table_name}")
        print("-" * 50)
        
        # Connect to LanceDB
        db = lancedb.connect(str(db_path))
        
        # List all tables
        table_names = db.table_names()
        print(f"📋 Available tables: {table_names}")
        
        if table_name not in table_names:
            print(f"❌ Table '{table_name}' not found!")
            return
        
        # Open the table
        table = db.open_table(table_name)
        
        # Get basic table info
        row_count = table.count_rows()
        schema = table.schema
        
        print(f"\n📈 Table Statistics:")
        print(f"  - Row count: {row_count}")
        print(f"  - Schema: {schema}")
        
        # Check if table has data
        if row_count == 0:
            print("⚠️  Table is empty - no data to analyze")
            return
        
        # Sample some data
        print(f"\n📄 Sample Data (first 3 rows):")
        sample_data = table.to_pandas().head(3)
        
        for idx, row in sample_data.iterrows():
            print(f"\nRow {idx + 1}:")
            print(f"  - ID: {row.get('id', 'N/A')}")
            print(f"  - File: {row.get('file_name', 'N/A')}")
            print(f"  - Type: {row.get('file_type', 'N/A')}")
            print(f"  - Chunk: {row.get('chunk_index', 'N/A')}")
            print(f"  - Text preview: {str(row.get('text', 'N/A'))[:100]}...")
            
            # Check embedding
            embedding = row.get('embedding')
            if embedding is not None:
                if isinstance(embedding, list):
                    print(f"  - Embedding: List with {len(embedding)} dimensions")
                elif isinstance(embedding, np.ndarray):
                    print(f"  - Embedding: Array with shape {embedding.shape}")
                else:
                    print(f"  - Embedding: {type(embedding)}")
            else:
                print(f"  - Embedding: None")
        
        # Check for indexes
        print(f"\n🔍 Index Information:")
        try:
            # Try to get index information (this might vary by LanceDB version)
            if hasattr(table, 'list_indices'):
                indices = table.list_indices()
                print(f"  - Available indices: {indices}")
            else:
                print("  - Index listing not available in this LanceDB version")
        except Exception as e:
            print(f"  - Could not retrieve index info: {e}")
        
        # Test vector search functionality
        print(f"\n🔍 Testing Vector Search:")
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
            print(f"  - Vector search test failed: {e}")
        
        # Check data consistency
        print(f"\n✅ Data Consistency Checks:")
        
        # Check for null embeddings
        df = table.to_pandas()
        null_embeddings = df['embedding'].isnull().sum()
        print(f"  - Null embeddings: {null_embeddings}")
        
        # Check embedding dimensions consistency
        if 'embedding' in df.columns and len(df) > 0:
            first_embedding = df['embedding'].iloc[0]
            if isinstance(first_embedding, list):
                embedding_dim = len(first_embedding)
                print(f"  - Embedding dimension: {embedding_dim}")
                
                # Check if all embeddings have same dimension
                inconsistent_dims = 0
                for idx, emb in enumerate(df['embedding']):
                    if isinstance(emb, list) and len(emb) != embedding_dim:
                        inconsistent_dims += 1
                
                print(f"  - Inconsistent embedding dimensions: {inconsistent_dims}")
        
        # Check file distribution
        if 'file_name' in df.columns:
            file_counts = df['file_name'].value_counts()
            print(f"  - Files indexed: {len(file_counts)}")
            print(f"  - Chunks per file:")
            for file_name, count in file_counts.head(5).items():
                print(f"    * {file_name}: {count} chunks")
        
        print(f"\n🎉 Index check completed successfully!")
        
    except Exception as e:
        print(f"❌ Error checking indexes: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")


if __name__ == "__main__":
    asyncio.run(check_lancedb_indexes()) 