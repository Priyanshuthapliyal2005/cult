import { embeddingService } from './embeddings';
import { vectorStore } from './vectorStore';
import { hybridAI } from './hybridAI';
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
      
      // Convert city name to standard format
      const formattedCityName = cityName.trim();
      if (!formattedCityName) return null;
      
      // 1. First check local city database
      const localCity = cityDatabase.find(city => 
        city.name.toLowerCase().includes(formattedCityName.toLowerCase()) ||
        (countryName && city.country.toLowerCase().includes(countryName.toLowerCase()))
      );
      
      if (localCity) {
        console.log(`✅ Found ${formattedCityName} in local database`);
        return localCity;
      }
      
      // 2. Then check vector database
      const existingCity = await this.searchVectorDB(formattedCityName, countryName);
      if (existingCity) {
        console.log(`✅ Found ${formattedCityName} in vector database`);
        return existingCity;
      }

      // 3. If not found, fetch from external sources
      console.log(`🌐 Fetching ${formattedCityName} from external sources...`);
      const externalData = await this.fetchExternalData(formattedCityName, countryName);
      
      // 4. Generate comprehensive city data using AI
      console.log(`🤖 Generating AI data for ${formattedCityName}...`);
      const cityData = await this.generateCityDataWithAI(formattedCityName, externalData, countryName);
      
      // 5. Store in vector database for future use
      await this.storeCityInVectorDB(cityData);
      
      console.log(`✅ Generated and stored data for ${formattedCityName}`);
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
  private async generateCityDataWithAI(cityName: string, externalData: ExternalCityData, countryName?: string): Promise<CityData> {
    try {
      // Use hybridAI to generate comprehensive city data
      const cityData = await hybridAI.generateCityData(cityName, countryName);
      
      // Enrich with external data if available
      if (externalData.wikipedia) {
        if (!cityData.description || cityData.description === '') {
          cityData.description = externalData.wikipedia.extract || 
            `${cityName} is a destination worth exploring with its unique cultural heritage and attractions.`;
        }
        
        if (externalData.wikipedia.coordinates) {
          cityData.latitude = externalData.wikipedia.coordinates.lat;
          cityData.longitude = externalData.wikipedia.coordinates.lon;
        }
        
        if (externalData.wikipedia.thumbnail) {
          cityData.image = externalData.wikipedia.thumbnail;
        }
      }

      // Validate and set defaults for required fields
      return this.validateAndFixCityData(cityData);
      
    } catch (error) {
      console.error('Error generating AI city data:', error);
      
      // Fallback: create basic city data from Wikipedia
      return this.createFallbackCityData(cityName, externalData, countryName);
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
  private createFallbackCityData(cityName: string, externalData: ExternalCityData, countryName?: string): CityData {
    const wiki = externalData.wikipedia;
    const countryStr = countryName || 'Unknown';
    
    return {
      id: `${cityName.toLowerCase().replace(/\s+/g, '-')}-${countryStr.toLowerCase().replace(/\s+/g, '-')}-generated`,
      name: cityName,
      country: countryStr,
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
        }
      });
      console.log(`✅ Stored ${cityData.name} in vector database`);
      
      // Store in ChromaDB as well for dynamic knowledge base
      try {
        await this.storeInChromaDB(cityData);
      } catch (chromaError) {
        console.error('Error storing in ChromaDB:', chromaError);
      }
      
      // Also try to store trip plans for this city if possible
      try {
        this.generateAndStoreTripPlans(cityData);
      } catch (tripError) {
        console.error('Error generating trip plans:', tripError);
      }
    } catch (error) {
      console.error('Error in storeCityInVectorDB:', error);
    }
  }
  
  /**
   * Store generated city data in ChromaDB for dynamic knowledge base
   */
  private async storeInChromaDB(cityData: CityData): Promise<void> {
    try {
      const { dynamicKnowledgeBase } = await import('./dynamicKnowledgeBase');
      
      // Initialize the dynamic knowledge base
      await dynamicKnowledgeBase.initialize();
      
      // Add the destination to the knowledge base
      await dynamicKnowledgeBase.addDestination({
        name: cityData.name,
        country: cityData.country,
        region: cityData.region,
        description: cityData.description,
        coordinates: {
          latitude: cityData.latitude,
          longitude: cityData.longitude
        },
        metadata: {
          culture: cityData.culture,
          costLevel: cityData.costLevel,
          rating: cityData.rating,
          population: cityData.population,
          language: cityData.language,
          currency: cityData.currency,
          image: cityData.image
        }
      });
      
      // Add cultural insights
      await dynamicKnowledgeBase.addCulturalInsight({
        destinationName: cityData.name,
        country: cityData.country,
        insightType: 'custom',
        title: 'Cultural Overview',
        content: cityData.description,
        metadata: {
          highlights: cityData.highlights,
          mainAttractions: cityData.mainAttractions
        }
      });
      
      // Add law-related information if available
      if (cityData.localLaws || cityData.travelLaws) {
        await dynamicKnowledgeBase.addCulturalInsight({
          destinationName: cityData.name,
          country: cityData.country,
          insightType: 'law',
          title: 'Legal Information',
          content: `Important legal information for ${cityData.name}`,
          metadata: {
            laws: cityData.localLaws || cityData.travelLaws
          }
        });
      }
      
      console.log(`✅ Added ${cityData.name} to dynamic knowledge base`);
    } catch (error) {
      console.error('Error storing in ChromaDB:', error);
      throw error;
    }
  }
  
  /**
   * Generate trip plans for a city using AI and store them
   */
  private async generateAndStoreTripPlans(cityData: CityData): Promise<void> {
    try {
      const prompt = `Create travel itineraries for ${cityData.name}, ${cityData.country} with 1-day, 2-day, and 3-day plans in JSON format.
Include morning to evening activities, meals, accommodations, and transportation options.
Focus on authentic cultural experiences, local cuisine, and must-see attractions.
Return valid JSON in this exact format:
{
  "plans": [
    {
      "duration": 1,
      "title": "Essential ${cityData.name} in a Day",
      "days": [{"day": 1, "title": "Highlights Tour", "activities": [...], "meals": [...]}]
    },
    {
      "duration": 2,
      "title": "Weekend in ${cityData.name}",
      "days": [{"day": 1, "title": "...", "activities": [...]}, {"day": 2, "title": "...", "activities": [...]}]
    },
    {
      "duration": 3,
      "title": "Complete ${cityData.name} Experience",
      "days": [...]
    }
  ]
}`;

      const planData = await hybridAI.generateChatResponse([
        { role: 'user', content: prompt }
      ]);
      
      // Parse the JSON data from the response
      const jsonMatch = planData.match(/```json\s*([\s\S]*?)\s*```/) || planData.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0].replace(/```json\s*|\s*```/g, '');
        const tripPlans = JSON.parse(jsonStr);
        
        // Store the trip plans in the vector database
        await vectorStore.storeContent({
          contentId: `trips-${cityData.id}`,
          contentType: 'trip_plans',
          title: `Trip Plans for ${cityData.name}, ${cityData.country}`,
          content: JSON.stringify(tripPlans),
          metadata: {
            cityId: cityData.id,
            cityName: cityData.name,
            country: cityData.country,
            generated: true,
            timestamp: new Date().toISOString()
          }
        });
        
        console.log(`✅ Generated and stored trip plans for ${cityData.name}`);
      }
    } catch (error) {
      console.error('Error generating trip plans:', error);
    }
  }

  /**
   * Fetch trip plans for a city from the vector database
   */
  async getTripPlans(cityId: string): Promise<any> {
    try {
      const results = await vectorStore.searchSimilar({
        query: `trip plans ${cityId}`,
        contentTypes: ['trip_plans'],
        limit: 1,
        threshold: 0.1,
        metadata: {
          cityId: cityId
        }
      });
      
      if (results.length > 0) {
        return JSON.parse(results[0].content);
      }
      
      return null;
      
    } catch (error) {
      console.error('Error fetching trip plans:', error);
      return null;
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
