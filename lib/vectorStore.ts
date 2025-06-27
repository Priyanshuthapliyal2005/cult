import { prisma } from '@/lib/prisma';
import { embeddingService, EmbeddingRequest } from '@/lib/embeddings';

export interface VectorSearchRequest {
  query: string;
  contentTypes?: string[];
  limit?: number;
  threshold?: number;
  metadata?: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  contentId: string;
  contentType: string;
  title: string;
  content: string;
  metadata: any;
  similarity: number;
  createdAt: Date;
}

export interface ContentToStore {
  contentId: string;
  contentType: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export class VectorStore {
  constructor() {}

  async storeContent(content: ContentToStore): Promise<string> {
    try {
      // Generate embedding for the content
      const embeddingResponse = await embeddingService.generateEmbedding({
        text: `${content.title}\n\n${content.content}`,
        title: content.title,
        taskType: 'RETRIEVAL_DOCUMENT'
      });

      // Store in database
      const stored = await prisma.vectorContent.create({
        data: {
          contentId: content.contentId,
          contentType: content.contentType,
          title: content.title,
          content: content.content,
          metadata: content.metadata || {},
          embedding: embeddingResponse.embedding as any,
        },
      });

      console.log(`✅ Stored vector content: ${content.contentType}/${content.title}`);
      return stored.id;
    } catch (error) {
      console.error('Error storing vector content:', error);
      throw new Error(`Failed to store content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async storeBatchContent(contents: ContentToStore[]): Promise<string[]> {
    const results: string[] = [];
    
    // Process in smaller batches to manage memory and API limits
    const batchSize = 3;
    for (let i = 0; i < contents.length; i += batchSize) {
      const batch = contents.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.all(
          batch.map(content => this.storeContent(content))
        );
        results.push(...batchResults);
      } catch (error) {
        console.error(`Error storing batch ${i}-${i + batch.length}:`, error);
        results.push(...batch.map(() => ''));
      }
      
      // Small delay between batches
      if (i + batchSize < contents.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
  }

  async searchSimilar(request: VectorSearchRequest): Promise<VectorSearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await embeddingService.generateEmbedding({
        text: request.query,
        taskType: 'RETRIEVAL_QUERY'
      });

      // Build SQL query with vector similarity search
      const contentTypeFilter = request.contentTypes 
        ? `AND content_type = ANY($2::text[])`
        : '';
      
      const metadataFilter = request.metadata
        ? `AND metadata @> $${request.contentTypes ? 3 : 2}::jsonb`
        : '';

      let paramIndex = 1;
      const params: any[] = [queryEmbedding.embedding];
      
      if (request.contentTypes) {
        params.push(request.contentTypes);
        paramIndex++;
      }
      
      if (request.metadata) {
        params.push(JSON.stringify(request.metadata));
        paramIndex++;
      }

      params.push(request.threshold || 0.5);
      params.push(request.limit || 10);

      const query = `
        SELECT 
          id,
          content_id,
          content_type,
          title,
          content,
          metadata,
          created_at,
          (1 - (embedding <=> $1::vector)) as similarity
        FROM vector_content
        WHERE (1 - (embedding <=> $1::vector)) > $${paramIndex + 1}
        ${contentTypeFilter}
        ${metadataFilter}
        ORDER BY embedding <=> $1::vector
        LIMIT $${paramIndex + 2}
      `;

      const results = await prisma.$queryRawUnsafe(query, ...params) as any[];

      return results.map(row => ({
        id: row.id,
        contentId: row.content_id,
        contentType: row.content_type,
        title: row.title,
        content: row.content,
        metadata: row.metadata,
        similarity: parseFloat(row.similarity),
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Error searching vectors:', error);
      
      // Fallback to simple text search if vector search fails
      try {
        const textResults = await prisma.vectorContent.findMany({
          where: {
            OR: [
              { title: { contains: request.query, mode: 'insensitive' } },
              { content: { contains: request.query, mode: 'insensitive' } }
            ],
            ...(request.contentTypes && { contentType: { in: request.contentTypes } })
          },
          take: request.limit || 10,
          orderBy: { createdAt: 'desc' }
        });

        return textResults.map(result => ({
          id: result.id,
          contentId: result.contentId,
          contentType: result.contentType,
          title: result.title,
          content: result.content,
          metadata: result.metadata,
          similarity: 0.5, // Default similarity for text search
          createdAt: result.createdAt
        }));
      } catch (textError) {
        console.error('Text search fallback also failed:', textError);
        return [];
      }
    }
  }

  async updateContent(id: string, updates: Partial<ContentToStore>): Promise<void> {
    try {
      const existing = await prisma.vectorContent.findUnique({
        where: { id }
      });

      if (!existing) {
        throw new Error('Content not found');
      }

      let newEmbedding: number[] | undefined;
      
      // Regenerate embedding if title or content changed
      if (updates.title || updates.content) {
        const newTitle = updates.title || existing.title;
        const newContent = updates.content || existing.content;
        
        const embeddingResponse = await embeddingService.generateEmbedding({
          text: `${newTitle}\n\n${newContent}`,
          title: newTitle,
          taskType: 'RETRIEVAL_DOCUMENT'
        });
        
        newEmbedding = embeddingResponse.embedding;
      }

      await prisma.vectorContent.update({
        where: { id },
        data: {
          ...(updates.contentId && { contentId: updates.contentId }),
          ...(updates.contentType && { contentType: updates.contentType }),
          ...(updates.title && { title: updates.title }),
          ...(updates.content && { content: updates.content }),
          ...(updates.metadata && { metadata: updates.metadata }),
          ...(newEmbedding && { embedding: newEmbedding as any }),
          updatedAt: new Date()
        }
      });

      console.log(`✅ Updated vector content: ${id}`);
    } catch (error) {
      console.error('Error updating vector content:', error);
      throw new Error(`Failed to update content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteContent(id: string): Promise<void> {
    try {
      await prisma.vectorContent.delete({
        where: { id }
      });
      console.log(`✅ Deleted vector content: ${id}`);
    } catch (error) {
      console.error('Error deleting vector content:', error);
      throw new Error(`Failed to delete content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getContentStats(): Promise<{
    totalContent: number;
    contentTypes: Record<string, number>;
    recentContent: number;
  }> {
    try {
      const [total, typeStats, recent] = await Promise.all([
        prisma.vectorContent.count(),
        prisma.vectorContent.groupBy({
          by: ['contentType'],
          _count: { id: true }
        }),
        prisma.vectorContent.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })
      ]);

      const contentTypes = typeStats.reduce((acc, stat) => {
        acc[stat.contentType] = stat._count.id;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalContent: total,
        contentTypes,
        recentContent: recent
      };
    } catch (error) {
      console.error('Error getting content stats:', error);
      return {
        totalContent: 0,
        contentTypes: {},
        recentContent: 0
      };
    }
  }
}

// Singleton instance
export const vectorStore = new VectorStore();