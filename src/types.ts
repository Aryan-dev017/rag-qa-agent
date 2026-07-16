export interface DocumentInfo {
  id: string;
  name: string;
  content: string;
  charCount: number;
  chunkCount: number;
  createdAt: string;
}

export interface ChunkInfo {
  id: string;
  docId: string;
  docName: string;
  text: string;
  index: number;
  similarity?: number; // Added when queried
}

export interface SourceCitation {
  chunkId: string;
  docId: string;
  docName: string;
  text: string;
  index: number;
  score: number;
}

export interface QueryResult {
  answer: string;
  sources: SourceCitation[];
  suggestedQuestions: string[];
}

export interface SystemPromptPreset {
  id: string;
  name: string;
  description: string;
  instruction: string;
}

export interface ServerStats {
  documentCount: number;
  chunkCount: number;
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  sources?: SourceCitation[];
  suggestedQuestions?: string[];
  timestamp: string;
  latency?: number;
  isBookmarked?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  kbId: string;
  presetId: string;
  createdAt: string;
  isPinned: boolean;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}
