import { ai, CONFIG } from "../config/index";

export interface IEmbeddingService {
  embed(text: string, taskType?: "passage" | "query"): Promise<number[]>;
}

export class EmbeddingService implements IEmbeddingService {
  async embed(text: string, taskType: "passage" | "query" = "passage"): Promise<number[]> {
    console.log(`[Embeddings] Generating embedding for text of length ${text.length} with taskType "${taskType}"`);
    try {
      const response = await ai.models.embedContent({
        model: CONFIG.embeddingModel,
        contents: text,
      });

      const embeddingValues = response?.embeddings?.[0]?.values;
      if (embeddingValues) {
        return embeddingValues;
      }
      throw new Error("Response JSON did not contain embedding values.");
    } catch (error: any) {
      console.error("[Embeddings] Embedding generation failed:", error?.message || error);
      throw new Error(`Embedding generation failed: ${error?.message || error}`);
    }
  }
}

export const embeddingsService = new EmbeddingService();
