import { chromaDb, ChromaDocument } from './chromaDb';
import { embeddingService } from './embeddings';
import { hybridAI } from './hybridAI';

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
      const connected = await chromaDb.connect();
      
      if (connected) {
        // Ensure collections exist
        await Promise.all(
          Object.values(COLLECTIONS).map(name => 
            chromaDb.getOrCreateCollection(name)
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
      await chromaDb.addDocuments(COLLECTIONS.DESTINATIONS, [{
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
      await chromaDb.addDocuments(collection, [{
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
        const collectionResults = await chromaDb.queryCollection(
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
      const collections = await chromaDb.listCollections();
      
      // Get stats for each collection
      const statsPromises = collections.map(async (collection) => {
        return await chromaDb.getCollectionStats(collection);
      });
      
      const collectionStats = await Promise.all(statsPromises);
      
      // Aggregate stats
      let totalEntries = 0;
      const entriesByType: Record<string, number> = {};
      
      collections.forEach((collection, index) => {
        const stats = collectionStats[index];
        totalEntries += stats.documentCount;
        entriesByType[collection] = stats.documentCount;
      });
      
      // Count recently added entries (last 7 days)
      // Note: This would ideally use a database query, but for ChromaDB we'd need
      // to fetch all entries and filter by creation date, which isn't efficient
      // This is a simplified version that just estimates recent entries
      const recentEntries = Math.round(totalEntries * 0.1); // Estimate 10% as recent
      
      return {
        totalEntries,
        entriesByType,
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
        throw new Error('Invalid response format from AI service');
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
      // This would be expanded to handle different sources and mapping schemes
      const documents: ChromaDocument[] = [];
      
      if (source.type === 'wikipedia') {
        // Process Wikipedia data
        const { title, extract, coordinates } = source.data;
        
        documents.push({
          id: `wikipedia_${title.toLowerCase().replace(/\s+/g, '_')}`,
          document: extract,
          metadata: {
            type: 'destination',
            source: 'wikipedia',
            name: title,
            coordinates: coordinates ? `${coordinates.lat},${coordinates.lon}` : '',
            createdAt: new Date().toISOString()
          }
        });
      } else if (source.type === 'custom') {
        // Process custom data
        const { entries } = source.data;
        
        entries.forEach((entry: any, index: number) => {
          documents.push({
            id: `custom_${Date.now()}_${index}`,
            document: entry.content,
            metadata: {
              type: entry.type || 'custom',
              title: entry.title || 'Untitled',
              ...entry.metadata,
              createdAt: new Date().toISOString()
            }
          });
        });
      }
      
      // Add to appropriate collection
      if (documents.length > 0) {
        const targetCollection = source.type === 'wikipedia' ? 
          COLLECTIONS.DESTINATIONS : COLLECTIONS.CULTURAL_INSIGHTS;
        
        const ids = await chromaDb.addDocuments(targetCollection, documents);
        return ids;
      }
      
      return [];
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