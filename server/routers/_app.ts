import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';
import { getCulturalInsights, generateChatResponse } from '@/lib/openai';

export const appRouter = router({
  getCulturalInsights: publicProcedure
    .input(z.object({
      location: z.string(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
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
        throw error;
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
              userId: 'temp-user', // Would be actual user ID in production
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

        // Get conversation history
        const messages = await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          take: 20,
        });

        // Generate AI response
        const chatMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await generateChatResponse(chatMessages);

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
        throw error;
      }
    }),

  getConversations: publicProcedure
    .query(async () => {
      return await prisma.conversation.findMany({
        where: { userId: 'temp-user' }, // Would be actual user ID
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }),

  getConversation: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.conversation.findUnique({
        where: { id: input.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }),
});

export type AppRouter = typeof appRouter;