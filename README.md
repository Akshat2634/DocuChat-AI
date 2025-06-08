# DocuChat AI: AI-Powered Interactive Document Chat Platform

<div align="center">

![DocuChat AI Logo](https://img.shields.io/badge/DocuChat%20AI-Document%20Intelligence-blue?style=for-the-badge&logo=openai&logoColor=white)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-00a86b?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vector%20Database-orange?style=flat)](https://lancedb.github.io/lancedb/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT%204-412991?style=flat&logo=openai)](https://openai.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776ab?style=flat&logo=python&logoColor=white)](https://python.org/)
[![React](https://img.shields.io/badge/React-Next.js-61dafb?style=flat&logo=react)](https://nextjs.org/)

*Transform your documents into intelligent, conversational knowledge bases*


</div>

---

## 🎯 Overview

**DocuChat AI** is an enterprise-grade, AI-powered document intelligence platform that revolutionizes how organizations interact with their unstructured data. Built with cutting-edge RAG (Retrieval-Augmented Generation) technology, it enables natural language conversations with your documents, eliminating the need for manual searching and reading.

### 🔥 Key Highlights

- **🧠 AI-Powered Conversations**: Chat with your documents using natural language
- **📁 Multi-Format Support**: Process PDFs, DOCX, PPTX, TXT, and more
- **⚡ Lightning Fast**: Vector-based semantic search with sub-second response times
- **🔒 Enterprise Security**: On-premises deployment with data privacy controls
- **🎨 Modern UI**: Intuitive drag-and-drop interface built with React/Next.js
- **📊 Scalable Architecture**: Handle thousands of documents with distributed processing

---

## 🚀 Problem Statement

In today's data-driven world, organizations accumulate massive volumes of unstructured documents—reports, manuals, contracts, research papers, and knowledge bases. Traditional document management systems fall short because they:

- **Rely on keyword matching** instead of semantic understanding
- **Require manual browsing** through hundreds of pages
- **Lack contextual intelligence** for complex queries
- **Don't support conversational interfaces** for natural interaction

**DocuChat AI solves these challenges** by providing an intelligent, conversational layer over your document ecosystem.

---

## ✨ Features

### 🎯 Core Capabilities

| Feature | Description | Status |
|---------|-------------|--------|
| **Document Upload** | Drag-and-drop interface supporting multiple file formats | ✅ |
| **Intelligent Chunking** | Advanced text segmentation with overlap optimization | ✅ |
| **Vector Embeddings** | High-dimensional semantic representations using OpenAI | ✅ |
| **Conversational AI** | Natural language chat interface with context awareness | ✅ |
| **Multi-Document Queries** | Search across multiple documents simultaneously | ✅ |
| **Real-time Processing** | Asynchronous document processing with progress tracking | 🔄 |
| **Web Interface** | Modern React/Next.js frontend with responsive design | 🔄 |

### 🛡️ Enterprise Features

- **🔐 Authentication & Authorization**: Role-based access control
- **📊 Analytics Dashboard**: Usage metrics and performance insights  
- **🔄 Batch Processing**: Handle large document collections efficiently
- **🌐 API-First Design**: RESTful APIs for seamless integrations
- **📱 Mobile Responsive**: Optimized for all devices and screen sizes
- **🔍 Advanced Search**: Semantic search with filtering and sorting

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI/ML         │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (OpenAI)      │
│                 │    │                 │    │                 │
│ • File Upload   │    │ • API Routes    │    │ • GPT-4         │
│ • Chat UI       │    │ • RAG Pipeline  │    │ • Embeddings    │
│ • Document Mgmt │    │ • Auth & RBAC   │    │ • Text Models   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │  Vector Store   │
                       │   (LanceDB)     │
                       │                 │
                       │ • Embeddings    │
                       │ • Metadata      │
                       │ • Fast Search   │
                       └─────────────────┘
```

### 🔧 Technology Stack

#### Backend
- **Framework**: FastAPI (Python 3.8+)
- **Vector Database**: LanceDB with PyArrow backend
- **AI/ML**: OpenAI GPT-4.1, text-embedding-3-small
- **Document Processing**: PyPDF2, python-docx, pdfplumber
- **Async Processing**: asyncio, aiofiles
- **Configuration**: Pydantic Settings with environment variables

#### Frontend (Planned)
- **Framework**: Next.js 14+ with TypeScript
- **UI Components**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand or Redux Toolkit
- **File Upload**: React Dropzone
- **Real-time Chat**: WebSocket or Server-Sent Events

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Monitoring**: Structured logging with configurable levels
- **Configuration**: Environment-based configuration management

---

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 18+ (for frontend development)
- OpenAI API key
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/docuchat-ai.git
cd docuchat-ai
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Application Settings
ENVIRONMENT=development
LOG_LEVEL=INFO
DATA_DIR=./data
VECTOR_DB_PATH=./vector_db

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

#### Start the Backend Server
```bash
# Development mode
python -m uvicorn src.api.api:app --reload --host 0.0.0.0 --port 8000

# Production mode
python -m uvicorn src.api.api:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup (Coming Soon)

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker Setup (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Interactive API Documentation
FastAPI provides interactive API documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Core Endpoints

#### Health Check
```http
GET /health
```

**Response**:
```json
{
  "status": "healthy and running"
}
```

#### Root Information
```http
GET /
```

**Response**:
```json
{
  "message": "Welcome to the DocuChat AI API",
  "version": "0.1.0",
  "description": "API for document processing, embedding generation, and RAG querying",
  "endpoints": [
    {
      "path": "/api/documents/upload",
      "method": "POST",
      "description": "Upload documents for processing"
    }
  ]
}
```

#### Document Upload (Planned)
```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

**Parameters**:
- `files`: Multiple files (PDF, DOCX, TXT, etc.)

**Response**:
```json
{
  "message": "Successfully uploaded 3 documents",
  "document_ids": ["doc_123", "doc_124", "doc_125"],
  "processing_status": "started"
}
```

#### Chat with Documents (Planned)
```http
POST /api/rag/query
Content-Type: application/json
```

**Request Body**:
```json
{
  "question": "What are the key findings in the research report?",
  "document_ids": ["doc_123", "doc_124"],
  "max_results": 5,
  "temperature": 0.7
}
```

**Response**:
```json
{
  "answer": "Based on the research report, the key findings are...",
  "sources": [
    {
      "document_id": "doc_123",
      "chunk_id": "chunk_45",
      "relevance_score": 0.95,
      "page_number": 12
    }
  ],
  "processing_time": 1.2
}
```

---

## 🎮 Usage Examples

### Quick Start

1. **Start the Backend**
   ```bash
   cd backend
   python -m uvicorn src.api.api:app --reload
   ```

2. **Test the API**
   ```bash
   curl http://localhost:8000/health
   ```

3. **View API Documentation**
   - Open `http://localhost:8000/docs` in your browser

### Development Workflow

```python
# Example of using the RAG pipeline directly
import asyncio
from src import TestRAGPipeline

async def test_rag():
    pipeline = TestRAGPipeline()
    
    # Process documents from data folder
    await pipeline.process_documents_from_folder("./data")
    
    # Query the processed documents
    result = await pipeline.query("What are the main topics covered?")
    print(result)

if __name__ == "__main__":
    asyncio.run(test_rag())
```

---

## 🧪 Development

### Project Structure

```
docuchat-ai/
├── backend/
│   ├── src/
│   │   ├── api/                 # FastAPI routes and middleware
│   │   │   └── api.py          # Main FastAPI application
│   │   ├── services/            # Business logic and services
│   │   │   ├── chunking/        # Text chunking strategies
│   │   │   ├── embedding_models/# Embedding implementations
│   │   │   ├── file_services/   # Document processing
│   │   │   └── lance_db/        # Vector database operations
│   │   ├── rag_pipeline.py      # Core RAG implementation
│   │   └── test_rag_pipeline.py # RAG testing utilities
│   ├── config/                  # Configuration management
│   │   ├── configurations.py    # Pydantic settings
│   │   ├── logger.py           # Logging configuration
│   │   └── openai.py           # OpenAI client setup
│   ├── data/                    # Sample documents
│   ├── vector_db/               # LanceDB storage
│   ├── requirements.txt         # Python dependencies
│   └── main.py                 # CLI entry point
├── frontend/                    # Next.js frontend (planned)
├── docker-compose.yml
├── .gitignore
└── README.md
```

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Run specific test modules
python src/test_rag_pipeline.py
```

### Code Quality

```bash
# Format code
black src/
isort src/

# Lint code
flake8 src/
pylint src/

# Type checking
mypy src/
```

---

## 🚀 Deployment

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings and chat | - | Yes |
| `ENVIRONMENT` | Deployment environment | `development` | No |
| `LOG_LEVEL` | Logging level | `INFO` | No |
| `DATA_DIR` | Directory for document storage | `./data` | No |
| `VECTOR_DB_PATH` | Path for LanceDB storage | `./vector_db` | No |
| `HOST` | Server host | `0.0.0.0` | No |
| `PORT` | Server port | `8000` | No |

### Docker Production Deployment

```bash
# Build production image
docker build -t docuchat-ai:latest .

# Run with production configuration
docker run -d \
  --name docuchat-ai \
  -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e OPENAI_API_KEY=your_key_here \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/vector_db:/app/vector_db \
  docuchat-ai:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  docuchat-ai:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data:/app/data
      - ./vector_db:/app/vector_db
    restart: unless-stopped
```

---

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] Document processing pipeline
- [x] RAG implementation with LanceDB
- [x] FastAPI backend structure
- [x] OpenAI integration
- [x] Basic API endpoints
- [x] Configuration management

### Phase 2: API Enhancement (In Progress)
- [ ] Complete REST API implementation
- [ ] Document upload endpoints
- [ ] Query and search endpoints
- [ ] Source attribution system
- [ ] Batch processing capabilities
- [ ] Error handling and validation

### Phase 3: Frontend Development (Q2 2024)
- [ ] React/Next.js frontend
- [ ] Modern UI/UX design
- [ ] Drag-and-drop file upload
- [ ] Real-time chat interface
- [ ] Document management dashboard
- [ ] Responsive mobile design

### Phase 4: Enterprise Features (Q3 2024)
- [ ] User authentication and authorization
- [ ] Multi-tenant architecture
- [ ] Role-based access control
- [ ] Analytics and reporting
- [ ] API rate limiting
- [ ] Advanced security features

### Phase 5: Advanced AI (Q4 2024)
- [ ] Custom model fine-tuning
- [ ] Multi-modal support (images, tables)
- [ ] Advanced query understanding
- [ ] Automated summarization
- [ ] Integration APIs

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Quick Start for Contributors

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes and add tests**
4. **Ensure all tests pass**: `python -m pytest`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 for Python code
- Use type hints for better code clarity
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure backward compatibility

### Areas for Contribution

- 🐛 **Bug Fixes**: Help us squash bugs
- ✨ **New Features**: Implement planned roadmap items
- 📚 **Documentation**: Improve docs and examples
- 🧪 **Testing**: Add test coverage
- 🎨 **UI/UX**: Design and frontend development
- 🔧 **DevOps**: Deployment and infrastructure

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for providing state-of-the-art language models
- **LanceDB** for high-performance vector storage
- **FastAPI** for the modern, fast web framework
- **The Python community** for excellent libraries and tools
- **Contributors** who help make this project better

---

<div align="center">

**Built with ❤️ by Akshat*

If you find this project useful, please ⭐ star it on GitHub!

[🔝 Back to Top](#docuchat-ai-ai-powered-interactive-document-chat-platform)

</div> 