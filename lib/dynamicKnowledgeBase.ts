import { embeddingService } from './embeddings';
import { hybridAI } from './hybridAI';
import { mockChromeDb } from './mockChromeDb'; // Import mock ChromaDB

export interface KnowledgeBaseEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  location?: string;
  country?: string;
  coordinates?: { latitude: number; longitude: number };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchOptions {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  includeRawContent?: boolean;
}

export interface KnowledgeBaseStats {
  totalEntries: number;
  entriesByType: Record<string, number>;
  recentEntries: number;
  collections: string[];
}

// Collection names in ChromaDB
const COLLECTIONS = {
  DESTINATIONS: 'destinations',
  CULTURAL_INSIGHTS: 'cultural_insights',
  PHRASES: 'phrases',
  CUSTOMS: 'customs',
  LAWS: 'laws',
  EVENTS: 'events'
};

export class DynamicKnowledgeBase {
  constructor() {}

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Dynamic Knowledge Base...');
      const connected = await mockChromeDb.connect();
      
      if (connected) {
        // Ensure collections exist
        await Promise.all(
          Object.values(COLLECTIONS).map(name => 
            mockChromeDb.getOrCreateCollection(name)
          )
        );
        console.log('✅ Dynamic Knowledge Base initialized successfully');
      }
      
