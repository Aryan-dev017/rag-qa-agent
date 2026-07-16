import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ override: true });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. RAG services will fail.");
}

export const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const CONFIG = {
  port: parseInt(process.env.PORT || "3000", 10),
  embeddingModel: "gemini-embedding-2-preview",
  generationModel: "gemini-3.5-flash",
};
