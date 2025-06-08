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

---

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 18+ (for frontend development)
- OpenAI API key
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/akshat2634/docuchat-ai.git
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