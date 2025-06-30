import { EnhancedCityData, DataSource, QualityMetrics } from './types';
import { vectorStore } from '@/lib/vectorStore';
import { embeddingService } from '@/lib/embeddings';
import { getGroqService } from '@/lib/groq';

export interface CityDataSources {
  wikipedia?: WikipediaData;
  osm?: OSMData;
  government?: GovernmentData;
  weather?: WeatherData;
  currency?: CurrencyData;
  events?: EventData;
}

export interface WikipediaData {
  title: string;
  extract: string;
  coordinates?: { lat: number; lon: number };
  pageUrl: string;
  thumbnail?: string;
  categories: string[];
  infobox: Record<string, any>;
}

export interface OSMData {
  displayName: string;
  coordinates: { lat: number; lon: number };
  boundingBox: number[];
  placeType: string;
  address: Record<string, string>;
  amenities: any[];
}

export interface GovernmentData {
  travelAdvisories: string[];
  visaRequirements: string[];
  healthRequirements: string[];
  safetyWarnings: string[];
  lastUpdated: Date;
}

export interface WeatherData {
  currentConditions: any;
  averageTemperatures: Record<string, { high: number; low: number }>;
  rainySeasons: string[];
  bestVisitTimes: string[];
}

export interface CurrencyData {
  currency: string;
  exchangeRate: number;
  economicData: any;
}

export interface EventData {
  events: Array<{
    name: string;
    date: string;
    type: string;
    description: string;
  }>;
}

export class DataAcquisitionEngine {
  private readonly baseDelay = 1000; // 1 second between API calls
  private readonly maxRetries = 3;

  async fetchCityData(cityName: string, country?: string): Promise<CityDataSources> {
    console.log(`🌍 Fetching comprehensive data for ${cityName}${country ? `, ${country}` : ''}`);

    const sources = await Promise.allSettled([
      this.fetchWikipediaData(cityName, country),
      this.fetchOSMData(cityName, country),
      this.fetchGovernmentAdvisories(country || ''),
      this.fetchWeatherData(cityName),
      this.fetchCurrencyData(country || ''),
      this.fetchEventsData(cityName, country)
    ]);

    const consolidatedData = this.consolidateData(sources);
    console.log(`✅ Data acquisition completed for ${cityName}`);
    
    return consolidatedData;
  }

