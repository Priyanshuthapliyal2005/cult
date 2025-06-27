import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';
import { hybridAI } from '@/lib/hybridAI';
import { getCulturalDataByLocation, getChatResponse, getAllDestinations } from '@/lib/mockData';
import { audioRouter } from './audio';
import { userRouter } from './user';
import { vectorRouter } from './vector';
import { ragService } from '@/lib/ragService';

// Define explicit types to prevent deep type instantiation
type CulturalInsightData = {
  customs: any;
  laws: any;
  events: any;
  phrases: any;
  recommendations: any;
};

type MessageResponse = {
  conversationId: string;
  response: string;
};

export const appRouter = router({
  // Include audio router
  audio: audioRouter,
  
  // Include user router
  ...userRouter,

  // Include vector router
  vector: vectorRouter,

  // Test endpoint to verify database connection
  testConnection: publicProcedure
    .query(async () => {
      try {
        await prisma.$connect();
        return { status: 'success', message: 'Database connected successfully' };
      } catch (error) {
        console.error('Database connection error:', error);
        return { status: 'error', message: 'Database connection failed - using demo mode' };
      }
    }),

  // Test OpenAI API connection
  testAI: publicProcedure
    .query(async () => {
      try {
        const testResults = await hybridAI.testServices();
        return testResults;
      } catch (error) {
        console.error('AI services test error:', error);
        return { 
          gemini: { status: 'error', message: 'Test failed' },
          groq: { status: 'error', message: 'Test failed' },
          overall: { status: 'error', message: 'AI services test failed' }
        };
      }
    }),

  // Get all sample destinations
  getDestinations: publicProcedure
    .query(async () => {
      return getAllDestinations();
    }),

  getCulturalInsights: publicProcedure
    .input(z.object({
      location: z.string().min(1, "Location is required"),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }): Promise<CulturalInsightData> => {
      try {
        // First try to get mock data
        const mockData = getCulturalDataByLocation(input.location);
        if (mockData) {
          // Store in database if available
          try {
            await prisma.culturalInsight.create({
              data: {
                location: input.location,
                latitude: input.latitude || mockData.latitude,
                longitude: input.longitude || mockData.longitude,
                category: input.category || 'general',
                title: `Cultural Insights for ${input.location}`,
                description: mockData.description,
                content: {
                  customs: mockData.customs,
                  laws: mockData.laws,
                  events: mockData.events,
                  phrases: mockData.phrases,
                  recommendations: mockData.recommendations
                },
                embedding: [],
              },
            });
          } catch (dbError) {
            console.log('Database not available, using mock data only');
          }

          return {
            customs: mockData.customs,
            laws: mockData.laws,
            events: mockData.events,
            phrases: mockData.phrases,
            recommendations: mockData.recommendations
          };
        }

        // Check database cache if mock data not available
        try {
          const cached = await prisma.culturalInsight.findFirst({
            where: {
              location: input.location,
              category: input.category || 'general',
            },
            orderBy: { createdAt: 'desc' },
          });

          if (cached && cached.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            return cached.content as CulturalInsightData;
          }
        } catch (dbError) {
          console.log('Database not available for cache check');
        }

        // Try OpenAI if available
        try {
          const insights = await hybridAI.getCulturalInsights(input);
          
          // Try to store in database
          try {
            await prisma.culturalInsight.create({
              data: {
                location: input.location,
                latitude: input.latitude,
                longitude: input.longitude,
                category: input.category || 'general',
                title: `Cultural Insights for ${input.location}`,
                description: `Comprehensive cultural information for ${input.location}`,
                content: insights as any,
                embedding: [],
              },
            });
          } catch (dbError) {
            console.log('Database not available for storing insights');
          }

          return insights;
        } catch (aiError) {
          console.log('AI services failed, using mock fallback:', aiError);
        }

        // Fallback response
        throw new Error('No cultural data available for this location. Try Pushkar, Rishikesh, or Mussoorie for demo data.');
      } catch (error) {
        console.error('Error in getCulturalInsights:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to get cultural insights');
      }
    }),

  sendMessage: publicProcedure
    .input(z.object({
      conversationId: z.string().optional(),
      message: z.string().min(1, "Message cannot be empty"),
      location: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }))
    .mutation(async ({ input }): Promise<MessageResponse> => {
      try {
        let conversationId = input.conversationId;
        
        // Try to create conversation in database
        if (!conversationId) {
          try {
            const conversation = await prisma.conversation.create({
              data: {
                userId: 'demo-user',
                title: input.message.slice(0, 50),
                location: input.location,
                latitude: input.latitude,
                longitude: input.longitude,
              },
            });
            conversationId = conversation.id;
          } catch (dbError) {
            // Generate a temporary conversation ID if database is not available
            conversationId = 'temp-' + Date.now().toString();
            console.log('Database not available, using temporary conversation ID');
          }
        }

        // Try to save user message
        try {
          await prisma.message.create({
            data: {
              conversationId,
              role: 'user',
              content: input.message,
            },
          });
        } catch (dbError) {
          console.log('Database not available for saving user message');
        }

        let response: string;

        // Get conversation history if database is available
        let chatMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
          { role: 'user', content: input.message }
        ];
        try {
          const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: 10,
          });
          chatMessages = messages.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
          }));
        } catch (dbError) {
          console.log('Database not available for conversation history');
        }

        // Use RAG-enhanced response if available, otherwise fallback to hybrid AI
        try {
          const ragResponse = await ragService.generateRAGResponse({
            query: input.message,
            conversationId,
            location: input.location,
            includeHistory: true,
            maxContext: 3
          });
          
          response = ragResponse.response;
          
          // Add source information if confidence is high
          if (ragResponse.confidence > 0.7 && ragResponse.sources.length > 0) {
            response += `\n\n*Based on ${ragResponse.sources.length} relevant sources from our cultural database.*`;
          }
        } catch (ragError) {
          console.log('RAG service failed, using hybrid AI fallback:', ragError);
          response = await hybridAI.generateChatResponse(chatMessages, {
            location: input.location,
            latitude: input.latitude,
            longitude: input.longitude,
          });
        }

        // Try to save AI response
        try {
          await prisma.message.create({
            data: {
              conversationId,
              role: 'assistant',
              content: response,
            },
          });
        } catch (dbError) {
          console.log('Database not available for saving AI response');
        }

        return {
          conversationId,
          response,
        };
      } catch (error) {
        console.error('Error in sendMessage:', error);
        throw new Error('Failed to send message. Please try again.');
      }
    }),

  getConversations: publicProcedure
    .query(async () => {
      try {
        return await prisma.conversation.findMany({
          where: { userId: 'demo-user' },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 20,
        });
      } catch (error) {
        console.error('Error getting conversations:', error);
        return [];
      }
    }),

  getConversation: publicProcedure
    .input(z.object({ 
      id: z.string().min(1, "Conversation ID is required")
    }))
    .query(async ({ input }) => {
      try {
        return await prisma.conversation.findUnique({
          where: { id: input.id },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });
      } catch (error) {
        console.error('Error getting conversation:', error);
        return null;
      }
    }),
});

export type AppRouter = typeof appRouter;