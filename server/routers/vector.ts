import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { ragService } from '@/lib/ragService';
import { vectorStore } from '@/lib/vectorStore';
import { embeddingService } from '@/lib/embeddings';
import { dataIngestionService } from '@/lib/dataIngestion';

export const vectorRouter = router({
  // Test vector services
  testVectorServices: publicProcedure
    .query(async () => {
      try {
        const [embeddingsTest, vectorStats] = await Promise.all([
          embeddingService.testConnection(),
          vectorStore.getContentStats()
        ]);

        return {
          embeddings: embeddingsTest,
          vectorStore: {
            status: vectorStats.totalContent > 0 ? 'success' : 'empty',
            message: `Vector store contains ${vectorStats.totalContent} documents`,
            stats: vectorStats
          },
          overall: {
            status: embeddingsTest.status === 'success' && vectorStats.totalContent > 0 ? 'success' : 
                    embeddingsTest.status === 'success' ? 'partial' : 'demo',
            message: embeddingsTest.status === 'success' ? 
                    (vectorStats.totalContent > 0 ? 'RAG system fully operational' : 'RAG ready, needs content') :
                    'RAG disabled - using fallback responses'
          }
        };
      } catch (error) {
        console.error('Vector services test error:', error);
        return {
          embeddings: { status: 'error', message: 'Service unavailable' },
          vectorStore: { status: 'error', message: 'Service unavailable', stats: { totalContent: 0, contentTypes: {}, recentContent: 0 } },
          overall: { status: 'error', message: 'Vector services unavailable' }
        };
      }
    }),

  // RAG-enhanced search
  ragSearch: publicProcedure
    .input(z.object({
      query: z.string().min(1, "Query is required"),
      conversationId: z.string().optional(),
      location: z.string().optional(),
      maxContext: z.number().min(1).max(10).default(5),
      contentTypes: z.array(z.string()).optional(),
      includeHistory: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await ragService.generateRAGResponse(input);
        return result;
      } catch (error) {
        console.error('RAG search error:', error);
        throw new Error(error instanceof Error ? error.message : 'RAG search failed');
      }
    }),

  // Vector similarity search
  searchSimilar: publicProcedure
    .input(z.object({
      query: z.string().min(1, "Query is required"),
      contentTypes: z.array(z.string()).optional(),
      limit: z.number().min(1).max(20).default(10),
      threshold: z.number().min(0).max(1).default(0.5),
      location: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const searchRequest = {
          query: input.query,
          contentTypes: input.contentTypes,
          limit: input.limit,
          threshold: input.threshold,
          ...(input.location && { metadata: { location: input.location } })
        };

        const results = await vectorStore.searchSimilar(searchRequest);
        return {
          results,
          total: results.length,
          avgSimilarity: results.length > 0 ? 
            results.reduce((sum, r) => sum + r.similarity, 0) / results.length : 0
        };
      } catch (error) {
        console.error('Vector search error:', error);
        throw new Error(error instanceof Error ? error.message : 'Vector search failed');
      }
    }),

  // Content management
  addContent: publicProcedure
    .input(z.object({
      contentId: z.string().min(1),
      contentType: z.string().min(1),
      title: z.string().min(1),
      content: z.string().min(1),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const id = await vectorStore.storeContent(input);
        return { success: true, id };
      } catch (error) {
        console.error('Error adding content:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to add content');
      }
    }),

  updateContent: publicProcedure
    .input(z.object({
      id: z.string().min(1),
      contentId: z.string().optional(),
      contentType: z.string().optional(),
      title: z.string().optional(),
      content: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { id, ...updates } = input;
        await vectorStore.updateContent(id, updates);
        return { success: true };
      } catch (error) {
        console.error('Error updating content:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update content');
      }
    }),

  deleteContent: publicProcedure
    .input(z.object({
      id: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        await vectorStore.deleteContent(input.id);
        return { success: true };
      } catch (error) {
        console.error('Error deleting content:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete content');
      }
    }),

  // Data ingestion
  ingestCulturalData: publicProcedure
    .mutation(async () => {
      try {
        const result = await dataIngestionService.ingestCulturalData();
        return result;
      } catch (error) {
        console.error('Cultural data ingestion error:', error);
        throw new Error(error instanceof Error ? error.message : 'Data ingestion failed');
      }
    }),

  clearAllContent: publicProcedure
    .mutation(async () => {
      try {
        const result = await dataIngestionService.clearAllContent();
        return result;
      } catch (error) {
        console.error('Error clearing content:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to clear content');
      }
    }),

  // Statistics and monitoring
  getVectorStats: publicProcedure
    .query(async () => {
      try {
        const [contentStats, ragStats, ingestionStatus] = await Promise.all([
          vectorStore.getContentStats(),
          ragService.getRAGStats(),
          dataIngestionService.getIngestionStatus()
        ]);

        return {
          content: contentStats,
          rag: ragStats,
          ingestion: ingestionStatus,
          timestamp: new Date()
        };
      } catch (error) {
        console.error('Error getting vector stats:', error);
        return {
          content: { totalContent: 0, contentTypes: {}, recentContent: 0 },
          rag: { totalQueries: 0, avgConfidence: 0, topContentTypes: [], recentActivity: 0 },
          ingestion: {
            contentStats: { totalContent: 0, contentTypes: {}, recentContent: 0 },
            systemHealth: { vectorStore: false, embeddings: false }
          },
          timestamp: new Date()
        };
      }
    }),

  // Get content by type
  getContentByType: publicProcedure
    .input(z.object({
      contentType: z.string().min(1),
      limit: z.number().min(1).max(50).default(20),
      location: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const searchResults = await vectorStore.searchSimilar({
          query: input.contentType,
          contentTypes: [input.contentType],
          limit: input.limit,
          threshold: 0.1, // Low threshold for broader results
          ...(input.location && { metadata: { location: input.location } })
        });

        return {
          content: searchResults,
          total: searchResults.length,
          contentType: input.contentType
        };
      } catch (error) {
        console.error('Error getting content by type:', error);
        return {
          content: [],
          total: 0,
          contentType: input.contentType
        };
      }
    }),
});