import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';
import { getCulturalInsights, generateChatResponse } from '@/lib/openai';

export const appRouter = router({
  // Test endpoint to verify database connection
  testConnection: publicProcedure
    .query(async () => {
      try {
        await prisma.$connect();
        return { status: 'success', message: 'Database connected successfully' };
      } catch (error) {
        console.error('Database connection error:', error);
        return { status: 'error', message: 'Database connection failed' };
      }
    }),

  // Test OpenAI API connection
  testOpenAI: publicProcedure
    .query(async () => {
      try {
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
          status: 'error', 
          message: 'OpenAI API connection failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
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
        // Check if we have cached insights
        const cached = await prisma.culturalInsight.findFirst({
          where: {
            location: input.location,
            category: input.category || 'general',
          },
          orderBy: { createdAt: 'desc' },
        });

        // Return cached if less than 24 hours old
        if (cached && cached.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          return cached.content;
        }

        const insights = await getCulturalInsights(input);
        
        // Store insights in database for caching
        await prisma.culturalInsight.create({
          data: {
            location: input.location,
            latitude: input.latitude,
            longitude: input.longitude,
            category: input.category || 'general',
            title: `Cultural Insights for ${input.location}`,
            description: `Comprehensive cultural information for ${input.location}`,
            content: insights,
            embedding: [], // Vector embedding would be generated here
          },
        });

        return insights;
      } catch (error) {
        console.error('Error in getCulturalInsights:', error);
        throw new Error('Failed to get cultural insights. Please try again.');
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
        
        // Create new conversation if none exists
        if (!conversationId) {
          const conversation = await prisma.conversation.create({
            data: {
              userId: 'demo-user', // Demo user for testing
              title: input.message.slice(0, 50),
              location: input.location,
              latitude: input.latitude,
              longitude: input.longitude,
            },
          });
          conversationId = conversation.id;
        }

        // Save user message
        await prisma.message.create({
          data: {
            conversationId,
            role: 'user',
            content: input.message,
          },
        });

        // Get conversation history (last 10 messages for context)
        const messages = await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          take: 10,
        });

        // Generate AI response
        const chatMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await generateChatResponse(chatMessages, {
          location: input.location,
          latitude: input.latitude,
          longitude: input.longitude,
        });

        // Save AI response
        await prisma.message.create({
          data: {
            conversationId,
            role: 'assistant',
            content: response,
          },
        });

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
          where: { userId: 'demo-user' }, // Demo user for testing
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