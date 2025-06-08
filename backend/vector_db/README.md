# Vector Database Directory

This directory stores the LanceDB vector embeddings generated from processed documents. These embeddings are used by the RAG (Retrieval-Augmented Generation) system to provide context-aware answers to user questions about their uploaded documents.

## Purpose

- **Storage**: Contains vector embeddings created from document chunks
- **Retrieval**: Enables semantic search across document content
- **Integration**: Used by OpenAI models to answer user questions with relevant document context

## Structure

The vector database files are automatically generated when documents are processed through the RAG pipeline. The embeddings represent semantic meaning of document chunks, allowing for efficient similarity search and retrieval.

## Usage

This directory is managed automatically by the application. Vector embeddings are:
1. Created during document processing
2. Stored in LanceDB format
3. Queried when users ask questions about their documents
4. Used to provide relevant context to OpenAI for generating accurate responses

## Note

Files in this directory are automatically generated and should not be manually modified. The `.gitignore` configuration excludes this directory from version control to prevent large vector files from being committed to the repository.



