import { Router } from "express";
import { parser } from "../services/parser";
import { chunker } from "../services/chunker";
import { embeddingsService } from "../services/embeddings";
import { vectorStore } from "../services/vectorStore";
import { DocumentInfo, ChunkInfo } from "../../src/types";

const router = Router();

export async function ingestDocumentHelper(name: string, content: string, id?: string): Promise<DocumentInfo> {
  const docId = id || `doc_${Date.now()}`;
  
  // 1. Extract raw text (Parser)
  console.log("[Upload Pipeline] Starting ingestion for:", name);
  const rawText = await parser.parse(name, content);
  console.log("[Upload Pipeline] Text extracted successfully. Length:", rawText.length);

  // 2. Split into overlapping chunks (Chunker)
  const textChunks = chunker.chunk(rawText);
  console.log("[Upload Pipeline] Chunks created. Total count:", textChunks.length);

  // 3. Generate embeddings & Store vectors (EmbeddingService)
  const tempEmbeddings: { chunk: ChunkInfo; embedding: number[] }[] = [];

  for (let i = 0; i < textChunks.length; i++) {
    const chunkTextContent = textChunks[i];
    
    // Call Embedding Service
    const values = await embeddingsService.embed(chunkTextContent, "passage");

    const chunkInfo: ChunkInfo = {
      id: `chunk_${docId}_${i}`,
      docId,
      docName: name,
      text: chunkTextContent,
      index: i
    };

    tempEmbeddings.push({
      chunk: chunkInfo,
      embedding: values
    });
  }
  console.log("[Upload Pipeline] Embeddings generated successfully.");

  const newDoc: DocumentInfo = {
    id: docId,
    name,
    content: rawText,
    charCount: rawText.length,
    chunkCount: textChunks.length,
    createdAt: new Date().toISOString()
  };

  // 4. Store in vectorStore
  vectorStore.addDocument(newDoc);
  vectorStore.addChunkEmbeddings(tempEmbeddings);
  console.log("[Upload Pipeline] Stored successfully in Vector Store.");

  return newDoc;
}

// Default document definition
export const DEFAULT_DOC_NAME = "Retrieval-Augmented Generation (RAG) & Gemini Overview";
export const DEFAULT_DOC_CONTENT = `Retrieval-Augmented Generation (RAG) Guide
RAG is an architectural pattern that enhances the capabilities of Large Language Models (LLMs) by integrating external knowledge sources. This approach addresses several core limitations of standard LLMs, such as factual hallucinations, lack of private domain knowledge, and outdated training data.

Core Components of RAG:
1. Ingestion Pipeline: Documents are collected, parsed, and cleaned. Next, they are broken down into smaller, coherent text segments called "chunks." This is essential because LLMs have context window limits, and smaller segments allow for more precise retrieval.
2. Embedding Generation: Each text chunk is converted into a high-dimensional vector (embedding) using the 'gemini-embedding-2-preview' model. An embedding represents the semantic meaning of the text.
3. Vector Storage: Vector embeddings are stored alongside the original text chunks in a vector database or in-memory array.
4. Retrieval: When a user asks a question, the query is also converted into an embedding. We compute the cosine similarity between the query vector and all chunk vectors to find the top-K most semantically similar chunks.
5. Generation: The retrieved chunks are injected into the LLM prompt as context. The model (such as 'gemini-3.5-flash') uses this grounded context to generate a factual, verifiable answer.

Benefits of RAG:
- Reduces Hallucinations: Grounding the model's response in retrieved documents ensures it speaks only from verified facts.
- Data Privacy: RAG allows secure access to private enterprise documents without needing to pre-train or fine-tune models.
- Auditability: Every answer can be traced back to its specific source document and paragraph (citations).

Gemini Models:
- gemini-3.5-flash: Google's powerful, lightweight, and highly conversational flagship model. It provides high-quality text completions, advanced language understanding, and extremely robust and fast reasoning capabilities.`;

// Ingest default on boot/reset
export async function initDefaultDoc() {
  try {
    console.log("[Boot] Ingesting default document...");
    await ingestDocumentHelper(DEFAULT_DOC_NAME, DEFAULT_DOC_CONTENT, "doc_default");
    console.log("[Boot] Successfully loaded default document with embeddings.");
  } catch (error) {
    console.error("[Boot] Could not ingest default document:", error);
  }
}

// --- Routes ---

// POST /documents
router.post("/documents", async (req, res) => {
  const { name, content } = req.body;
  if (!name || !content || content.trim() === "") {
    return res.status(400).json({ success: false, error: "Document name and content are required." });
  }

  try {
    const exists = vectorStore.getDocuments().some(doc => doc.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, error: `A document with the name "${name}" is already ingested.` });
    }

    const doc = await ingestDocumentHelper(name, content);
    res.status(201).json(doc);
  } catch (error: any) {
    console.error("[Route] Ingestion error:", error);
    res.status(500).json({ success: false, error: error?.message || "Failed to ingest document." });
  }
});

// POST /upload (Target API Spec Compatibility)
router.post("/upload", async (req, res) => {
  const { name, content } = req.body;
  if (!name || !content || content.trim() === "") {
    return res.status(400).json({ success: false, error: "Document name and content are required." });
  }

  try {
    const doc = await ingestDocumentHelper(name, content);
    res.status(201).json({ success: true, message: "Document uploaded and indexed successfully", doc });
  } catch (error: any) {
    console.error("[Route] Upload error:", error);
    res.status(500).json({ success: false, error: error?.message || "Failed to upload document." });
  }
});

// GET /documents
router.get("/documents", (req, res) => {
  res.json(vectorStore.getDocuments());
});

// GET /chunks
router.get("/chunks", (req, res) => {
  const rawChunks = vectorStore.getChunkEmbeddings().map(item => item.chunk);
  res.json(rawChunks);
});

// DELETE /documents/:id
router.delete("/documents/:id", (req, res) => {
  const { id } = req.params;
  const initialCount = vectorStore.getDocuments().length;
  
  vectorStore.deleteDocument(id);

  if (vectorStore.getDocuments().length === initialCount) {
    return res.status(404).json({ success: false, error: "Document not found." });
  }

  res.json({ success: true, message: "Document and its embeddings deleted successfully." });
});

// POST /reset
router.post("/reset", async (req, res) => {
  try {
    vectorStore.reset();
    await initDefaultDoc();
    res.json({ success: true, message: "Reset to default document successfully." });
  } catch (error: any) {
    console.error("[Route] Reset error:", error);
    res.status(500).json({ success: false, error: error?.message || "Failed to reset knowledge base." });
  }
});

export default router;
