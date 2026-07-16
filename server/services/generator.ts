import { ai, CONFIG } from "../config/index";
import { SourceCitation } from "../../src/types";

export interface IGenerator {
  generateAnswer(
    query: string,
    sources: SourceCitation[],
    presetId?: string,
    systemPromptOverride?: string
  ): Promise<{ answer: string; suggestedQuestions: string[] }>;
}

export class GeminiGenerator implements IGenerator {
  async generateAnswer(
    query: string,
    sources: SourceCitation[],
    presetId = "default",
    systemPromptOverride?: string
  ): Promise<{ answer: string; suggestedQuestions: string[] }> {
    console.log(`[Generator] Generating answer for query "${query}" with preset "${presetId}"`);

    // 1. Construct grounded context
    const contextText = sources
      .map((c, i) => `[Source ${i + 1}: ${c.docName} (Chunk ${c.index})]\n${c.text}`)
      .join("\n\n");

    // 2. Determine prompt instruction based on presetId
    let systemInstruction = "You are a helpful RAG assistant.";
    if (presetId === "strict") {
      systemInstruction = "You are a strict factual document search agent. You MUST answer the query using ONLY the provided context. If the answer cannot be found in the context, state 'I cannot find the answer to this question in the provided documents.' Do not make up facts or use outside knowledge.";
    } else if (presetId === "teacher") {
      systemInstruction = "You are an engaging teacher. Explain the answer based on the retrieved documents using a friendly tone, clear explanations, bullet points, and an analogy if it helps make the concepts easy to understand.";
    } else if (presetId === "analyst") {
      systemInstruction = "You are a highly analytical technical advisor. Review the context, extract key facts, statistics, and logical insights, and present a structured, professional, executive-ready summary.";
    } else if (systemPromptOverride) {
      systemInstruction = systemPromptOverride;
    }

    const promptText = `Retrieved Context Documents:
${contextText}

User Question: ${query}

Provide a factual and precise answer based strictly on the retrieved context above. Include natural in-line references where appropriate (e.g., "[Source 1]" or "as described in ${sources[0]?.docName || "the source"}").`;

    // 3. Generate answer using Google Gemini
    let answer = "";
    try {
      const response = await ai.models.generateContent({
        model: CONFIG.generationModel,
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });
      answer = response?.text || "";
      if (!answer) {
        throw new Error("Empty text returned from Gemini.");
      }
    } catch (error: any) {
      console.error("[Generator] Core text generation failed:", error?.message || error);
      throw new Error(`Answer generation failed: ${error?.message || error}`);
    }

    // 4. Ask Gemini to suggest 3 relevant follow-up questions
    let suggestedQuestions: string[] = [];
    try {
      const suggestionResponse = await ai.models.generateContent({
        model: CONFIG.generationModel,
        contents: `Given this user question: "${query}" and this generated answer: "${answer}", generate exactly 3 short, relevant, high-quality follow-up questions that the user might want to ask next.

Return the response ONLY as a raw JSON list of strings, for example: ["Question 1", "Question 2", "Question 3"]. Do not include any extra explanatory text or markdown blocks outside the JSON array.`,
        config: {
          systemInstruction: "You are a helpful QA assistant that outputs only valid raw JSON arrays of strings.",
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const jsonText = suggestionResponse?.text;
      if (jsonText) {
        let cleanedResponse = jsonText.trim();
        if (cleanedResponse.startsWith("```json")) {
          cleanedResponse = cleanedResponse.substring(7);
        }
        if (cleanedResponse.endsWith("```")) {
          cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
        }
        cleanedResponse = cleanedResponse.trim();
        suggestedQuestions = JSON.parse(cleanedResponse);
      }
    } catch (err) {
      console.warn("[Generator] Could not generate follow-up suggestions, utilizing fallbacks:", err);
      suggestedQuestions = [
        "Can you explain the retrieved sources in more detail?",
        "How can I add more custom documents to the index?",
        "How does the cosine similarity score represent relevance?"
      ];
    }

    return {
      answer,
      suggestedQuestions: suggestedQuestions.slice(0, 3)
    };
  }
}

export const generator = new GeminiGenerator();
