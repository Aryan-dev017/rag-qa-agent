import { Router } from "express";
import { embeddingsService } from "../services/embeddings";
import { retriever } from "../services/retriever";
import { generator } from "../services/generator";
import { vectorStore } from "../services/vectorStore";

const router = Router();

async function handleChatQuery(
  query: string,
  presetId?: string,
  systemPromptOverride?: string
) {
  console.log(`[Chat Pipeline] Question Received: "${query}"`);

  if (vectorStore.getChunkEmbeddings().length === 0) {
    throw new Error("No documents have been indexed yet. Please upload a document first.");
  }

  // 1. Generate query embedding
  const queryVector = await embeddingsService.embed(query, "query");
  console.log("[Chat Pipeline] Embedding Generated successfully.");

  // 2. Perform vector similarity search
  const topSources = await retriever.retrieve(queryVector, 4);
  console.log("[Chat Pipeline] Vector Search Complete. Retrieved chunks count:", topSources.length);

  if (topSources.length === 0) {
    throw new Error("No similar document chunks could be retrieved to answer this query.");
  }

  // 3. Generate answer grounded on retrieved chunks
  const { answer, suggestedQuestions } = await generator.generateAnswer(
    query,
    topSources,
    presetId,
    systemPromptOverride
  );
  console.log("[Chat Pipeline] LLM Response Received and parsed. Answer Returned.");

  return {
    answer,
    sources: topSources,
    suggestedQuestions
  };
}

// POST /query (Frontend compatibility)
router.post("/query", async (req, res) => {
  const { query, presetId, systemPromptOverride } = req.body;
  if (!query || query.trim() === "") {
    return res.status(400).json({ success: false, error: "Query is required." });
  }

  try {
    const result = await handleChatQuery(query, presetId, systemPromptOverride);
    res.json(result);
  } catch (error: any) {
    console.error("[Route] Query error:", error);
    res.status(500).json({ success: false, error: error?.message || "Failed to process query." });
  }
});

// POST /chat (Target API compatibility)
router.post("/chat", async (req, res) => {
  const { query, presetId } = req.body;
  if (!query || query.trim() === "") {
    return res.status(400).json({ success: false, error: "Query is required." });
  }

  try {
    const result = await handleChatQuery(query, presetId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[Route] Chat error:", error);
    res.status(500).json({ success: false, error: error?.message || "Failed to process chat." });
  }
});

export default router;
