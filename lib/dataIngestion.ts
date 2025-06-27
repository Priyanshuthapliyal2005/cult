import { vectorStore, ContentToStore } from '@/lib/vectorStore';
import { sampleDestinations } from '@/lib/mockData';

export interface IngestionResult {
  success: boolean;
  processed: number;
  errors: string[];
  contentIds: string[];
}

export class DataIngestionService {
  constructor() {}

  async ingestCulturalData(): Promise<IngestionResult> {
    const result: IngestionResult = {
      success: true,
      processed: 0,
      errors: [],
      contentIds: []
    };

    try {
      console.log('🚀 Starting cultural data ingestion...');

      const contentToStore: ContentToStore[] = [];

      // Process each destination
      for (const destination of sampleDestinations) {
        try {
          // 1. Destination overview
          contentToStore.push({
            contentId: `dest_${destination.location.toLowerCase().replace(/\s+/g, '_')}`,
            contentType: 'destination',
            title: `${destination.location} - Cultural Overview`,
            content: `${destination.description}\n\n${destination.insights}\n\nHighlights: ${destination.highlights.join(', ')}`,
            metadata: {
              location: destination.location,
              country: destination.country,
              region: destination.region,
              culture: destination.culture,
              rating: destination.rating,
              coordinates: {
                latitude: destination.latitude,
                longitude: destination.longitude
              }
            }
          });

          // 2. Customs and etiquette
          contentToStore.push({
            contentId: `customs_${destination.location.toLowerCase().replace(/\s+/g, '_')}`,
            contentType: 'customs',
            title: `${destination.location} - ${destination.customs.title}`,
            content: `${destination.customs.description}\n\nDO's:\n${destination.customs.dos.map(item => `• ${item}`).join('\n')}\n\nDON'Ts:\n${destination.customs.donts.map(item => `• ${item}`).join('\n')}`,
            metadata: {
              location: destination.location,
              category: 'customs',
              type: 'etiquette_guide'
            }
          });

          // 3. Events and festivals
          contentToStore.push({
            contentId: `events_${destination.location.toLowerCase().replace(/\s+/g, '_')}`,
            contentType: 'events',
            title: `${destination.location} - Cultural Events & Festivals`,
            content: `Current Events:\n${destination.events.current_events.map(event => `• ${event.name} (${event.date}): ${event.description}`).join('\n')}\n\nSeasonal Festivals:\n${destination.events.seasonal_festivals.map(festival => `• ${festival.name} (${festival.season}): ${festival.description}`).join('\n')}`,
            metadata: {
              location: destination.location,
              category: 'events',
              events: destination.events.current_events.map(e => e.name),
              festivals: destination.events.seasonal_festivals.map(f => f.name)
            }
          });

          // 4. Essential phrases
          contentToStore.push({
            contentId: `phrases_${destination.location.toLowerCase().replace(/\s+/g, '_')}`,
            contentType: 'phrases',
            title: `${destination.location} - Essential Phrases`,
            content: destination.phrases.essential_phrases.map(phrase => 
              `${phrase.english}: ${phrase.local} (${phrase.pronunciation})`
            ).join('\n'),
            metadata: {
              location: destination.location,
              category: 'language',
              phrase_count: destination.phrases.essential_phrases.length,
              languages: ['Hindi', 'English']
            }
          });

          // 5. Restaurant recommendations
          contentToStore.push({
            contentId: `restaurants_${destination.location.toLowerCase().replace(/\s+/g, '_')}`,
            contentType: 'restaurants',
            title: `${destination.location} - Restaurant Recommendations`,
            content: destination.recommendations.restaurants.map(restaurant =>
              `${restaurant.name} (${restaurant.type}): ${restaurant.description}`
            ).join('\n\n'),
            metadata: {
              location: destination.location,
              category: 'dining',
              restaurant_count: destination.recommendations.restaurants.length,
              cuisines: [...new Set(destination.recommendations.restaurants.map(r => r.type))]
            }
          });

          // 6. Attractions
          contentToStore.push({
            contentId: `attractions_${destination.location.toLowerCase().replace(/\s+/g, '_')}`,
            contentType: 'attractions',
            title: `${destination.location} - Cultural Attractions`,
            content: destination.recommendations.attractions.map(attraction =>
              `${attraction.name} (${attraction.type}): ${attraction.description}`
            ).join('\n\n'),
            metadata: {
              location: destination.location,
              category: 'attractions',
              attraction_count: destination.recommendations.attractions.length,
              types: [...new Set(destination.recommendations.attractions.map(a => a.type))]
            }
          });

          // 7. Local tips
          contentToStore.push({
            contentId: `tips_${destination.location.toLowerCase().replace(/\s+/g, '_')}`,
            contentType: 'tips',
            title: `${destination.location} - Local Tips`,
            content: destination.recommendations.local_tips.join('\n\n'),
            metadata: {
              location: destination.location,
              category: 'tips',
              tip_count: destination.recommendations.local_tips.length
            }
          });

        } catch (error) {
          const errorMsg = `Error processing ${destination.location}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          result.errors.push(errorMsg);
        }
      }

      console.log(`📦 Prepared ${contentToStore.length} content items for ingestion`);

      // Store content in batches
      const storedIds = await vectorStore.storeBatchContent(contentToStore);
      
      result.contentIds = storedIds.filter(id => id !== '');
      result.processed = result.contentIds.length;

      if (result.processed < contentToStore.length) {
        result.success = false;
        result.errors.push(`Only ${result.processed} of ${contentToStore.length} items were successfully stored`);
      }

      console.log(`✅ Cultural data ingestion completed: ${result.processed} items processed`);
      
      return result;
    } catch (error) {
      console.error('Critical error during ingestion:', error);
      result.success = false;
      result.errors.push(`Critical ingestion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  async ingestCustomContent(contents: ContentToStore[]): Promise<IngestionResult> {
    const result: IngestionResult = {
      success: true,
      processed: 0,
      errors: [],
      contentIds: []
    };

    try {
      console.log(`🚀 Starting custom content ingestion for ${contents.length} items...`);

      const storedIds = await vectorStore.storeBatchContent(contents);
      
      result.contentIds = storedIds.filter(id => id !== '');
      result.processed = result.contentIds.length;

      if (result.processed < contents.length) {
        result.success = false;
        result.errors.push(`Only ${result.processed} of ${contents.length} items were successfully stored`);
      }

      console.log(`✅ Custom content ingestion completed: ${result.processed} items processed`);
      
      return result;
    } catch (error) {
      console.error('Error during custom content ingestion:', error);
      result.success = false;
      result.errors.push(`Ingestion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  async clearAllContent(): Promise<{ success: boolean; deletedCount: number }> {
    try {
      console.log('🗑️ Clearing all vector content...');
      
      const deletedCount = await prisma.vectorContent.deleteMany({});
      
      console.log(`✅ Cleared ${deletedCount.count} vector content items`);
      
      return {
        success: true,
        deletedCount: deletedCount.count
      };
    } catch (error) {
      console.error('Error clearing content:', error);
      return {
        success: false,
        deletedCount: 0
      };
    }
  }

  async getIngestionStatus(): Promise<{
    contentStats: {
      totalContent: number;
      contentTypes: Record<string, number>;
      recentContent: number;
    };
    lastIngestion?: Date;
    systemHealth: {
      vectorStore: boolean;
      embeddings: boolean;
    };
  }> {
    try {
      const [contentStats, systemHealth] = await Promise.all([
        vectorStore.getContentStats(),
        this.checkSystemHealth()
      ]);

      // Get last ingestion time (most recent content creation)
      const lastContent = await prisma.vectorContent.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      return {
        contentStats,
        lastIngestion: lastContent?.createdAt,
        systemHealth
      };
    } catch (error) {
      console.error('Error getting ingestion status:', error);
      return {
        contentStats: {
          totalContent: 0,
          contentTypes: {},
          recentContent: 0
        },
        systemHealth: {
          vectorStore: false,
          embeddings: false
        }
      };
    }
  }

  private async checkSystemHealth(): Promise<{
    vectorStore: boolean;
    embeddings: boolean;
  }> {
    const health = {
      vectorStore: false,
      embeddings: false
    };

    try {
      // Test vector store
      await prisma.vectorContent.findFirst();
      health.vectorStore = true;
    } catch (error) {
      console.error('Vector store health check failed:', error);
    }

    try {
      // Test embeddings service
      const embeddingTest = await embeddingService.testConnection();
      health.embeddings = embeddingTest.status === 'success';
    } catch (error) {
      console.error('Embeddings health check failed:', error);
    }

    return health;
  }
}

// Singleton instance
export const dataIngestionService = new DataIngestionService();