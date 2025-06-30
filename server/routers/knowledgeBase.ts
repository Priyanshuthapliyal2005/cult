import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { travelKnowledgeBase } from '@/lib/knowledgeBase';
import { qualityAssuranceSystem } from '@/lib/knowledgeBase/qualityAssurance';
import { SearchRequest } from '@/lib/knowledgeBase/types';

export const knowledgeBaseRouter = router({
  // Search the knowledge base
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1, "Query is required"),
      context: z.object({
        userLocation: z.object({
          latitude: z.number(),
          longitude: z.number()
        }).optional(),
        travelDates: z.object({
          start: z.date(),
          end: z.date()
        }).optional(),
        budget: z.enum(['budget', 'moderate', 'luxury']).optional(),
        interests: z.array(z.enum([
          'adventure', 'culture', 'food', 'history', 'nature',
          'nightlife', 'shopping', 'spiritual', 'art', 'music',
          'architecture', 'beaches', 'mountains', 'urban', 'rural',
        ])).optional(),
        culturalPreferences: z.array(z.enum([
          'traditional', 'modern', 'conservative', 'liberal',
          'religious', 'secular', 'multilingual', 'english-friendly',
        ])).optional(),
        legalConcerns: z.array(z.enum([
          'photography', 'alcohol', 'dress-codes', 'religious-sites',
          'driving', 'medications', 'customs', 'behavior', 'business',
        ])).optional(),
        groupSize: z.number().optional(),
        travelStyle: z.enum(['adventure', 'cultural', 'relaxed', 'business', 'family']).optional()
      }).optional(),
      filters: z.object({
        regions: z.array(z.string()).optional(),
        countries: z.array(z.string()).optional(),
        safetyLevel: z.number().min(1).max(10).optional(),
        languages: z.array(z.string()).optional(),
        maxDistance: z.number().optional(),
        costLevel: z.array(z.enum(['budget', 'moderate', 'expensive'])).optional(),
        climatePreferences: z.array(z.string()).optional(),
        visaFree: z.boolean().optional()
      }).optional(),
      limit: z.number().min(1).max(20).default(10),
      includeRecommendations: z.boolean().default(true)
    }))
    .mutation(async ({ input }) => {
      try {
        // Map context fields to correct types and cast to SearchContext
        let context = input.context;
        if (context) {
          context = {
            ...context,
            interests: context.interests ? context.interests.map(x => x as import('@/lib/knowledgeBase/types').TravelInterest) : undefined,
            culturalPreferences: context.culturalPreferences ? context.culturalPreferences.map(x => x as import('@/lib/knowledgeBase/types').CulturalPreference) : undefined,
            legalConcerns: context.legalConcerns ? context.legalConcerns.map(x => x as import('@/lib/knowledgeBase/types').LegalConcern) : undefined,
          } as import('@/lib/knowledgeBase/types').SearchContext;
        }
        const searchRequest: SearchRequest = {
          query: input.query,
          context,
          filters: input.filters,
          limit: input.limit,
          includeRecommendations: input.includeRecommendations
        };

        const result = await travelKnowledgeBase.search(searchRequest);
        return result;
      } catch (error) {
        console.error('Knowledge base search error:', error);
        throw new Error(error instanceof Error ? error.message : 'Search failed');
      }
    }),

  // Get city by ID
  getCityById: publicProcedure
    .input(z.object({
      cityId: z.string().min(1, "City ID is required")
    }))
    .query(async ({ input }) => {
      try {
        const city = await travelKnowledgeBase.getCityById(input.cityId);
        return city;
      } catch (error) {
        console.error('Error getting city by ID:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to get city');
      }
    }),

  // Add a new city
  addCity: publicProcedure
    .input(z.object({
      cityName: z.string().min(1, "City name is required"),
      country: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const city = await travelKnowledgeBase.addCity(input.cityName, input.country);
        return city;
      } catch (error) {
        console.error('Error adding city:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to add city');
      }
    }),

  // Update an existing city
  updateCity: publicProcedure
    .input(z.object({
      cityId: z.string().min(1, "City ID is required")
    }))
    .mutation(async ({ input }) => {
      try {
        const city = await travelKnowledgeBase.updateCity(input.cityId);
        return city;
      } catch (error) {
        console.error('Error updating city:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update city');
      }
    }),

  // Submit user feedback
  submitFeedback: publicProcedure
    .input(z.object({
      cityId: z.string().min(1, "City ID is required"),
      rating: z.number().min(1).max(5),
      category: z.enum(['accuracy', 'completeness', 'usefulness', 'timeliness']),
      comment: z.string().optional(),
      userId: z.string().default('anonymous')
    }))
    .mutation(async ({ input }) => {
      try {
        await qualityAssuranceSystem.submitUserFeedback(input);
        return { success: true };
      } catch (error) {
        console.error('Error submitting feedback:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to submit feedback');
      }
    }),

  // Get system status
  getSystemStatus: publicProcedure
    .query(async () => {
      try {
        const status = await travelKnowledgeBase.getSystemStatus();
        return status;
      } catch (error) {
        console.error('Error getting system status:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to get system status');
      }
    }),

  // Run manual update
  runManualUpdate: publicProcedure
    .mutation(async () => {
      try {
        const result = await travelKnowledgeBase.runManualUpdate();
        return result;
      } catch (error) {
        console.error('Error running manual update:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to run manual update');
      }
    }),

  // Get quality report
  getQualityReport: publicProcedure
    .query(async () => {
      try {
        const report = await qualityAssuranceSystem.generateQualityReport();
        return report;
      } catch (error) {
        console.error('Error getting quality report:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to get quality report');
      }
    })
});