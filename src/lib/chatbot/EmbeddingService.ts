import { Logger } from './Logger';

export class EmbeddingService {
  private hfToken: string | undefined;

  constructor() {
    this.hfToken = process.env.HF_TOKEN;
  }

  /**
   * Generates embeddings using BAAI/bge-m3 via HuggingFace Inference API.
   * If HF_TOKEN is not set, it uses a dummy embedding (for testing/development)
   * or you can switch to OpenAI embeddings if DeepSeek adds them later.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.hfToken) {
      Logger.warn('HF_TOKEN is not set. Using fallback/dummy embeddings. Please set HF_TOKEN for real BAAI/bge-m3 embeddings.');
      // Return a dummy vector of 1024 dimensions (typical for bge-m3)
      return Array(1024).fill(0).map(() => Math.random());
    }

    try {
      const response = await fetch('https://api-inference.huggingface.co/pipeline/feature-extraction/BAAI/bge-m3', {
        headers: { Authorization: `Bearer ${this.hfToken}` },
        method: 'POST',
        body: JSON.stringify({ inputs: text }),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      }

      const result = await response.json();
      // bge-m3 might return a nested array depending on input format
      return Array.isArray(result[0]) ? result[0] : result;
    } catch (error) {
      Logger.error('Error generating embedding', error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = [];
    for (const text of texts) {
      embeddings.push(await this.generateEmbedding(text));
    }
    return embeddings;
  }
}

export const embeddingService = new EmbeddingService();
