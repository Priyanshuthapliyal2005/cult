import { embeddingService } from './embeddings';
import { vectorStore } from './vectorStore';
import { groqService } from './groq';
import { prisma } from './prisma';
import { CityData } from './cityDatabase';

export interface WikipediaData {
  title: string;
  extract: string;
  coordinates?: { lat: number; lon: number };
  pageUrl: string;
  thumbnail?: string;
}

export interface ExternalCityData {
  wikipedia: WikipediaData | null;
  weatherData?: any;
  timeZone?: string;
  population?: number;
  country?: string;
  region?: string;
}

export class DynamicCityService {
  
  /**
   * Search for a city - first check local DB, then fetch from external sources
   */
  async searchCity(cityName: string, countryName?: string): Promise<CityData | null> {
    try {
      console.log(`🔍 Searching for city: ${cityName}${countryName ? ` in ${countryName}` : ''}`);
      
      // 1. First check vector database
      const existingCity = await this.searchVectorDB(cityName, countryName);
      if (existingCity) {
        console.log(`✅ Found ${cityName} in vector database`);
        return existingCity;
      }

      // 2. If not found, fetch from external sources
      console.log(`🌐 Fetching ${cityName} from external sources...`);
      const externalData = await this.fetchExternalData(cityName, countryName);
      
      if (!externalData.wikipedia) {
        console.log(`❌ No data found for ${cityName}`);
        return null;
      }

      // 3. Generate comprehensive city data using AI
      const cityData = await this.generateCityDataWithAI(cityName, externalData);
      
      // 4. Store in vector database for future use
      await this.storeCityInVectorDB(cityData);
      
      console.log(`✅ Generated and stored data for ${cityName}`);
      return cityData;
      
    } catch (error) {
      console.error(`Error searching for city ${cityName}:`, error);
      return null;
    }
  }

  /**
   * Search existing vector database for city
   */
  private async searchVectorDB(cityName: string, countryName?: string): Promise<CityData | null> {
    try {
      const searchQuery = countryName ? `${cityName} ${countryName}` : cityName;
      
      const results = await vectorStore.searchSimilar({
        query: searchQuery,
        contentTypes: ['city', 'destination'],
        limit: 1,
        threshold: 0.8
      });

      if (results.length > 0) {
        const cityData = JSON.parse(results[0].content);
        return cityData as CityData;
      }

      return null;
    } catch (error) {
      console.error('Error searching vector DB:', error);
      return null;
    }
  }

  /**
   * Fetch data from external APIs (Wikipedia, weather, etc.)
   */
  private async fetchExternalData(cityName: string, countryName?: string): Promise<ExternalCityData> {
    const data: ExternalCityData = { wikipedia: null };

    try {
      // Fetch Wikipedia data
      data.wikipedia = await this.fetchWikipediaData(cityName, countryName);
      
      // Could add more external APIs here:
      // - Weather API for climate data
      // - REST Countries API for country info
      // - OpenStreetMap for geographical data
      // - Tourism APIs for attractions

    } catch (error) {
      console.error('Error fetching external data:', error);
    }

    return data;
  }

  /**
   * Fetch comprehensive data from Wikipedia
   */
  private async fetchWikipediaData(cityName: string, countryName?: string): Promise<WikipediaData | null> {
    try {
      const searchTerm = countryName ? `${cityName}, ${countryName}` : cityName;
      
      // Search for the page
      const searchResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`
      );

      if (!searchResponse.ok) {
        // Try alternative search
        const alternativeResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(searchTerm)}&origin=*`
        );
        
        if (!alternativeResponse.ok) return null;
        
        const altData = await alternativeResponse.json();
        if (!altData.query?.search?.length) return null;
        
        const firstResult = altData.query.search[0];
        const summaryResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstResult.title)}`
        );
        
        if (!summaryResponse.ok) return null;
        const summaryData = await summaryResponse.json();
        
        return {
          title: summaryData.title,
          extract: summaryData.extract || firstResult.snippet,
          coordinates: summaryData.coordinates ? {
            lat: summaryData.coordinates.lat,
            lon: summaryData.coordinates.lon
          } : undefined,
          pageUrl: summaryData.content_urls?.desktop?.page || '',
          thumbnail: summaryData.thumbnail?.source
        };
      }

      const data = await searchResponse.json();
      
      return {
        title: data.title,
        extract: data.extract,
        coordinates: data.coordinates ? {
          lat: data.coordinates.lat,
          lon: data.coordinates.lon
        } : undefined,
        pageUrl: data.content_urls?.desktop?.page || '',
        thumbnail: data.thumbnail?.source
      };

    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      return null;
    }
  }

  /**
   * Generate comprehensive city data using AI
   */
  private async generateCityDataWithAI(cityName: string, externalData: ExternalCityData): Promise<CityData> {
    const prompt = `Based on the following information about ${cityName}, generate comprehensive travel and cultural data in JSON format.

