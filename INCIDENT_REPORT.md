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

```text
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

```bash
npm run build
```

Output:

```text
dist/
    assets/
    index.html
    server.cjs
    server.cjs.map
```

### Result

Confirmed that:

- Frontend compiled correctly.
- Backend bundled correctly.
- Build pipeline was functioning normally.

---

## 2. Backend Startup Validation

### Symptoms

No confirmation whether Railway actually launched the server.

### Investigation

Executed:

```bash
node dist/server.cjs
```

Observed logs:

```text
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

```text
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

Confirmed Railway already owned port **8080**.

---

## 4. Railway Health Endpoint Verification

Initially, there was uncertainty whether Express routes were functioning.

Health endpoint tested:

```text
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

```text
DNS_PROBE_FINISHED_NXDOMAIN
```

or

```text
404 Not Found
```

appeared while testing the Railway URL.

### Cause

The public Railway domain had not fully propagated after regeneration.

### Resolution

- Deleted the old Railway public domain.
- Generated a new Railway public domain.
- Waited for DNS propagation.

Eventually:

```text
https://rag-qa-agent-production.up.railway.app/api/health
```

returned successfully.

---

## 6. False Backend Failure

The backend appeared broken because:

- Browser returned **404**.
- Frontend returned API failures.

However, Railway logs showed:

```text
Server running
```

and

```text
Health route triggered
```

Meaning:

The backend had never actually failed.

The failures originated elsewhere.

---

## 7. Vercel API Routing

The major issue.

Frontend requests looked like:

```javascript
fetch("/api/query")
```

or

```javascript
fetch("/api/documents")
```

When deployed on Vercel, those requests resolved to:

```text
https://vercel-domain/api/...
```

instead of Railway.

Vercel therefore returned:

```text
404
```

because it had no backend.

### Resolution

Configured the frontend API base URL to point to Railway.

Instead of:

```text
/ api/query
```

the frontend now communicates with:

```text
https://rag-qa-agent-production.up.railway.app/api/query
```

---

## 8. Railway Console Limitations

Several debugging inconveniences were encountered.

Examples:

- No copy/paste support.
- Limited shell commands.
- Missing utilities such as `curl`.
- Manual typing required for long commands.

Alternative methods using Node.js built-in `fetch()` were used for verification.

---

## 9. Verification of Upload Pipeline

Confirmed working pipeline:

```text
Document Upload
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
Vector Storage
      │
      ▼
Retrieval
```

Upload logs confirmed:

```text
Chunks created

Embeddings generated

Stored successfully

Loaded successfully
```

---

## 10. End-to-End Retrieval Verification

Uploaded:

```text
wscience.txt
```

System reported:

```text
Indexed successfully
```

Knowledge context displayed:

```text
4 vectors
```

Queries produced grounded responses with citations.

This verified:

- Retrieval
- Embedding generation
- Similarity search
- Gemini response generation

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

Each layer initially masked the next one, making the overall issue appear larger than it actually was.

---

# Final Working System

| Component | Status |
|-----------|--------|
| Backend | ✅ Railway |
| Frontend | ✅ React + Vite |
| API | ✅ Express |
| Embeddings | ✅ Gemini Embedding 2 Preview |
| Generation | ✅ Gemini 3.5 Flash |
| Vector Store | ✅ Operational |
| Upload Pipeline | ✅ Working |
| Retrieval | ✅ Working |
| Grounded Responses | ✅ Working |
| Health Endpoint | ✅ Operational |
| Production Deployment | ✅ Successful |

---

# Lessons Learned

### Always verify each deployment layer independently.

Do not assume the backend is broken simply because the frontend fails.

---

### Confirm build artifacts.

Ensure production contains:

```text
dist/server.cjs
```

before deployment.

---

### Verify health endpoints first.

```text
/ api/health
```

should always be the first deployment test.

---

### Read deployment logs.

Startup logs often reveal whether the server is already functioning correctly.

---

### Distinguish DNS issues from application issues.

```text
DNS failure
```

is fundamentally different from

```text
404
```

and

```text
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

- Accepts uploaded documents.
- Parses document content.
- Chunks text intelligently.
- Generates Gemini embeddings.
- Stores vectors.
- Retrieves relevant chunks.
- Grounds responses using retrieved context.
- Generates answers using Gemini 3.5 Flash.
- Serves the backend through Railway.
- Communicates correctly with the Vercel frontend.

---

# Concise Summary

The deployment initially appeared to fail due to DNS propagation delays, port conflicts during manual testing, and frontend requests being routed to Vercel instead of the Railway backend. Systematic debugging confirmed that the backend had been functioning correctly throughout the process. After regenerating the Railway public domain, validating the health endpoint, and configuring the frontend to communicate with the Railway API, the entire RAG pipeline—from document upload and embedding generation to vector retrieval and grounded answer generation—worked successfully. The final production deployment is stable, with end-to-end functionality fully verified.
