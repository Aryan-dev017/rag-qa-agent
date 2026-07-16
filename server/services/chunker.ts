export interface IChunker {
  chunk(text: string, chunkSize?: number, overlap?: number): string[];
}

export class TextChunker implements IChunker {
  chunk(text: string, chunkSize = 600, overlap = 120): string[] {
    console.log(`[Chunker] Chunking text into chunks of max ${chunkSize} chars (overlap: ${overlap})`);
    const chunks: string[] = [];
    if (!text || text.trim() === "") return chunks;

    let startIndex = 0;
    while (startIndex < text.length) {
      let endIndex = startIndex + chunkSize;

      // Try to find a natural sentence or paragraph boundary
      if (endIndex < text.length) {
        let boundaryIndex = -1;
        const searchRange = text.substring(endIndex - 80, endIndex);
        const punctuation = [".\n", "?\n", "!\n", "\n", ". ", "? ", "! ", " "];

        for (const p of punctuation) {
          const pIdx = searchRange.lastIndexOf(p);
          if (pIdx !== -1) {
            boundaryIndex = (endIndex - 80) + pIdx + p.length;
            break;
          }
        }

        if (boundaryIndex !== -1) {
          endIndex = boundaryIndex;
        }
      } else {
        endIndex = text.length;
      }

      const chunk = text.substring(startIndex, endIndex).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      startIndex = endIndex - overlap;
      if (startIndex >= text.length || endIndex === text.length) {
        break;
      }
      // Ensure forward progress
      if (startIndex <= 0) {
        startIndex = endIndex;
      }
    }
    
    console.log(`[Chunker] Created ${chunks.length} chunks`);
    return chunks;
  }
}

export const chunker = new TextChunker();
