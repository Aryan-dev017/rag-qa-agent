import { DocumentInfo, ChunkInfo } from "../../src/types";

export interface IVectorStore {
  addDocument(doc: DocumentInfo): void;
  getDocuments(): DocumentInfo[];
  addChunkEmbeddings(chunks: { chunk: ChunkInfo; embedding: number[] }[]): void;
  getChunkEmbeddings(): { chunk: ChunkInfo; embedding: number[] }[];
  deleteDocument(docId: string): void;
  reset(): void;
}

export class InMemoryVectorStore implements IVectorStore {
  private documents: DocumentInfo[] = [];
  private chunkEmbeddings: { chunk: ChunkInfo; embedding: number[] }[] = [];

  addDocument(doc: DocumentInfo): void {
    console.log(`[VectorStore] Adding document "${doc.name}" (id: ${doc.id})`);
    this.documents.push(doc);
  }

  getDocuments(): DocumentInfo[] {
    return this.documents;
  }

  addChunkEmbeddings(chunks: { chunk: ChunkInfo; embedding: number[] }[]): void {
    console.log(`[VectorStore] Storing ${chunks.length} chunk embeddings`);
    this.chunkEmbeddings.push(...chunks);
  }

  getChunkEmbeddings(): { chunk: ChunkInfo; embedding: number[] }[] {
    return this.chunkEmbeddings;
  }

  deleteDocument(docId: string): void {
    console.log(`[VectorStore] Deleting document "${docId}" and associated chunk embeddings`);
    this.documents = this.documents.filter(doc => doc.id !== docId);
    this.chunkEmbeddings = this.chunkEmbeddings.filter(item => item.chunk.docId !== docId);
  }

  reset(): void {
    console.log(`[VectorStore] Resetting database`);
    this.documents = [];
    this.chunkEmbeddings = [];
  }
}

export const vectorStore = new InMemoryVectorStore();