  private async fetchWikipediaData(cityName: string, country?: string): Promise<WikipediaData | null> {
    try {
      const searchTerm = country ? `${cityName}, ${country}` : cityName;
      
      // First, search for the page
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
          thumbnail: summaryData.thumbnail?.source,
          categories: [],
          infobox: {}
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
        thumbnail: data.thumbnail?.source,
        categories: [],
        infobox: {}
      };

    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
      return null;
    }
  }

  private async fetchOSMData(cityName: string, country?: string): Promise<OSMData | null> {
    try {
      const searchTerm = country ? `${cityName}, ${country}` : cityName;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1&addressdetails=1&extratags=1`
      );

      if (!response.ok) return null;
      
      const data = await response.json();
      if (!data.length) return null;

      const result = data[0];
      
      return {
        displayName: result.display_name,
        coordinates: {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon)
        },
        boundingBox: result.boundingbox ? result.boundingbox.map(parseFloat) : [],
        placeType: result.type,
        address: result.address || {},
        amenities: []
      };

    } catch (error) {
      console.error('Error fetching OSM data:', error);
      return null;
    }
  }

  private async fetchGovernmentAdvisories(country: string): Promise<GovernmentData | null> {
    try {
      // This would integrate with official government APIs
      // For now, providing structure for future implementation
      return {
        travelAdvisories: [],
        visaRequirements: [],
        healthRequirements: [],
        safetyWarnings: [],
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching government data:', error);
      return null;
    }
  }

  private async fetchWeatherData(cityName: string): Promise<WeatherData | null> {
    try {
      // This would integrate with weather APIs like OpenWeatherMap
      // For now, providing structure for future implementation
      return {
        currentConditions: {},
        averageTemperatures: {},
        rainySeasons: [],
        bestVisitTimes: []
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  private async fetchCurrencyData(country: string): Promise<CurrencyData | null> {
    try {
      // This would integrate with currency APIs
      // For now, providing structure for future implementation
      return {
        currency: 'USD',
        exchangeRate: 1,
        economicData: {}
      };
    } catch (error) {
      console.error('Error fetching currency data:', error);
      return null;
    }
  }

  private async fetchEventsData(cityName: string, country?: string): Promise<EventData | null> {
    try {
      // This would integrate with events APIs
      // For now, providing structure for future implementation
      return {
        events: []
      };
    } catch (error) {
      console.error('Error fetching events data:', error);
      return null;
    }
  }

  private consolidateData(sources: PromiseSettledResult<any>[]): CityDataSources {
    const [wikipedia, osm, government, weather, currency, events] = sources;

    return {
      wikipedia: wikipedia.status === 'fulfilled' ? wikipedia.value : undefined,
      osm: osm.status === 'fulfilled' ? osm.value : undefined,
      government: government.status === 'fulfilled' ? government.value : undefined,
      weather: weather.status === 'fulfilled' ? weather.value : undefined,
      currency: currency.status === 'fulfilled' ? currency.value : undefined,
      events: events.status === 'fulfilled' ? events.value : undefined,
    };
  }

  async validateAndEnrichData(rawData: CityDataSources, cityName: string): Promise<EnhancedCityData> {
    // Generate comprehensive city data using AI
    const prompt = `Based on the following data sources for ${cityName}, generate comprehensive travel intelligence in JSON format:

Wikipedia Data: ${JSON.stringify(rawData.wikipedia, null, 2)}
OSM Data: ${JSON.stringify(rawData.osm, null, 2)}

Generate detailed travel information including:
1. Legal requirements and regulations for tourists
2. Cultural norms and etiquette guidelines
3. Practical travel information
4. Economic data and costs
5. Climate and seasonal information
6. Language essentials

Focus on accuracy and practical utility for travelers. Include specific laws, penalties, and cultural considerations.

Respond with valid JSON only.`;

    try {
      const response = await getGroqService().generateQuickResponse(prompt);
      const cleanResponse = response.replace(/```json\s*|\s*```/g, '').trim();
      const aiData = JSON.parse(cleanResponse);
      
      // Create comprehensive city data structure
      const enhancedData: EnhancedCityData = this.buildEnhancedCityData(cityName, rawData, aiData);
      
      return enhancedData;
    } catch (error) {
      console.error('Error enriching data with AI:', error);
      return this.createFallbackCityData(cityName, rawData);
    }
  }

  private buildEnhancedCityData(cityName: string, sources: CityDataSources, aiData: any): EnhancedCityData {
    const coordinates = sources.osm?.coordinates || sources.wikipedia?.coordinates || { lat: 0, lon: 0 };
    
    return {
      id: `${cityName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: cityName,
      country: sources.osm?.address?.country || 'Unknown',
      region: sources.osm?.address?.state || sources.osm?.address?.region || 'Unknown',
      coordinates: {
        latitude: coordinates.lat,
        longitude: coordinates.lon
      },
      population: aiData.population || 0,
      timezone: aiData.timezone || 'UTC',
      languages: aiData.languages || ['English'],
      currency: sources.currency?.currency || aiData.currency || 'USD',
      safetyRating: aiData.safetyRating || 7.0,
      touristFriendly: aiData.touristFriendly || 7.0,
      costLevel: aiData.costLevel || 'moderate',
      bestTimeToVisit: aiData.bestTimeToVisit || ['Year-round'],
      averageStay: aiData.averageStay || 3,
      
      travelLaws: aiData.travelLaws || this.getDefaultTravelLaws(),
      culturalNorms: aiData.culturalNorms || this.getDefaultCulturalNorms(),
      attractions: aiData.attractions || [],
      restaurants: aiData.restaurants || [],
      events: aiData.events || [],
      transportation: aiData.transportation || [],
      economicData: aiData.economicData || this.getDefaultEconomicData(),
      climate: aiData.climate || this.getDefaultClimate(),
      languageGuide: aiData.languageGuide || this.getDefaultLanguageGuide(aiData.languages?.[0] || 'English'),
      
      metadata: {
        lastUpdated: new Date(),
        dataQuality: this.calculateQualityMetrics(sources),
        userFeedback: [],
        sources: this.getDataSources(sources),
        updateFrequency: 'daily',
        expertReviewed: false,
        communityValidated: false
      }
    };
  }

  private createFallbackCityData(cityName: string, sources: CityDataSources): EnhancedCityData {
    const coordinates = sources.osm?.coordinates || sources.wikipedia?.coordinates || { lat: 0, lon: 0 };
    
    return {
      id: `${cityName.toLowerCase().replace(/\s+/g, '-')}-fallback`,
      name: cityName,
      country: sources.osm?.address?.country || 'Unknown',
      region: sources.osm?.address?.state || 'Unknown',
      coordinates: {
        latitude: coordinates.lat,
        longitude: coordinates.lon
      },
      population: 0,
      timezone: 'UTC',
      languages: ['English'],
      currency: 'USD',
      safetyRating: 7.0,
      touristFriendly: 7.0,
      costLevel: 'moderate',
      bestTimeToVisit: ['Year-round'],
      averageStay: 3,
      
      travelLaws: this.getDefaultTravelLaws(),
      culturalNorms: this.getDefaultCulturalNorms(),
      attractions: [],
      restaurants: [],
      events: [],
      transportation: [],
      economicData: this.getDefaultEconomicData(),
      climate: this.getDefaultClimate(),
      languageGuide: this.getDefaultLanguageGuide('English'),
      
      metadata: {
        lastUpdated: new Date(),
        dataQuality: this.calculateQualityMetrics(sources),
        userFeedback: [],
        sources: this.getDataSources(sources),
        updateFrequency: 'daily',
        expertReviewed: false,
        communityValidated: false
      }
    };
  }

  private getDefaultTravelLaws() {
    return {
      immigration: {
        visaRequired: true,
        visaTypes: ['Tourist'],
        maxStayDuration: 90,
        entryRestrictions: ['Valid passport required'],
        customsRegulations: ['Declare items over $10,000'],
        healthRequirements: ['Check vaccination requirements']
      },
      transportation: {
        drivingLaws: ['Valid license required'],
        publicTransportRules: ['Keep tickets until end of journey'],
        rideSharingRegulations: ['Use licensed services'],
        cyclingRules: ['Follow traffic laws'],
        walkingRegulations: ['Use designated crossings']
      },
      accommodation: {
        hotelRegistration: ['Provide ID at check-in'],
        shortTermRentals: ['Verify property registration'],
        guestObligations: ['Respect property rules'],
        touristTax: ['May apply in some areas']
      },
      publicBehavior: {
        noiseOrdinances: ['Quiet hours typically 10 PM - 6 AM'],
        alcoholRestrictions: ['Check local drinking laws'],
        smokingBans: ['No smoking in public buildings'],
        publicDisplayRestrictions: ['Respect local customs'],
        dressCodes: ['Dress appropriately for cultural sites']
      },
      photography: {
        restrictedAreas: ['Military installations', 'Government buildings'],
        permitsRequired: ['Commercial photography'],
        privacyLaws: ['Respect individuals\' privacy'],
        commercialRestrictions: ['Check licensing requirements']
      },
      shopping: {
        taxRefunds: ['Keep receipts for tax refunds'],
        customsDeclaration: ['Declare valuable purchases'],
        restrictedItems: ['Check prohibited items list'],
        bargainingEtiquette: ['Respect local practices']
      },
      penalties: {
        commonViolations: [
          {
            violation: 'Overstaying visa',
            penalty: 'Fines and deportation',
            severity: 'severe' as const
          }
        ],
        contactAuthorities: ['Local police: 911'],
        emergencyProcedures: ['Contact embassy if arrested'],
        embassyContacts: ['Check embassy website']
      }
    };
  }

  private getDefaultCulturalNorms() {
    return {
      etiquette: ['Be respectful and polite', 'Learn basic greetings'],
      taboos: ['Avoid offensive gestures', 'Respect religious customs'],
      dressCode: {
        general: 'Dress appropriately for the climate and culture',
        religious: 'Conservative dress required at religious sites',
        business: 'Business attire for professional settings',
        formal: 'Formal wear for special occasions',
        beach: 'Swimwear appropriate at beaches and pools'
      },
      religiousConsiderations: ['Respect religious practices', 'Follow site-specific rules'],
      businessCulture: ['Punctuality is important', 'Exchange business cards respectfully'],
      socialInteractions: ['Maintain appropriate personal space', 'Use polite language'],
      giftGiving: ['Small gifts are appreciated', 'Avoid expensive items'],
      diningEtiquette: ['Wait for host to begin', 'Use appropriate utensils']
    };
  }

  private getDefaultEconomicData() {
    return {
      averageDailyCost: 50,
      accommodationCosts: {
        budget: 25,
        midRange: 75,
        luxury: 200
      },
      mealCosts: {
        streetFood: 5,
        restaurant: 15,
        finedining: 50
      },
      transportCosts: {
        local: 2,
        taxi: 10,
        longDistance: 25
      },
      tippingGuide: '10-15% in restaurants, round up for services'
    };
  }

  private getDefaultClimate() {
    return {
      averageTemperature: {
        'January': { high: 20, low: 10 },
        'July': { high: 30, low: 20 }
      },
      rainySeasons: ['June-September'],
      bestWeather: ['March-May', 'October-November'],
      packingRecommendations: {
        'Summer': ['Light clothing', 'Sun protection'],
        'Winter': ['Warm layers', 'Rain gear']
      }
    };
  }

  private getDefaultLanguageGuide(language: string) {
    return {
      primaryLanguage: language,
      essentialPhrases: [
        {
          english: 'Hello',
          local: 'Hello',
          pronunciation: 'heh-lo',
          usage: 'General greeting'
        },
        {
          english: 'Thank you',
          local: 'Thank you',
          pronunciation: 'thank you',
          usage: 'Expressing gratitude'
        }
      ],
      communicationTips: ['Speak slowly and clearly', 'Use gestures to help communicate'],
      writingSystem: 'Latin'
    };
  }

  private calculateQualityMetrics(sources: CityDataSources): QualityMetrics {
    let sourceCount = 0;
    let reliabilitySum = 0;

    if (sources.wikipedia) { sourceCount++; reliabilitySum += 0.8; }
    if (sources.osm) { sourceCount++; reliabilitySum += 0.9; }
    if (sources.government) { sourceCount++; reliabilitySum += 0.95; }
    if (sources.weather) { sourceCount++; reliabilitySum += 0.85; }
    if (sources.currency) { sourceCount++; reliabilitySum += 0.9; }
    if (sources.events) { sourceCount++; reliabilitySum += 0.7; }

    const avgReliability = sourceCount > 0 ? reliabilitySum / sourceCount : 0;

    return {
      dataFreshness: 0, // Just created
      sourceReliability: avgReliability,
      userValidation: 0, // No user feedback yet
      expertReview: 0, // Not yet reviewed
      crossReferenceAccuracy: sourceCount > 1 ? 0.8 : 0.5,
      overallScore: (avgReliability + (sourceCount > 1 ? 0.8 : 0.5)) / 2
    };
  }

  private getDataSources(sources: CityDataSources): DataSource[] {
    const dataSources: DataSource[] = [];

    if (sources.wikipedia) {
      dataSources.push({
        name: 'Wikipedia',
        type: 'wikipedia',
        url: sources.wikipedia.pageUrl,
        lastFetched: new Date(),
        reliability: 0.8
      });
    }

    if (sources.osm) {
      dataSources.push({
        name: 'OpenStreetMap',
        type: 'osm',
        lastFetched: new Date(),
        reliability: 0.9
      });
    }

    return dataSources;
  }

  async storeInKnowledgeBase(cityData: EnhancedCityData): Promise<void> {
    try {
      // Generate comprehensive content for vector search
      const content = this.generateSearchContent(cityData);
      
      // Generate embedding
      const embedding = await embeddingService.generateEmbedding({
        text: content,
        taskType: 'RETRIEVAL_DOCUMENT',
        title: `${cityData.name}, ${cityData.country}`
      });

      // Store in vector database
      await vectorStore.storeContent({
        contentId: cityData.id,
        contentType: 'enhanced_city',
        title: `${cityData.name}, ${cityData.country} - Complete Travel Guide`,
        content: JSON.stringify(cityData),
        metadata: {
          country: cityData.country,
          region: cityData.region,
          costLevel: cityData.costLevel,
          safetyRating: cityData.safetyRating,
          coordinates: cityData.coordinates,
          languages: cityData.languages,
          lastUpdated: cityData.metadata.lastUpdated,
          dataQuality: cityData.metadata.dataQuality.overallScore,
          generated: true
        },
        embedding: embedding.embedding
      });

      console.log(`✅ Stored ${cityData.name} in knowledge base`);
    } catch (error) {
      console.error('Error storing in knowledge base:', error);
    }
  }

  private generateSearchContent(cityData: EnhancedCityData): string {
    return `
${cityData.name}, ${cityData.country} - Complete Travel Guide

Location: ${cityData.name}, ${cityData.region}, ${cityData.country}
Population: ${cityData.population.toLocaleString()}
Languages: ${cityData.languages.join(', ')}
Currency: ${cityData.currency}
Safety Rating: ${cityData.safetyRating}/10
Cost Level: ${cityData.costLevel}

Travel Laws and Regulations:
Immigration: ${JSON.stringify(cityData.travelLaws.immigration)}
Transportation: ${JSON.stringify(cityData.travelLaws.transportation)}
Public Behavior: ${JSON.stringify(cityData.travelLaws.publicBehavior)}
Photography: ${JSON.stringify(cityData.travelLaws.photography)}

Cultural Norms:
Etiquette: ${cityData.culturalNorms.etiquette.join(', ')}
Taboos: ${cityData.culturalNorms.taboos.join(', ')}
Religious Considerations: ${cityData.culturalNorms.religiousConsiderations.join(', ')}

Economic Information:
Average Daily Cost: $${cityData.economicData.averageDailyCost}
Accommodation: Budget $${cityData.economicData.accommodationCosts.budget}, Mid-range $${cityData.economicData.accommodationCosts.midRange}, Luxury $${cityData.economicData.accommodationCosts.luxury}
Meals: Street food $${cityData.economicData.mealCosts.streetFood}, Restaurant $${cityData.economicData.mealCosts.restaurant}, Fine dining $${cityData.economicData.mealCosts.finedining}

Best Time to Visit: ${cityData.bestTimeToVisit.join(', ')}
Essential Phrases: ${cityData.languageGuide.essentialPhrases.map(p => `${p.english}: ${p.local}`).join(', ')}
    `.trim();
  }
}

// Singleton instance
export const dataAcquisitionEngine = new DataAcquisitionEngine();