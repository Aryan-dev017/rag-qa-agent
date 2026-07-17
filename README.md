# RAGent.ai

An AI-powered Retrieval-Augmented Generation (RAG) platform that allows users to upload documents, create searchable knowledge bases, and chat with their data using Google's Gemini models.

RAGent.ai combines document ingestion, semantic search, vector embeddings, and grounded AI responses into a clean, production-ready web application.

---

## Features

- AI-powered document question answering
- Retrieval-Augmented Generation (RAG)
- Drag & Drop document upload
- Automatic document parsing
- Intelligent text chunking
- Gemini Embedding API integration
- Hybrid vector search
- Context-aware answer generation
- Multiple AI Personas
- Knowledge Workspace management
- Chunk inspection
- Developer metrics dashboard
- Source citations
- Production deployment on Railway

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

### Backend

- Node.js
- Express
- TypeScript

### AI

- Gemini 3.5 Flash
- Gemini Embedding 2 Preview

### Deployment

- Railway
- Vercel

---

## Architecture

```text
                    User
                      │
                      ▼
              React Frontend
                      │
                      ▼
              Express API Server
                      │
      ┌───────────────┴────────────────┐
      │                                │
      ▼                                ▼
 Upload Pipeline                  Chat Pipeline
      │                                │
      ▼                                ▼
 Document Parser                  Query Processing
      │                                │
      ▼                                ▼
 Intelligent Chunking          Query Embedding
      │                                │
      ▼                                ▼
 Gemini Embeddings          Vector Similarity Search
      │                                │
      ▼                                ▼
  Vector Store               Retrieved Context
      │                                │
      └───────────────┬────────────────┘
                      ▼
              Gemini 3.5 Flash
                      │
                      ▼
             Grounded AI Response
```

---

# Project Structure

```text
.
├── server
│   ├── routes
│   ├── services
│   ├── pipeline
│   ├── embeddings
│   ├── retriever
│   ├── vectorstore
│   ├── parser
│   └── server.ts
│
├── src
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── lib
│   └── App.tsx
│
├── dist
├── public
└── package.json
```

---

# RAG Pipeline

## 1. Upload

Documents are uploaded into a workspace.

Supported formats include

- TXT
- Markdown
- CSV

---

## 2. Parsing

The document is converted into clean text while preserving semantic structure.

---

## 3. Chunking

Large documents are divided into overlapping chunks.

Example configuration

```text
Chunk Size : 600 characters
Overlap    : 120 characters
```

---

## 4. Embedding Generation

Each chunk is converted into a semantic vector using

- Gemini Embedding 2 Preview

---

## 5. Vector Storage

Embeddings are stored inside the vector database for semantic retrieval.

---

## 6. Retrieval

When a user asks a question

- the query is embedded
- similarity search retrieves relevant chunks
- context is ranked

---

## 7. Generation

Retrieved context is passed to

Gemini 3.5 Flash

which generates grounded responses with citations.

---

# Personas

RAGent supports multiple response modes.

- Balanced Assistant
- Strict Fact QA
- Creative Teacher
- Technical Analyst

Each persona modifies prompting behavior without changing the retrieval pipeline.

---

# Workspace System

Each workspace maintains its own

- uploaded documents
- vectors
- context
- chat history

allowing multiple independent knowledge bases.

---

# API

## Health

```http
GET /api/health
```

Response

```json
{
  "success": true,
  "status": "ok",
  "message": "RAG Q&A Agent Server is healthy"
}
```

---

## Upload Document

```http
POST /api/upload
```

Uploads and indexes a document.

---

## Query

```http
POST /api/query
```

Returns a grounded answer using semantic retrieval.

---

# Local Development

Clone the repository

```bash
git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Create

```text
.env
```

Example

```env
GEMINI_API_KEY=your_api_key
PORT=8080
```

Run development server

```bash
npm run dev
```

---

# Production Build

Build

```bash
npm run build
```

Start

```bash
npm start
```

---

# Deployment

Backend

- Railway

Frontend

- Vercel

The frontend communicates with the Railway backend through environment variables.

---

# Performance

Current production features

- Automatic document ingestion
- Fast semantic retrieval
- Grounded responses
- Context citations
- Low-latency inference
- Hybrid vector retrieval

---

# Future Roadmap

- PDF support
- DOCX support
- Persistent vector database
- User authentication
- Workspace sharing
- Team collaboration
- Streaming AI responses
- Conversation history
- Usage analytics
- API keys
- Rate limiting
- Subscription plans
- Reranking
- Multi-model support
- Image document parsing
- OCR support
- Multi-language retrieval

---

# Lessons Learned

During deployment, several production challenges were addressed:

- Production build verification
- Railway deployment configuration
- Health endpoint validation
- DNS propagation handling
- Port conflict resolution
- Frontend/backend routing separation
- API base URL configuration
- End-to-end production testing

The project now runs successfully in production with a complete Retrieval-Augmented Generation workflow.

---

# Acknowledgements

Built using

- React
- Vite
- Express
- TypeScript
- Google Gemini API
- Railway
- Vercel

---

> Encountered and resolved 10 interconnected deployment 
> issues including DNS propagation, Railway networking, 
> and Vercel API routing. Full incident report in 
> INCIDENT_REPORT.md

## License

This project is licensed under the MIT License.
