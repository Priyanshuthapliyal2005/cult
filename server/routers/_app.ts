import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';
import { getCulturalInsights, generateChatResponse } from '@/lib/openai';
import { getCulturalDataByLocation, getChatResponse, getAllDestinations } from '@/lib/mockData';

export const appRouter = router({
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
  testOpenAI: publicProcedure
    .query(async () => {
      try {
        if (!process.env.OPENAI_API_KEY) {
          return { 
            status: 'demo', 
            message: 'OpenAI API not configured - using demo responses',
            response: 'Demo mode active'
          };
        }
        const response = await generateChatResponse([
          { role: 'user', content: 'Hello, this is a test message.' }
        ]);
        return { 
          status: 'success', 
          message: 'OpenAI API connected successfully',
          response: response.substring(0, 100) + '...'
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        return { 
          status: 'demo', 
          message: 'OpenAI API connection failed - using demo responses',
          error: error instanceof Error ? error.message : 'Unknown error'
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
      location: z.string(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
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
            return cached.content;
          }
        } catch (dbError) {
          console.log('Database not available for cache check');
        }

        // Try OpenAI if available
        if (process.env.OPENAI_API_KEY) {
          const insights = await getCulturalInsights(input);
          
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
                content: insights,
                embedding: [],
              },
            });
          } catch (dbError) {
            console.log('Database not available for storing insights');
          }

          return insights;
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
      message: z.string(),
      location: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
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

        // Try OpenAI first, then fallback to mock responses
        if (process.env.OPENAI_API_KEY) {
          try {
            // Get conversation history if database is available
            let chatMessages = [{ role: 'user', content: input.message }];
            try {
              const messages = await prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
                take: 10,
              });
              chatMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
              }));
            } catch (dbError) {
              console.log('Database not available for conversation history');
            }

            response = await generateChatResponse(chatMessages, {
              location: input.location,
              latitude: input.latitude,
              longitude: input.longitude,
            });
          } catch (aiError) {
            console.log('OpenAI not available, using mock response');
            response = getChatResponse(input.message, input.location);
          }
        } else {
          response = getChatResponse(input.message, input.location);
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
    .input(z.object({ id: z.string() }))
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