Wikipedia Data: ${JSON.stringify(externalData.wikipedia, null, 2)}

Please provide a detailed response with the following structure:
{
  "id": "city-country",
  "name": "${cityName}",
  "country": "country name",
  "region": "region/state name",
  "latitude": number,
  "longitude": number,
  "population": number,
  "timezone": "timezone",
  "language": ["primary language", "other languages"],
  "currency": "currency code",
  "culture": "brief culture description",
  "description": "detailed description for travelers",
  "highlights": ["key attraction 1", "key attraction 2", ...],
  "rating": 4.5,
  "costLevel": "budget|moderate|expensive",
  "bestTimeToVisit": ["month1", "month2", ...],
  "averageStay": number,
  "mainAttractions": ["attraction1", "attraction2", ...],
  "localCuisine": ["dish1", "dish2", ...],
  "transportOptions": ["option1", "option2", ...],
  "safetyRating": 8.5,
  "touristFriendly": 9.0,
  "localLaws": {
    "legal": ["important law 1", "important law 2", ...],
    "cultural": ["cultural rule 1", "cultural rule 2", ...],
    "guidelines": ["guideline 1", "guideline 2", ...],
    "penalties": ["penalty info 1", "penalty info 2", ...]
  },
  "culturalTaboos": ["taboo 1", "taboo 2", ...],
  "dressCode": {
    "general": "dress code description",
    "religious": "religious site dress code",
    "business": "business attire"
  },
  "tippingEtiquette": "tipping customs",
  "businessHours": {
    "general": "general business hours",
    "restaurants": "restaurant hours",
    "shops": "shop hours",
    "government": "government office hours"
  },
  "emergencyNumbers": {
    "police": "police number",
    "medical": "medical emergency",
    "fire": "fire department",
    "tourist": "tourist helpline"
  }
}

Focus especially on:
1. Local laws and regulations that tourists should know
2. Cultural customs and taboos
3. Practical information for travelers
4. Accurate geographical and demographic data
5. Real attractions and cuisine

