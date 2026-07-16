import { SourceCitation } from "../../src/types";
import { vectorStore } from "./vectorStore";

export interface IRetriever {
  retrieve(queryVector: number[], topK?: number): Promise<SourceCitation[]>;
}

export class SemanticRetriever implements IRetriever {
  async retrieve(queryVector: number[], topK = 4): Promise<SourceCitation[]> {
    console.log(`[Retriever] Retrieving Top-${topK} matches for query embedding`);
    const chunkEmbeddings = vectorStore.getChunkEmbeddings();
    
    if (chunkEmbeddings.length === 0) {
      return [];
    }

    const scoredChunks: SourceCitation[] = chunkEmbeddings.map(item => {
      const score = this.cosineSimilarity(queryVector, item.embedding);
      return {
        chunkId: item.chunk.id,
        docId: item.chunk.docId,
        docName: item.chunk.docName,
        text: item.chunk.text,
        index: item.chunk.index,
        score
      };
    });

    // Sort descending by similarity score
    scoredChunks.sort((a, b) => b.score - a.score);

    const topChunks = scoredChunks.slice(0, topK);
    console.log(`[Retriever] Retrieved ${topChunks.length} chunks. Highest similarity score: ${topChunks[0]?.score || 0}`);
    return topChunks;
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const retriever = new SemanticRetriever();
