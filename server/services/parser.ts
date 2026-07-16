export interface IParser {
  parse(name: string, content: string): Promise<string>;
}

export class DocumentParser implements IParser {
  async parse(name: string, content: string): Promise<string> {
    console.log(`[Parser] Parsing document "${name}" (${content.length} characters)`);
    if (!content || content.trim() === "") {
      throw new Error("Document content is empty.");
    }
    return content;
  }
}

export const parser = new DocumentParser();
