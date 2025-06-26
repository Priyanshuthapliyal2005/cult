import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { elevenLabsService } from '@/lib/elevenlabs';
import { prisma } from '@/lib/prisma';

export const audioRouter = router({
  // Test ElevenLabs connection
  testElevenLabs: publicProcedure
    .query(async () => {
      return await elevenLabsService.testConnection();
    }),

  // Get available voices
  getVoices: publicProcedure
    .query(async () => {
      try {
        return await elevenLabsService.getVoices();
      } catch (error) {
        console.error('Error fetching voices:', error);
        return [];
      }
    }),

  // Generate audio for a phrase
  generatePhraseAudio: publicProcedure
    .input(z.object({
      text: z.string().min(1, "Text is required"),
      language: z.string().default('en'),
      voiceId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Check cache first (database)
        try {
          const cached = await prisma.audioCache.findUnique({
            where: {
              text_language: {
                text: input.text,
                language: input.language,
              },
            },
          });

          if (cached) {
            return {
              audioUrl: cached.audioUrl,
              cached: true,
            };
          }
        } catch (dbError) {
          console.log('Database not available for audio cache');
        }

        // Generate new audio
        const audioData = await elevenLabsService.generatePhraseAudio(
          input.text,
          input.language,
          input.voiceId
        );

        // Try to cache in database
        try {
          await prisma.audioCache.create({
            data: {
              text: input.text,
              language: input.language,
              audioUrl: audioData,
            },
          });
        } catch (dbError) {
          console.log('Database not available for caching audio');
        }

        return {
          audioUrl: audioData,
          cached: false,
        };
      } catch (error) {
        console.error('Error generating phrase audio:', error);
        throw new Error(
          error instanceof Error 
            ? error.message 
            : 'Failed to generate audio. Please try again.'
        );
      }
    }),

  // Batch generate audio for multiple phrases
  generateBatchAudio: publicProcedure
    .input(z.object({
      phrases: z.array(z.object({
        text: z.string(),
        language: z.string().default('en'),
        voiceId: z.string().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const results = [];

      for (const phrase of input.phrases) {
        try {
          // Check cache first
          let audioData: string | null = null;
          
          try {
            const cached = await prisma.audioCache.findUnique({
              where: {
                text_language: {
                  text: phrase.text,
                  language: phrase.language,
                },
              },
            });
            audioData = cached?.audioUrl || null;
          } catch (dbError) {
            console.log('Database not available for audio cache check');
          }

          // Generate if not cached
          if (!audioData) {
            audioData = await elevenLabsService.generatePhraseAudio(
              phrase.text,
              phrase.language,
              phrase.voiceId
            );

            // Try to cache
            try {
              await prisma.audioCache.create({
                data: {
                  text: phrase.text,
                  language: phrase.language,
                  audioUrl: audioData,
                },
              });
            } catch (dbError) {
              console.log('Database not available for caching batch audio');
            }
          }

          results.push({
            text: phrase.text,
            language: phrase.language,
            audioUrl: audioData,
            success: true,
          });
        } catch (error) {
          console.error(`Error generating audio for "${phrase.text}":`, error);
          results.push({
            text: phrase.text,
            language: phrase.language,
            audioUrl: null,
            success: false,
            error: error instanceof Error ? error.message : 'Generation failed',
          });
        }
      }

      return results;
    }),

  // Clear audio cache
  clearAudioCache: publicProcedure
    .mutation(async () => {
      try {
        const deleted = await prisma.audioCache.deleteMany({});
        return {
          success: true,
          deletedCount: deleted.count,
        };
      } catch (error) {
        console.error('Error clearing audio cache:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to clear cache',
        };
      }
    }),
});