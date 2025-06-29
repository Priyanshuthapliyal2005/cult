import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { dynamicKnowledgeBase } from '@/lib/dynamicKnowledgeBase';
import { chromaDb } from '@/lib/chromaDb';

export const dynamicKnowledgeBaseRouter = router({
  // Initialize knowledge base
  initialize: publicProcedure
    .mutation(async () => {
      const result = await dynamicKnowledgeBase.initialize();
      return { success: result };
    }),
  
  // Test connection
  testConnection: publicProcedure
    .query(async () => {
      return await chromaDb.testConnection();
    }),
  
  // Get knowledge base stats
  getStats: publicProcedure
    .query(async () => {
      return await dynamicKnowledgeBase.getStats();
    }),
  
  // Search knowledge base
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1, "Query is required"),
      filters: z.record(z.any()).optional(),
      limit: z.number().min(1).max(50).default(10),
      includeRawContent: z.boolean().default(false)
    }))
    .query(async ({ input }) => {
      const results = await dynamicKnowledgeBase.searchKnowledgeBase({
        query: input.query,
        filters: input.filters,
        limit: input.limit,
        includeRawContent: input.includeRawContent
      });
      
      return {
        results,
        count: results.length,
        query: input.query
      };
    }),
  
  // Add new destination
  addDestination: publicProcedure
    .input(z.object({
      name: z.string().min(1, "Name is required"),
      country: z.string().min(1, "Country is required"),
      region: z.string().optional(),
      description: z.string().min(1, "Description is required"),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number()
      }).optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ input }) => {
      const id = await dynamicKnowledgeBase.addDestination(input);
      
      // Generate additional content
      try {
        const generatedContent = await dynamicKnowledgeBase.generateDestinationContent(
          input.name, input.country
        );
        
        // Add cultural insights
        await dynamicKnowledgeBase.addCulturalInsight({
          destinationName: input.name,
          country: input.country,
          insightType: 'custom',
          title: 'Cultural Overview',
          content: generatedContent.description,
          metadata: {
            highlights: generatedContent.culturalHighlights,
            subtype: 'overview'
          }
        });
        
        // Add customs and etiquette
        await dynamicKnowledgeBase.addCulturalInsight({
          destinationName: input.name,
          country: input.country,
          insightType: 'custom',
          title: 'Customs & Etiquette',
          content: generatedContent.customsAndEtiquette.join('\n\n'),
          metadata: {
            customs: generatedContent.customsAndEtiquette,
            subtype: 'etiquette'
          }
        });
        
        // Add local laws
        await dynamicKnowledgeBase.addCulturalInsight({
          destinationName: input.name,
          country: input.country,
          insightType: 'law',
          title: 'Local Laws & Regulations',
          content: generatedContent.localLaws.join('\n\n'),
          metadata: {
            laws: generatedContent.localLaws,
            subtype: 'regulations'
          }
        });
        
        // Add essential phrases
        await dynamicKnowledgeBase.addCulturalInsight({
          destinationName: input.name,
          country: input.country,
          insightType: 'phrase',
          title: 'Essential Phrases',
          content: generatedContent.essentialPhrases.map(p => 
            `${p.english}: ${p.local} (${p.pronunciation})`
          ).join('\n\n'),
          metadata: {
            phrases: generatedContent.essentialPhrases,
            subtype: 'language'
          }
        });
      } catch (error) {
        console.error('Error generating additional content:', error);
        // Continue without additional content
      }
      
      return {
        success: true,
        id
      };
    }),
  
  // Add cultural insight
  addCulturalInsight: publicProcedure
    .input(z.object({
      destinationName: z.string().min(1, "Destination name is required"),
      country: z.string().min(1, "Country is required"),
      insightType: z.enum(['custom', 'law', 'phrase', 'event']),
      title: z.string().min(1, "Title is required"),
      content: z.string().min(1, "Content is required"),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ input }) => {
      const id = await dynamicKnowledgeBase.addCulturalInsight(input);
      return {
        success: true,
        id
      };
    }),
  
  // Import from external source
  importFromExternalSource: publicProcedure
    .input(z.object({
      type: z.enum(['wikipedia', 'tourism_api', 'custom']),
      data: z.any(),
      mapping: z.record(z.string()).optional()
    }))
    .mutation(async ({ input }) => {
      const ids = await dynamicKnowledgeBase.importFromExternalSource({
        type: input.type,
        data: input.data,
        mapping: input.mapping || {}
      });
      
      return {
        success: ids.length > 0,
        count: ids.length,
        ids
      };
    }),
  
  // List collections
  listCollections: publicProcedure
    .query(async () => {
      return await chromaDb.listCollections();
    }),
  
  // Get collection stats
  getCollectionStats: publicProcedure
    .input(z.object({
      name: z.string().min(1, "Collection name is required")
    }))
    .query(async ({ input }) => {
      return await chromaDb.getCollectionStats(input.name);
    })
});