Provide only the JSON response, no additional text.`;

    try {
      const response = await groqService.generateQuickResponse(prompt);
      
      // Try to parse the AI response
      const cleanResponse = response.replace(/```json\s*|\s*```/g, '').trim();
      const cityData = JSON.parse(cleanResponse);
      
      // Validate and set defaults for required fields
      return this.validateAndFixCityData(cityData);
      
    } catch (error) {
      console.error('Error generating AI city data:', error);
      
      // Fallback: create basic city data from Wikipedia
      return this.createFallbackCityData(cityName, externalData);
    }
  }

  /**
   * Validate and fix AI-generated city data
   */
  private validateAndFixCityData(data: any): CityData {
    return {
      id: data.id || `${data.name?.toLowerCase().replace(/\s+/g, '-')}-${data.country?.toLowerCase().replace(/\s+/g, '-')}`,
      name: data.name || 'Unknown City',
      country: data.country || 'Unknown',
      region: data.region || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      population: data.population || 0,
      timezone: data.timezone || 'UTC',
      language: Array.isArray(data.language) ? data.language : ['English'],
      currency: data.currency || 'USD',
      culture: data.culture || 'Diverse',
      image: data.image || 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: data.description || 'An interesting destination to explore.',
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      rating: typeof data.rating === 'number' ? data.rating : 4.0,
      costLevel: (['budget', 'moderate', 'expensive'].includes(data.costLevel)) ? data.costLevel : 'moderate',
      bestTimeToVisit: Array.isArray(data.bestTimeToVisit) ? data.bestTimeToVisit : ['Year-round'],
      averageStay: typeof data.averageStay === 'number' ? data.averageStay : 3,
      mainAttractions: Array.isArray(data.mainAttractions) ? data.mainAttractions : [],
      localCuisine: Array.isArray(data.localCuisine) ? data.localCuisine : [],
      transportOptions: Array.isArray(data.transportOptions) ? data.transportOptions : ['Walking', 'Taxi'],
      safetyRating: typeof data.safetyRating === 'number' ? data.safetyRating : 7.0,
      touristFriendly: typeof data.touristFriendly === 'number' ? data.touristFriendly : 7.0,
      localLaws: data.localLaws || {
        legal: [],
        cultural: [],
        guidelines: [],
        penalties: []
      },
      culturalTaboos: Array.isArray(data.culturalTaboos) ? data.culturalTaboos : [],
      dressCode: data.dressCode || {
        general: 'Casual dress acceptable',
        religious: 'Conservative dress recommended',
        business: 'Business attire'
      },
      tippingEtiquette: data.tippingEtiquette || 'Tipping customs vary',
      businessHours: data.businessHours || {
        general: '9:00 AM - 6:00 PM',
        restaurants: '11:00 AM - 10:00 PM',
        shops: '10:00 AM - 8:00 PM',
        government: '9:00 AM - 5:00 PM (Mon-Fri)'
      },
      emergencyNumbers: data.emergencyNumbers || {
        police: '911',
        medical: '911',
        fire: '911',
        tourist: 'Contact local tourism office'
      }
    };
  }

  /**
   * Create fallback city data when AI generation fails
   */
  private createFallbackCityData(cityName: string, externalData: ExternalCityData): CityData {
    const wiki = externalData.wikipedia;
    
    return {
      id: `${cityName.toLowerCase().replace(/\s+/g, '-')}-generated`,
      name: cityName,
      country: 'Unknown',
      region: 'Unknown',
      latitude: wiki?.coordinates?.lat || 0,
      longitude: wiki?.coordinates?.lon || 0,
      population: 0,
      timezone: 'UTC',
      language: ['English'],
      currency: 'USD',
      culture: 'Diverse',
      image: wiki?.thumbnail || 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=600',
      description: wiki?.extract || 'A destination worth exploring.',
      highlights: [],
      rating: 4.0,
      costLevel: 'moderate' as const,
      bestTimeToVisit: ['Year-round'],
      averageStay: 3,
      mainAttractions: [],
      localCuisine: [],
      transportOptions: ['Walking', 'Taxi'],
      safetyRating: 7.0,
      touristFriendly: 7.0,
      localLaws: {
        legal: ['Follow local laws and regulations'],
        cultural: ['Respect local customs and traditions'],
        guidelines: ['Be respectful to locals and environment'],
        penalties: ['Violations may result in fines or legal action']
      },
      culturalTaboos: [],
      dressCode: {
        general: 'Casual dress acceptable',
        religious: 'Conservative dress recommended',
        business: 'Business attire'
      },
      tippingEtiquette: 'Check local customs',
      businessHours: {
        general: '9:00 AM - 6:00 PM',
        restaurants: '11:00 AM - 10:00 PM', 
        shops: '10:00 AM - 8:00 PM',
        government: '9:00 AM - 5:00 PM (Mon-Fri)'
      },
      emergencyNumbers: {
        police: 'Contact local police',
        medical: 'Contact local emergency services',
        fire: 'Contact local fire department',
        tourist: 'Contact local tourism office'
      }
    };
  }

  /**
   * Store generated city data in vector database
   */
  private async storeCityInVectorDB(cityData: CityData): Promise<void> {
    try {
      // Generate embedding for the city data
      const contentForEmbedding = `${cityData.name} ${cityData.country} ${cityData.region} ${cityData.culture} ${cityData.description} ${cityData.highlights.join(' ')} ${cityData.localLaws.legal.join(' ')} ${cityData.localLaws.cultural.join(' ')}`;
      
      const embedding = await embeddingService.generateEmbedding({
        text: contentForEmbedding,
        taskType: 'RETRIEVAL_DOCUMENT',
        title: `${cityData.name}, ${cityData.country}`
      });

      // Store in vector database
      await vectorStore.storeContent({
        contentId: cityData.id,
        contentType: 'city',
        title: `${cityData.name}, ${cityData.country}`,
        content: JSON.stringify(cityData),
        metadata: {
          country: cityData.country,
          region: cityData.region,
          costLevel: cityData.costLevel,
          rating: cityData.rating,
          culture: cityData.culture,
          generated: true,
          timestamp: new Date().toISOString()
        },
        embedding: embedding.embedding
      });

      console.log(`✅ Stored ${cityData.name} in vector database`);
      
    } catch (error) {
      console.error('Error storing city in vector DB:', error);
    }
  }

  /**
   * Batch generate and store multiple cities
   */
  async batchGenerateCities(cityNames: string[], countryName?: string): Promise<CityData[]> {
    const results: CityData[] = [];
    
    for (const cityName of cityNames) {
      try {
        const cityData = await this.searchCity(cityName, countryName);
        if (cityData) {
          results.push(cityData);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing ${cityName}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Get city statistics from vector database
   */
  async getCityStats(): Promise<{
    totalCities: number;
    citiesByCountry: Record<string, number>;
    recentlyAdded: number;
  }> {
    try {
      const allCityContent = await prisma.vectorContent.findMany({
        where: { contentType: 'city' },
        select: { metadata: true, createdAt: true }
      });

      const citiesByCountry: Record<string, number> = {};
      let recentlyAdded = 0;
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      for (const content of allCityContent) {
        const metadata = content.metadata as any;
        if (metadata?.country) {
          citiesByCountry[metadata.country] = (citiesByCountry[metadata.country] || 0) + 1;
        }
        
        if (content.createdAt > oneDayAgo) {
          recentlyAdded++;
        }
      }

      return {
        totalCities: allCityContent.length,
        citiesByCountry,
        recentlyAdded
      };
      
    } catch (error) {
      console.error('Error getting city stats:', error);
      return {
        totalCities: 0,
        citiesByCountry: {},
        recentlyAdded: 0
      };
    }
  }
}

// Singleton instance
export const dynamicCityService = new DynamicCityService();
