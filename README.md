# RAG Q&A Agent – Deployment Incident Report

**Project:** RAG Q&A Agent
**Frontend:** React + Vite
**Backend:** Express + TypeScript
**LLM:** Gemini 3.5 Flash
**Embedding Model:** Gemini Embedding 2 Preview
**Hosting:** Railway (Backend) + Vercel (Frontend)

---

# Executive Summary

The application initially failed after deployment due to several interconnected issues involving deployment architecture, networking, DNS propagation, and frontend-backend communication.

Although the backend had been built correctly, the deployment process made it appear as if the server itself was broken. Through systematic debugging, each layer of the deployment pipeline was verified until the actual issue was isolated.

The final production system is now fully operational with successful document ingestion, vector indexing, retrieval, and grounded answer generation.

---

# Architecture

```
React (Vercel)
        │
        ▼
Railway Backend
        │
        ▼
Upload Pipeline
        │
        ▼
Parser
        │
        ▼
Chunker
        │
        ▼
Gemini Embeddings
        │
        ▼
Vector Store
        │
        ▼
Retriever
        │
        ▼
Gemini 3.5 Flash
        │
        ▼
Grounded Response
```

---

# Problems Encountered

---

## 1. Production Build Verification

### Symptoms

Uncertainty whether the production build contained the backend server.

### Investigation

Verified the build process:

```
npm run build
```

Output:

```
dist/
    assets/
    index.html
    server.cjs
    server.cjs.map
```

### Result

Confirmed that:

* frontend compiled correctly
* backend bundled correctly
* build pipeline was functioning normally

---

## 2. Backend Startup Validation

### Symptoms

No confirmation whether Railway actually launched the server.

### Investigation

Executed:

```
node dist/server.cjs
```

Observed logs:

```
Boot
Upload Pipeline
Chunk Creation
Embedding Generation
Vector Store
Successfully loaded document
```

### Result

Backend booted successfully.

---

## 3. Address Already In Use (EADDRINUSE)

### Error

```
Error:
listen EADDRINUSE
address already in use
0.0.0.0:8080
```

### Cause

A Railway instance was already running.

Launching another server manually attempted to bind to the same port.

### Resolution

Stopped manually starting additional server instances.

Confirmed Railway already owned port 8080.

---

## 4. Railway Health Endpoint Verification

Initially, there was uncertainty whether Express routes were functioning.

Health endpoint tested:

```
/api/health
```

Returned:

```json
{
  "success": true,
  "status": "ok",
  "message": "RAG Q&A Agent Server is healthy"
}
```

### Result

Express routing confirmed operational.

---

## 5. Railway DNS Propagation

Initially:

```
DNS_PROBE_FINISHED_NXDOMAIN
```

or

```
404 Not Found
```

appeared while testing the Railway URL.

### Cause

Public Railway domain had not fully propagated after regeneration.

### Resolution

Deleted and recreated the Railway public domain.

Waited for DNS propagation.

Eventually:

```
https://rag-qa-agent-production.up.railway.app/api/health
```

returned successfully.

---

## 6. False Backend Failure

The backend appeared broken because:

* browser returned 404
* frontend returned API failures

However:

Railway logs showed:

```
Server running
```

and

```
Health route triggered
```

Meaning:

Backend had never actually failed.

The failures originated elsewhere.

---

## 7. Vercel API Routing

The major issue.

Frontend requests looked like:

```
fetch("/api/query")
```

or

```
fetch("/api/documents")
```

When deployed on Vercel,

those requests resolved to

```
https://vercel-domain/api/...
```

instead of Railway.

Vercel therefore returned

```
404
```

because it had no backend.

### Resolution

Frontend API base URL was configured to point to Railway.

Instead of:

```
/api/query
```

the frontend now communicates with:

```
https://rag-qa-agent-production.up.railway.app/api/query
```

---

## 8. Railway Console Limitations

Several debugging inconveniences were encountered.

Examples:

* no copy/paste support
* limited shell commands
* missing utilities like curl
* manual typing required

Alternative methods using Node's built-in fetch were used for verification.

---

## 9. Verification of Upload Pipeline

Confirmed working pipeline:

```
Document Upload
↓

Parser

↓

Chunker

↓

Gemini Embeddings

↓

Vector Storage

↓

Retrieval
```

Upload logs confirmed:

```
Chunks created

Embeddings generated

Stored successfully

Loaded successfully
```

---

## 10. End-to-End Retrieval Verification

Uploaded:

```
wscience.txt
```

System reported:

```
indexed successfully
```

Knowledge context displayed:

```
4 vectors
```

Queries produced grounded responses with citations.

This verified:

* retrieval
* embedding generation
* similarity search
* Gemini generation

---

# Root Cause Analysis

There was **no single bug**.

Instead, multiple independent issues appeared sequentially:

1. DNS propagation
2. Railway networking
3. Health endpoint verification
4. Port conflicts during manual testing
5. Vercel API routing
6. Frontend using incorrect backend URLs

Each layer initially masked the next one.

---

# Final Working System

Backend:

✅ Railway

Frontend:

✅ React + Vite

API:

✅ Express

Embeddings:

✅ Gemini Embedding 2 Preview

Generation:

✅ Gemini 3.5 Flash

Vector Store:

✅ Operational

Upload:

✅ Working

Retrieval:

✅ Working

Grounded Responses:

✅ Working

Health Endpoint:

✅ Operational

Production Deployment:

✅ Successful

---

# Lessons Learned

### Always verify each deployment layer independently.

Do not assume the backend is broken simply because the frontend fails.

---

### Confirm build artifacts.

Ensure production contains:

```
dist/server.cjs
```

before deployment.

---

### Verify health endpoints first.

```
/api/health
```

should always be the first deployment test.

---

### Read deployment logs.

Startup logs often reveal whether the server is already functioning correctly.

---

### Distinguish DNS issues from application issues.

```
DNS failure
```

is fundamentally different from

```
404
```

and

```
500
```

---

### Separate frontend and backend responsibilities.

Frontend deployment problems should not automatically imply backend failures.

---

### Test APIs directly.

Always verify backend routes independently of the frontend.

---

# Final Outcome

The production RAG system is now fully operational.

The application successfully:

* accepts uploaded documents
* parses document content
* chunks text intelligently
* generates Gemini embeddings
* stores vectors
* retrieves relevant chunks
* grounds responses using retrieved context
* generates answers using Gemini 3.5 Flash
* serves the application through Railway
* communicates correctly with the frontend

---

# Concise Summary

The deployment initially appeared to fail due to DNS propagation delays, port conflicts during manual testing, and frontend requests being routed to Vercel instead of the Railway backend. Systematic debugging confirmed that the backend had been functioning correctly throughout the process. After regenerating the Railway public domain, validating the health endpoint, and ensuring the frontend communicated with the Railway API, the entire RAG pipeline—from document upload and embedding generation to vector retrieval and grounded answer generation—worked successfully. The final production deployment is stable, with end-to-end functionality verified.
