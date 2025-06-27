import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface EmbeddingRequest {
  text: string;
  title?: string;
  taskType?: 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT' | 'SEMANTIC_SIMILARITY';
}

export interface EmbeddingResponse {
  embedding: number[];
  dimensions: number;
}

export class EmbeddingService {
  private model: any;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    }
  }

  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    if (!this.model || !process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured for embeddings');
    }

    try {
      const result = await this.model.embedContent({
        content: request.text,
        taskType: request.taskType || 'RETRIEVAL_DOCUMENT',
        title: request.title
      });

      const embedding = result.embedding.values;
      
      if (!embedding || embedding.length === 0) {
        throw new Error('Empty embedding received');
      }

      return {
        embedding,
        dimensions: embedding.length
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateBatchEmbeddings(requests: EmbeddingRequest[]): Promise<EmbeddingResponse[]> {
    const results: EmbeddingResponse[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(request => this.generateEmbedding(request));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Error processing batch ${i}-${i + batch.length}:`, error);
        // Add null results for failed batch
        results.push(...batch.map(() => ({ embedding: [], dimensions: 0 })));
      }
      
      // Small delay between batches
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        status: 'demo',
        message: 'Embeddings service not configured - vector search disabled'
      };
    }

    try {
      await this.generateEmbedding({ text: 'Test embedding generation' });
      return {
        status: 'success',
        message: 'Embeddings service connected successfully'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  // Calculate cosine similarity between two embeddings
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embedding dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Normalize embedding vector
  static normalizeEmbedding(embedding: number[]): number[] {
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return norm === 0 ? embedding : embedding.map(val => val / norm);
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();