      return connected;
    } catch (error) {
      console.error('❌ Failed to initialize Dynamic Knowledge Base:', error);
      return false;
    }
  }

  async addDestination(destinationData: {
    name: string;
    country: string;
    region?: string;
    description: string;
    coordinates?: { latitude: number; longitude: number };
    metadata?: Record<string, any>;
  }): Promise<string> {
    try {
      const id = `destination_${destinationData.name.toLowerCase().replace(/\s+/g, '_')}_${destinationData.country.toLowerCase().replace(/\s+/g, '_')}`;
      
      // Generate document text
      const document = `
        Destination: ${destinationData.name}, ${destinationData.country}
        ${destinationData.region ? `Region: ${destinationData.region}` : ''}
        
        ${destinationData.description}
        
        ${Object.entries(destinationData.metadata || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}
      `.trim();
      
      // Add to ChromaDB
      await mockChromeDb.addDocuments(COLLECTIONS.DESTINATIONS, [{
        id,
        document,
        metadata: {
          type: 'destination',
          name: destinationData.name,
          country: destinationData.country,
          region: destinationData.region || '',
          ...destinationData.metadata,
          coordinates: destinationData.coordinates ? 
            `${destinationData.coordinates.latitude},${destinationData.coordinates.longitude}` : '',
          createdAt: new Date().toISOString()
        }
      }]);
      
      return id;
    } catch (error) {
      console.error('Error adding destination:', error);
      throw new Error(`Failed to add destination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addCulturalInsight(insightData: {
    destinationName: string;
    country: string;
    insightType: 'custom' | 'law' | 'phrase' | 'event';
    title: string;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    try {
      // Generate unique ID
      const timestamp = Date.now();
      const id = `${insightData.insightType}_${insightData.destinationName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;
      
      // Determine collection
      let collection: string;
      switch (insightData.insightType) {
        case 'law':
          collection = COLLECTIONS.LAWS;
          break;
        case 'phrase':
          collection = COLLECTIONS.PHRASES;
          break;
        case 'event':
          collection = COLLECTIONS.EVENTS;
          break;
        default:
          collection = COLLECTIONS.CULTURAL_INSIGHTS;
      }
      
      // Add to ChromaDB
      await mockChromeDb.addDocuments(collection, [{
        id,
        document: insightData.content,
        metadata: {
          type: insightData.insightType,
          destination: insightData.destinationName,
          country: insightData.country,
          title: insightData.title,
          ...insightData.metadata,
          createdAt: new Date().toISOString()
        }
      }]);
      
      return id;
    } catch (error) {
      console.error('Error adding cultural insight:', error);
      throw new Error(`Failed to add cultural insight: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchKnowledgeBase(options: SearchOptions): Promise<KnowledgeBaseEntry[]> {
    try {
      // Search across all relevant collections
      const collectionsToSearch = Object.values(COLLECTIONS);
      
      const results: KnowledgeBaseEntry[] = [];
      
      // Search each collection in parallel
      const searchPromises = collectionsToSearch.map(async (collection) => {
        const collectionResults = await mockChromeDb.queryCollection(
          collection,
          options.query,
          {
            limit: options.limit || 5,
            filters: options.filters || {},
            includeMetadata: true,
            includeDocuments: true
          }
        );
        
        // Transform to standard format
        collectionResults.forEach((result: any) => {
          results.push({
            id: result.id,
            type: result.metadata.type || collection,
            title: result.metadata.title || 'Untitled',
            content: result.content,
            location: result.metadata.destination || result.metadata.location || result.metadata.name,
            country: result.metadata.country,
            coordinates: result.metadata.coordinates ? this.parseCoordinates(result.metadata.coordinates) : undefined,
            metadata: result.metadata,
            createdAt: new Date(result.metadata.createdAt || Date.now()),
            updatedAt: new Date(result.metadata.updatedAt || result.metadata.createdAt || Date.now())
          });
        });
      });
      
      await Promise.all(searchPromises);
      
      // Sort by relevance (similarity score)
      return results.sort((a, b) => 
        (b.metadata.similarity || 0) - (a.metadata.similarity || 0)
      );
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStats(): Promise<KnowledgeBaseStats> {
    try {
      const collections = await mockChromeDb.listCollections();
      
      // In demo mode, we'll return mock stats
      const mockEntriesByType: Record<string, number> = {
        'cultural_insights': 28,
        'destinations': 12,
        'laws': 15,
        'phrases': 40,
        'customs': 22,
        'events': 8
      };
      
      // Add up total entries
      const totalEntries = Object.values(mockEntriesByType).reduce((a, b) => a + b, 0);
      
      // Assume about 10% are recent
      const recentEntries = Math.round(totalEntries * 0.1);
      
      return {
        totalEntries,
        entriesByType: mockEntriesByType,
        recentEntries,
        collections
      };
    } catch (error) {
      console.error('Error getting knowledge base stats:', error);
      return {
        totalEntries: 0,
        entriesByType: {},
        recentEntries: 0,
        collections: []
      };
    }
  }

  async generateDestinationContent(destinationName: string, country?: string): Promise<{
    description: string;
    culturalHighlights: string[];
    customsAndEtiquette: string[];
    localLaws: string[];
    essentialPhrases: Array<{ english: string, local: string, pronunciation: string }>;
  }> {
    try {
      // Generate comprehensive destination data using AI
      const prompt = `
        Generate comprehensive, accurate information about ${destinationName}${country ? `, ${country}` : ''}.
        
        Structure your response as a JSON object with these fields:
        {
          "description": "A 2-3 paragraph cultural overview",
          "culturalHighlights": ["5-8 cultural highlights as bullet points"],
          "customsAndEtiquette": ["5-8 customs and etiquette guidelines"],
          "localLaws": ["5-8 important local laws and regulations"],
          "essentialPhrases": [
            {
              "english": "Hello",
              "local": "Local language equivalent",
              "pronunciation": "Phonetic pronunciation"
            },
            // 5-8 essential phrases
          ]
        }
        
        Focus on accuracy, cultural sensitivity, and practical value for travelers.
      `;
      
      const response = await hybridAI.generateChatResponse([
        { role: 'user', content: prompt }
      ]);
      
      // Parse the JSON response
      try {
        // Extract JSON from response
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                          response.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[0].replace(/```json\s*|\s*```/g, '');
          return JSON.parse(jsonStr);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        
        // Return fallback data
        return {
          description: `${destinationName} is a fascinating destination with rich cultural heritage.`,
          culturalHighlights: ["Vibrant local traditions", "Unique architectural style", "Rich culinary history"],
          customsAndEtiquette: ["Respect local customs", "Dress appropriately", "Use common courtesy"],
          localLaws: ["Follow local regulations", "Observe public behavior rules", "Respect private property"],
          essentialPhrases: [
            {
              english: "Hello",
              local: "Hello",
              pronunciation: "Hello"
            },
            {
              english: "Thank you",
              local: "Thank you",
              pronunciation: "Thank you"
            }
          ]
        };
      }
    } catch (error) {
      console.error('Error generating destination content:', error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async importFromExternalSource(source: {
    type: 'wikipedia' | 'tourism_api' | 'custom';
    data: any;
    mapping: Record<string, string>;
  }): Promise<string[]> {
    try {
      // Mock method - in a real app, this would process different data sources
      return ["mock-id-1", "mock-id-2"];
    } catch (error) {
      console.error('Error importing from external source:', error);
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to parse coordinates string from ChromaDB
  private parseCoordinates(coordinatesStr: string): { latitude: number; longitude: number } | undefined {
    try {
      const [latStr, lngStr] = coordinatesStr.split(',');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      
      if (isNaN(lat) || isNaN(lng)) {
        return undefined;
      }
      
      return {
        latitude: lat,
        longitude: lng
      };
    } catch (error) {
      return undefined;
    }
  }
}

// Singleton instance
export const dynamicKnowledgeBase = new DynamicKnowledgeBase();