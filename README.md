# DocuChat AI: AI-Powered Interactive Document Chat Platform

<div align="center">

![DocuChat AI Logo](https://img.shields.io/badge/DocuChat%20AI-Document%20Intelligence-blue?style=for-the-badge&logo=openai&logoColor=white)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-00a86b?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vector%20Database-orange?style=flat)](https://lancedb.github.io/lancedb/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT%204-412991?style=flat&logo=openai)](https://openai.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776ab?style=flat&logo=python&logoColor=white)](https://python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2+-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![Redis](https://img.shields.io/badge/Redis-Conversation%20Store-DC382D?style=flat&logo=redis)](https://redis.io/)


*Transform your documents into intelligent, conversational knowledge bases*


</div>

---

## 🎯 Overview

**DocuChat AI** is an enterprise-grade, AI-powered document intelligence platform that revolutionizes how organizations interact with their unstructured data. Built with cutting-edge RAG (Retrieval-Augmented Generation) technology, it enables natural language conversations with your documents, eliminating the need for manual searching and reading.

### 🔥 Key Features

- **🧠 Advanced AI Chat**: GPT-4.1 powered conversations with function calling
- **💾 Persistent Conversations**: Redis-backed conversation history with TTL management
- **📊 Vector Search**: LanceDB for lightning-fast semantic document retrieval
- **🎨 Modern UI**: Beautiful Next.js frontend with Tailwind CSS and Framer Motion
- **📁 Multi-Format Support**: PDF, DOCX, PPTX, TXT document processing
- **🔧 Production Ready**: Comprehensive error handling, logging, and monitoring
- **⚡ Real-time Processing**: Async document processing with progress tracking
- **🛡️ Enterprise Features**: User isolation, cleanup tasks, and health monitoring

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend          │    │   Backend           │    │   AI & Storage      │
│   (Next.js 15)      │◄──►│   (FastAPI)         │◄──►│   (OpenAI + Redis)  │
│                     │    │                     │    │                     │
│ • React 19          │    │ • RAG Pipeline      │    │ • GPT-4.1 Chat     │
│ • Tailwind CSS      │    │ • Query Engine      │    │ • Text Embeddings   │
│ • Framer Motion     │    │ • Tool Calling      │    │ • Conversation Store│
│ • File Upload       │    │ • User Management   │    │ • Function Calling  │
│ • Chat Interface    │    │ • Health Monitoring │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                      │
                             ┌─────────────────────┐
                             │  Vector Database    │
                             │   (LanceDB)         │
                             │                     │
                             │ • Document Chunks   │
                             │ • Embeddings        │
                             │ • Metadata          │
                             │ • User Isolation    │
                             └─────────────────────┘
```

### 🔧 Technology Stack

#### Backend
- **Framework**: FastAPI with async/await support
- **AI Engine**: OpenAI GPT-4.1-mini with function calling
- **Vector Database**: LanceDB with PyArrow backend
- **Conversation Storage**: Redis with async support
- **Document Processing**: PyPDF2, python-docx, pdfplumber, python-pptx
- **Text Processing**: LangChain RecursiveCharacterTextSplitter
- **Configuration**: Pydantic Settings with environment variables
- **Logging**: Structured logging with colorama

#### Frontend
- **Framework**: Next.js 15 with TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: React 19 hooks
- **File Upload**: React Dropzone with progress tracking
- **HTTP Client**: Fetch API with error handling

#### Infrastructure
- **Vector Store**: Per-user LanceDB instances
- **Conversation Cache**: Redis with TTL and message limits
- **Background Tasks**: Periodic vector database cleanup
- **Health Monitoring**: API health checks and status endpoints

---

## ✨ Features

### 🎯 Core Capabilities

| Feature | Status | Description |
|---------|---------|-------------|
| **Document Upload** | ✅ | Multi-format support with drag-and-drop interface |
| **Intelligent Chunking** | ✅ | Optimized text segmentation with overlap |
| **Vector Embeddings** | ✅ | OpenAI text-embedding-3-small integration |
| **Conversational AI** | ✅ | GPT-4.1 with function calling and tool use |
| **Persistent Chat** | ✅ | Redis-backed conversation history |
| **Real-time UI** | ✅ | Live upload progress and chat animations |
| **User Isolation** | ✅ | Per-user vector databases and conversations |
| **Background Cleanup** | ✅ | Automated vector database maintenance |

### 🛡️ Enterprise Features

- **🔐 Session Management**: UUID-based user sessions
- **📊 Health Monitoring**: Comprehensive API health checks
- **🔄 Background Tasks**: Scheduled cleanup and maintenance
- **📱 Responsive Design**: Mobile-optimized interface
- **🚨 Error Handling**: Graceful error handling with user feedback
- **📈 Performance Optimized**: Async processing and concurrent operations
- **🔍 Advanced Search**: Semantic search with similarity thresholds
- **⚙️ Configurable**: Environment-based configuration management

---

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8+ with pip
- Node.js 18+ with pnpm/npm
- Redis server (local or remote)
- OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/akshat2634/docuchat-ai.git
cd docuchat-ai
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

#### Environment Configuration (`.env`)
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Redis Configuration
REDIS_HOST= "redis-cloud-host-url" 
REDIS_PORT="redis-cloud-port"
REDIS_DB=0
CONVERSATION_TTL=7200
MAX_CONVERSATION_LENGTH=50

# Vector Database Configuration
LANCEDB_PATH=vector_db
LANCEDB_TABLE_NAME=documents
SIMILARITY_THRESHOLD=0.6

# Cleanup Configuration
VECTOR_DB_CLEANUP_INTERVAL=86400
```

#### Start Backend Server
```bash
# Development mode
python main.py

# Or with uvicorn directly
uvicorn src.api.api:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install
# or: npm install

# Start development server
pnpm dev
# or: npm run dev
```

### 4. Redis Setup

#### Option A: Docker (Recommended)
```bash
docker run -d --name redis-rag -p 6379:6379 redis:latest
```

#### Option B: Local Installation
```bash
# macOS
brew install redis && brew services start redis

# Ubuntu/Debian
sudo apt install redis-server && sudo systemctl start redis-server
```

---

## 🚀 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /` | GET | API information and available endpoints |
| `GET /health` | GET | Health check endpoint |
| `POST /upload-document/{user_id}` | POST | Upload and process documents |
| `POST /chat/{user_id}?query=<message>` | POST | Send chat messages with RAG |
| `GET /api/cleanup/status` | GET | Get cleanup task status |
| `POST /api/cleanup/vector-db` | POST | Manually trigger cleanup |

### Example Usage

#### Upload Document
```bash
curl -X POST "http://localhost:8000/upload-document/user123" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"
```

#### Chat with Documents
```bash
curl -X POST "http://localhost:8000/chat/user123?query=What is the main topic?" \
  -H "Content-Type: application/json"
```

---

## 🧪 Development

### Project Structure

```
RAG-LanceDB/
├── backend/                     # FastAPI backend
│   ├── src/
│   │   ├── api/                 # API routes and middleware
│   │   │   ├── api.py          # Main FastAPI application
│   │   │   └── routers/        # API route handlers
│   │   ├── ai/                  # AI components
│   │   │   ├── query_engine.py # Main chat completion engine
│   │   │   ├── middleware/     # RAG agent and Redis store
│   │   │   ├── prompt.py       # System prompts
│   │   │   ├── tools.py        # Function calling tools
│   │   │   └── tool_call.py    # Tool execution handler
│   │   ├── services/            # Business logic services
│   │   │   ├── chunking/        # Text chunking strategies
│   │   │   ├── embedding_models/ # Embedding implementations
│   │   │   ├── file_services/   # Document processing
│   │   │   └── lance_db/        # Vector database operations
│   │   ├── tasks/               # Background tasks
│   │   │   └── cleanup.py      # Scheduled cleanup tasks
│   │   ├── rag_pipeline.py      # Core RAG implementation
│   │   └── test_rag_pipeline.py # Testing utilities
│   ├── config/                  # Configuration management
│   │   ├── configurations.py    # Pydantic settings
│   │   ├── logger.py           # Logging setup
│   │   └── openai.py           # OpenAI client configuration
│   ├── data/                    # Sample documents
│   ├── vector_db/               # LanceDB storage (per-user)
│   ├── requirements.txt         # Python dependencies
│   └── main.py                 # Server entry point
├── frontend/                    # Next.js frontend
│   ├── app/                     # App router pages
│   │   ├── page.tsx            # Home page with file upload
│   │   ├── chat/               # Chat interface
│   │   └── test/               # API testing page
│   ├── components/              # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── vibrant-file-upload.tsx # File upload with progress
│   │   ├── vibrant-chat-*.tsx  # Chat interface components
│   │   └── animated-*.tsx      # Animation components
│   ├── lib/                     # Utility functions
│   │   ├── api.ts              # API client functions
│   │   └── session.ts          # Session management
│   ├── hooks/                   # Custom React hooks
│   ├── styles/                  # Global styles
│   └── package.json            # Node.js dependencies
├── API_INTEGRATION_GUIDE.md     # Frontend-backend integration guide
└── README.md                    # This file
```

### Testing

#### Backend Testing
```bash
cd backend

# Test RAG pipeline
python test.py

# Test specific components
python -c "from src.test_rag_pipeline import TestRAGPipeline; import asyncio; asyncio.run(TestRAGPipeline().process_documents_from_folder('data'))"
```

#### Frontend Testing
```bash
cd frontend

# Visit test page
http://localhost:3000/test

# Check API integration
npm run lint
npm run build
```

### Redis Conversation Testing

```bash
# Connect to Redis CLI
redis-cli

# Check stored conversations
KEYS conversation:*

# View specific user conversation
LRANGE conversation:user123 0 -1

# Check conversation TTL
TTL conversation:user123
```

---

## 🚀 Deployment

### Production Configuration

#### Backend (Docker)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

#### Frontend (Vercel/Netlify)
```bash
# Build for production
npm run build

# Set environment variables
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

#### Environment Variables
```bash
# Production backend
OPENAI_API_KEY=your_production_key
REDIS_HOST=your_redis_host
VECTOR_DB_CLEANUP_INTERVAL=3600
```

---

## 📊 Monitoring & Observability

### Health Checks
- `GET /health` - Basic health check
- `GET /api/cleanup/status` - Background task status
- Redis connection monitoring
- Vector database health checks

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking with stack traces
- Performance metrics

### Metrics
- Conversation history length
- Document processing times
- Vector search performance
- Redis memory usage

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for frontend development
- Add tests for new features
- Update documentation
- Ensure proper error handling

---


## 🙏 Acknowledgments

- **OpenAI** for GPT-4.1 and embedding models
- **LanceDB** for high-performance vector storage
- **FastAPI** for the modern async web framework
- **Next.js** for the excellent React framework
- **Redis** for reliable conversation storage
- **shadcn/ui** for beautiful UI components

---

<div align="center">

**Built with ❤️ by Akshat*

If you find this project useful, please ⭐ star it on GitHub!

[🔝 Back to Top](#docuchat-ai-ai-powered-interactive-document-chat-platform)

</div> 