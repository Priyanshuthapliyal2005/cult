import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';
import { hybridAI } from '@/lib/hybridAI';
import { cityDatabase, getCityById } from '@/lib/cityDatabase';
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
      return cityDatabase;
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
        // Get data from city database
        const city = cityDatabase.find(c => 
          c.name.toLowerCase().includes(input.location.toLowerCase())
        );

        // If we found a city in the database, use it
        if (city) {
          try {
            await prisma.culturalInsight.create({
              data: {
                location: city.name,
                latitude: input.latitude || city.latitude,
                longitude: input.longitude || city.longitude,
                category: input.category || 'general',
                title: `Cultural Insights for ${city.name}`,
                description: city.description,
                content: {
                  customs: {
                    title: "Local Customs & Etiquette",
                    description: `Experience the rich culture of ${city.name} respectfully`,
                    dos: ["Respect local customs", "Dress appropriately", "Learn basic greetings"],
                    donts: ["Don't ignore local traditions", "Avoid inappropriate behavior", "Don't be disrespectful"]
                  },
                  laws: {
                    title: "Important Laws & Regulations",
                    important_regulations: ["Follow local laws", "Respect cultural sites", "Obtain necessary permits"],
                    legal_considerations: ["Carry valid ID", "Respect property rights", "Follow local guidelines"]
                  },
                  events: {
                    title: "Cultural Events & Festivals",
                    current_events: [],
                    seasonal_festivals: []
                  },
                  phrases: {
                    title: "Essential Phrases",
                    essential_phrases: [
                      { english: "Hello", local: "नमस्ते", pronunciation: "Namaste" },
                      { english: "Thank you", local: "धन्यवाद", pronunciation: "Dhanyawad" },
                      { english: "Please", local: "कृपया", pronunciation: "Kripaya" }
                    ]
                  },
                  recommendations: {
                    title: "Local Recommendations",
                    restaurants: [],
                    attractions: city.mainAttractions.map(attraction => ({
                      name: attraction,
                      type: "Cultural Site",
                      description: `Must-visit attraction in ${city.name}`
                    })),
                    local_tips: [`Best time to visit: ${city.bestTimeToVisit.slice(0, 3).join(', ')}`, `Budget level: ${city.costLevel}`]
                  }
                },
                embedding: [],
              },
            });
          } catch (dbError) {
            console.log('Database not available, using city data only');
          }

          return {
            customs: {
              title: "Local Customs & Etiquette",
              description: `Experience the rich culture of ${city.name} respectfully`,
              dos: ["Respect local customs", "Dress appropriately", "Learn basic greetings"],
              donts: ["Don't ignore local traditions", "Avoid inappropriate behavior", "Don't be disrespectful"]
            },
            laws: {
              title: "Important Laws & Regulations",
              important_regulations: ["Follow local laws", "Respect cultural sites", "Obtain necessary permits"],
              legal_considerations: ["Carry valid ID", "Respect property rights", "Follow local guidelines"]
            },
            events: {
              title: "Cultural Events & Festivals",
              current_events: [],
              seasonal_festivals: []
            },
            phrases: {
              title: "Essential Phrases",
              essential_phrases: [
                { english: "Hello", local: "नमस्ते", pronunciation: "Namaste" },
                { english: "Thank you", local: "धन्यवाद", pronunciation: "Dhanyawad" },
                { english: "Please", local: "कृपया", pronunciation: "Kripaya" }
              ]
            },
            recommendations: {
              title: "Local Recommendations",
              restaurants: [],
              attractions: city.mainAttractions.map(attraction => ({
                name: attraction,
                type: "Cultural Site",
                description: `Must-visit attraction in ${city.name}`
              })),
              local_tips: [`Best time to visit: ${city.bestTimeToVisit.slice(0, 3).join(', ')}`, `Budget level: ${city.costLevel}`]
            }
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
        throw new Error(`No cultural data available for "${input.location}". Try searching from our database of 1000+ cities worldwide, including major destinations like Delhi, Mumbai, Tokyo, Paris, New York, London, and many more.`);
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
        
        // Provide a helpful fallback response based on the city database
        const availableCities = cityDatabase.slice(0, 5).map(city => city.name).join(', ');
        const fallbackResponse = `I apologize for the technical difficulty. I can help you with cultural insights about many destinations including ${availableCities} and many more. What specific cultural question can I assist you with?`;
        
        return {
          conversationId: conversationId || 'temp-' + Date.now().toString(),
          response: fallbackResponse,
        };
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