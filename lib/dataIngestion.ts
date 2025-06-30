import { vectorStore, ContentToStore } from '@/lib/vectorStore';
import { cityDatabase } from '@/lib/cityDatabase';
import { prisma } from './prisma';
import { embeddingService } from './embeddings';

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

      // Process each city from the real database
      for (const city of cityDatabase) {
        try {
          // 1. Destination overview
          contentToStore.push({
            contentId: `dest_${city.id}`,
            contentType: 'destination',
            title: `${city.name} - Cultural Overview`,
            content: `${city.description}\n\nMain Attractions: ${city.mainAttractions.join(', ')}\n\nLocal Cuisine: ${city.localCuisine.join(', ')}\n\nCulture: ${city.culture}`,
            metadata: {
              location: city.name,
              country: city.country,
              region: city.region,
              culture: city.culture,
              rating: city.rating,
              costLevel: city.costLevel,
              languages: city.language,
              coordinates: {
                latitude: city.latitude,
                longitude: city.longitude
              }
            }
          });

          // 2. General customs and etiquette
          contentToStore.push({
            contentId: `customs_${city.id}`,
            contentType: 'customs',
            title: `${city.name} - Cultural Customs & Etiquette`,
            content: `Cultural guidelines for ${city.name}:\n\nGeneral etiquette:\n• Respect local customs and traditions\n• Dress appropriately for cultural sites\n• Learn basic greetings in ${city.language[0]}\n• Be mindful of local religious practices\n• Support local businesses and artisans`,
            metadata: {
              location: city.name,
              country: city.country,
              category: 'customs',
              type: 'etiquette_guide'
            }
          });

          // 3. Travel information
          contentToStore.push({
            contentId: `travel_${city.id}`,
            contentType: 'travel',
            title: `${city.name} - Travel Information`,
            content: `Travel guide for ${city.name}:\n\nBest time to visit: ${city.bestTimeToVisit.join(', ')}\nAverage stay: ${city.averageStay} days\nBudget level: ${city.costLevel}\nSafety rating: ${city.safetyRating}/10\nTourist friendly: ${city.touristFriendly}/10\n\nTransportation: ${city.transportOptions.join(', ')}\nTimezone: ${city.timezone}`,
            metadata: {
              location: city.name,
              category: 'travel',
              costLevel: city.costLevel,
              bestMonths: city.bestTimeToVisit
            }
          });

          // 4. Language information
          contentToStore.push({
            contentId: `language_${city.id}`,
            contentType: 'phrases',
            title: `${city.name} - Language Information`,
            content: `Languages spoken in ${city.name}: ${city.language.join(', ')}\n\nEssential phrases:\n• Hello: Namaste (nah-mas-tay)\n• Thank you: Dhanyawad (dhan-ya-waad)\n• Please: Kripaya (kri-pa-ya)\n• Excuse me: Maaf kijiye (maaf ki-ji-ye)\n• How much?: Kitna hai? (kit-na hai)`,
            metadata: {
              location: city.name,
              category: 'language',
              languages: city.language,
              currency: city.currency
            }
          });

          // 5. Food and dining
          contentToStore.push({
            contentId: `food_${city.id}`,
            contentType: 'restaurants',
            title: `${city.name} - Food & Dining`,
            content: `Local cuisine in ${city.name}:\n\nSignature dishes: ${city.localCuisine.join(', ')}\n\nDining tips:\n• Try local street food for authentic flavors\n• Ask locals for restaurant recommendations\n• Be adventurous with regional specialties\n• Respect dietary customs and restrictions`,
            metadata: {
              location: city.name,
              category: 'dining',
              localCuisine: city.localCuisine,
              costLevel: city.costLevel
            }
          });

          // 6. Attractions and sightseeing
          contentToStore.push({
            contentId: `attractions_${city.id}`,
            contentType: 'attractions',
            title: `${city.name} - Main Attractions`,
            content: `Top attractions in ${city.name}:\n\n${city.mainAttractions.map((attraction, index) => `${index + 1}. ${attraction}`).join('\n')}\n\nGeneral visiting tips:\n• Check opening hours and entry requirements\n• Respect photography restrictions\n• Hire local guides for deeper cultural understanding\n• Visit during off-peak hours for better experience`,
            metadata: {
              location: city.name,
              category: 'attractions',
              attractionCount: city.mainAttractions.length,
              culture: city.culture
            }
          });


        } catch (error) {
          const errorMsg = `Error processing ${city.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
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