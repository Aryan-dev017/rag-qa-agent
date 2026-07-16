import { Router } from "express";
import { vectorStore } from "../services/vectorStore";

const router = Router();

router.get("/health", (req, res) => {
  console.log("[Route] Health check triggered");
  res.json({ success: true, status: "ok", message: "RAG Q&A Agent Server is healthy" });
});

router.get("/stats", (req, res) => {
  const documents = vectorStore.getDocuments();
  const chunks = vectorStore.getChunkEmbeddings();
  res.json({
    documentCount: documents.length,
    chunkCount: chunks.length,
    lastUpdated: new Date().toISOString()
  });
});

export default router;
