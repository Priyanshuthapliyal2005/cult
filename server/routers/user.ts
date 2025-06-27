import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';

export const userRouter = {
  updateProfile: publicProcedure
    .input(z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email format'),
      languages: z.array(z.string()).default([]),
      interests: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input }) => {
      try {
        // For demo purposes, we'll use a fixed user ID
        // In a real app, this would come from the session
        const userId = 'demo-user';
        
        const updatedUser = await prisma.user.upsert({
          where: { id: userId },
          update: {
            name: input.name,
            email: input.email,
            languages: input.languages,
            interests: input.interests,
          },
          create: {
            id: userId,
            email: input.email,
            name: input.name,
            languages: input.languages,
            interests: input.interests,
          },
        });

        return updatedUser;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile');
      }
    }),

  getUserStats: publicProcedure
    .query(async () => {
      try {
        const userId = 'demo-user';
        
        const [conversationCount, destinationsVisited] = await Promise.all([
          prisma.conversation.count({
            where: { userId },
          }),
          prisma.conversation.count({
            where: { userId, location: { not: null } },
            distinct: ['location'],
          }),
        ]);

        return {
          conversationCount,
          destinationsVisited,
        };
      } catch (error) {
        console.error('Error getting user stats:', error);
        return {
          conversationCount: 0,
          destinationsVisited: 0,
        };
      }
    }),

  getFavorites: publicProcedure
    .query(async () => {
      try {
        const userId = 'demo-user';
        
        const favorites = await prisma.favorite.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        return favorites;
      } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
      }
    }),

  addFavorite: publicProcedure
    .input(z.object({
      type: z.string(),
      referenceId: z.string(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const userId = 'demo-user';
        
        const favorite = await prisma.favorite.create({
          data: {
            userId,
            type: input.type,
            referenceId: input.referenceId,
            metadata: input.metadata || {},
          },
        });

        return favorite;
      } catch (error) {
        console.error('Error adding favorite:', error);
        throw new Error('Failed to add favorite');
      }
    }),

  removeFavorite: publicProcedure
    .input(z.object({
      type: z.string(),
      referenceId: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const userId = 'demo-user';
        
        await prisma.favorite.delete({
          where: {
            userId_type_referenceId: {
              userId,
              type: input.type,
              referenceId: input.referenceId,
            },
          },
        });

        return { success: true };
      } catch (error) {
        console.error('Error removing favorite:', error);
        throw new Error('Failed to remove favorite');
      }
    }),
};