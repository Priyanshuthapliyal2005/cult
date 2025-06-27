import { vectorStore } from '@/lib/vectorStore';
import { hybridAI } from '@/lib/hybridAI';
import { 
  SearchRequest, 
  TravelIntelligenceResponse, 
  EnhancedCityData, 
  PersonalizedRecommendation,
  LegalAlert,
  CulturalTip,
  PracticalInformation 
} from './types';

export class IntelligentSearchEngine {
  async search(request: SearchRequest): Promise<TravelIntelligenceResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Processing intelligent search: "${request.query}"`);

      // Phase 1: Vector similarity search
      const vectorResults = await this.performVectorSearch(request);
      
      // Phase 2: Extract and analyze destinations
      const destinations = await this.extractDestinations(vectorResults);
      
      // Phase 3: Generate personalized recommendations
      const recommendations = await this.generateRecommendations(destinations, request);
      
      // Phase 4: Identify legal alerts
      const legalAlerts = await this.generateLegalAlerts(destinations, request);
      
      // Phase 5: Cultural insights
      const culturalTips = await this.generateCulturalTips(destinations, request);
      
      // Phase 6: Practical information
      const practicalInfo = await this.generatePracticalInfo(destinations);
      
      // Phase 7: Find similar destinations
      const similarDestinations = await this.findSimilarDestinations(destinations[0], request);

      const searchTime = Date.now() - startTime;
      console.log(`✅ Intelligent search completed in ${searchTime}ms`);

      return {
        data: {
          destination: destinations[0],
          recommendations,
          legalAlerts,
          culturalTips,
          practicalInfo,
          similarDestinations
        },
        metadata: {
          dataQuality: destinations[0]?.metadata?.dataQuality || {
            dataFreshness: 0,
            sourceReliability: 0.8,
            userValidation: 0,
            expertReview: 0,
            crossReferenceAccuracy: 0.7,
            overallScore: 0.75
          },
          lastUpdated: new Date(),
          sources: destinations[0]?.metadata?.sources || [],
          confidence: this.calculateSearchConfidence(vectorResults, destinations),
          searchTime
        },
        status: {
          code: 200,
          message: 'Search completed successfully',
          warnings: this.generateWarnings(destinations, request)
        }
      };
    } catch (error) {
      console.error('Intelligent search error:', error);
      return this.generateErrorResponse(error, Date.now() - startTime);
    }
  }

  private async performVectorSearch(request: SearchRequest) {
    const searchQuery = this.enhanceSearchQuery(request);
    
    const vectorRequest = {
      query: searchQuery,
      limit: request.limit || 10,
      threshold: 0.3,
      contentTypes: ['enhanced_city', 'destination', 'city'],
      metadata: this.buildMetadataFilter(request)
    };

    return await vectorStore.searchSimilar(vectorRequest);
  }

  private enhanceSearchQuery(request: SearchRequest): string {
    let enhancedQuery = request.query;

    // Add context-based enhancements
    if (request.context) {
      const { budget, interests, culturalPreferences, legalConcerns } = request.context;
      
      if (budget) enhancedQuery += ` ${budget} budget travel`;
      if (interests) enhancedQuery += ` ${interests.join(' ')} activities`;
      if (culturalPreferences) enhancedQuery += ` ${culturalPreferences.join(' ')} culture`;
      if (legalConcerns) enhancedQuery += ` legal requirements ${legalConcerns.join(' ')}`;
    }

    // Add filter-based enhancements
    if (request.filters) {
      const { languages, safetyLevel, costLevel } = request.filters;
      
      if (languages) enhancedQuery += ` ${languages.join(' ')} speaking`;
      if (safetyLevel) enhancedQuery += ` safe travel safety rating ${safetyLevel}`;
      if (costLevel) enhancedQuery += ` ${costLevel.join(' ')} cost`;
    }

    return enhancedQuery;
  }

  private buildMetadataFilter(request: SearchRequest) {
    const metadata: any = {};

    if (request.filters) {
      if (request.filters.countries) metadata.country = request.filters.countries;
      if (request.filters.costLevel) metadata.costLevel = request.filters.costLevel;
      if (request.filters.safetyLevel) metadata.safetyLevel = { gte: request.filters.safetyLevel };
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  private async extractDestinations(vectorResults: any[]): Promise<EnhancedCityData[]> {
    const destinations: EnhancedCityData[] = [];

    for (const result of vectorResults) {
      try {
        if (result.contentType === 'enhanced_city') {
          const cityData = JSON.parse(result.content);
          destinations.push(cityData);
        } else {
          // Convert legacy city data to enhanced format
          const legacyData = JSON.parse(result.content);
          const enhancedData = await this.convertToEnhancedFormat(legacyData);
          destinations.push(enhancedData);
        }
      } catch (error) {
        console.error('Error parsing destination data:', error);
      }
    }

    return destinations.slice(0, 5); // Limit to top 5 destinations
  }

  private async convertToEnhancedFormat(legacyData: any): Promise<EnhancedCityData> {
    // Convert legacy city data to enhanced format
    // This is a simplified conversion - in production, this would be more comprehensive
    return {
      id: legacyData.id || `legacy-${Date.now()}`,
      name: legacyData.name || 'Unknown City',
      country: legacyData.country || 'Unknown',
      region: legacyData.region || 'Unknown',
      coordinates: {
        latitude: legacyData.latitude || 0,
        longitude: legacyData.longitude || 0
      },
      population: legacyData.population || 0,
      timezone: legacyData.timezone || 'UTC',
      languages: legacyData.language || ['English'],
      currency: legacyData.currency || 'USD',
      safetyRating: legacyData.safetyRating || 7.0,
      touristFriendly: legacyData.touristFriendly || 7.0,
      costLevel: legacyData.costLevel || 'moderate',
      bestTimeToVisit: legacyData.bestTimeToVisit || ['Year-round'],
      averageStay: legacyData.averageStay || 3,
      
      // Use minimal defaults for missing data
      travelLaws: legacyData.travelLaws || this.getMinimalTravelLaws(),
      culturalNorms: legacyData.culturalNorms || this.getMinimalCulturalNorms(),
      attractions: legacyData.mainAttractions?.map((name: string) => ({
        id: `${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        type: 'attraction',
        coordinates: { latitude: 0, longitude: 0 },
        description: `Popular attraction in ${legacyData.name}`,
        openingHours: 'Check locally',
        entryFee: 'Varies',
        culturalSignificance: 'Locally significant',
        tips: []
      })) || [],
      restaurants: [],
      events: [],
      transportation: [],
      economicData: this.getMinimalEconomicData(),
      climate: this.getMinimalClimate(),
      languageGuide: this.getMinimalLanguageGuide(legacyData.language?.[0] || 'English'),
      
      metadata: {
        lastUpdated: new Date(),
        dataQuality: {
          dataFreshness: 30,
          sourceReliability: 0.6,
          userValidation: 0,
          expertReview: 0,
          crossReferenceAccuracy: 0.5,
          overallScore: 0.55
        },
        userFeedback: [],
        sources: [],
        updateFrequency: 'weekly',
        expertReviewed: false,
        communityValidated: false
      }
    };
  }

  private async generateRecommendations(
    destinations: EnhancedCityData[], 
    request: SearchRequest
  ): Promise<PersonalizedRecommendation[]> {
    if (!destinations.length) return [];

    const destination = destinations[0];
    const recommendations: PersonalizedRecommendation[] = [];

    // Generate AI-powered recommendations
    try {
      const recommendationPrompt = `Based on the user's interests and the destination ${destination.name}, ${destination.country}, generate personalized travel recommendations.

User Context: ${JSON.stringify(request.context)}
Destination: ${destination.name}
Available Attractions: ${destination.attractions.map(a => a.name).join(', ')}
Cultural Considerations: ${destination.culturalNorms.etiquette.join(', ')}

Provide 5 specific, actionable recommendations with reasoning.`;

      const aiResponse = await hybridAI.generateChatResponse([
        { role: 'user', content: recommendationPrompt }
      ]);

      // Parse AI response and create structured recommendations
      const aiRecommendations = this.parseRecommendations(aiResponse, destination);
      recommendations.push(...aiRecommendations);

    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    }

    // Add attraction-based recommendations
    destination.attractions.slice(0, 3).forEach((attraction, index) => {
      recommendations.push({
        type: 'activity',
        item: attraction,
        score: 0.9 - (index * 0.1),
        reasoning: [
          'Popular attraction with high visitor satisfaction',
          'Culturally significant location',
          'Matches your interests'
        ],
        culturalNotes: [
          `Follow dress code: ${destination.culturalNorms.dressCode.general}`,
          'Respect local customs and photography rules'
        ],
        legalConsiderations: destination.travelLaws.photography.restrictedAreas.length > 0 ? [
          'Check photography restrictions',
          'Some areas may require permits'
        ] : []
      });
    });

    return recommendations.slice(0, 8); // Limit to 8 recommendations
  }

  private parseRecommendations(aiResponse: string, destination: EnhancedCityData): PersonalizedRecommendation[] {
    // Simple parsing of AI response - in production, this would be more sophisticated
    const recommendations: PersonalizedRecommendation[] = [];
    
    const lines = aiResponse.split('\n').filter(line => line.trim());
    let currentRec: Partial<PersonalizedRecommendation> = {};
    
    lines.forEach((line, index) => {
      if (line.match(/^\d+\./)) {
        if (currentRec.reasoning) {
          recommendations.push({
            type: 'activity',
            item: { name: currentRec.reasoning![0] || 'AI Recommendation', description: line },
            score: 0.8,
            reasoning: [line],
            culturalNotes: ['Follow local customs'],
            legalConsiderations: ['Check local regulations']
          });
        }
        currentRec = { reasoning: [line] };
      }
    });

    return recommendations.slice(0, 3);
  }

  private async generateLegalAlerts(
    destinations: EnhancedCityData[], 
    request: SearchRequest
  ): Promise<LegalAlert[]> {
    if (!destinations.length) return [];

    const destination = destinations[0];
    const alerts: LegalAlert[] = [];

    // Check for severe penalties
    destination.travelLaws.penalties.commonViolations.forEach(violation => {
      if (violation.severity === 'severe') {
        alerts.push({
          severity: 'critical',
          category: 'Legal Violation',
          title: `High-Risk Legal Violation: ${violation.violation}`,
          description: violation.penalty,
          consequences: [violation.penalty],
          recommendations: [
            'Strictly avoid this behavior',
            'Understand local laws before travel',
            'Contact embassy if in doubt'
          ],
          lastUpdated: new Date()
        });
      }
    });

    // Check user-specific legal concerns
    if (request.context?.legalConcerns) {
      request.context.legalConcerns.forEach(concern => {
        switch (concern) {
          case 'photography':
            if (destination.travelLaws.photography.restrictedAreas.length > 0) {
              alerts.push({
                severity: 'warning',
                category: 'Photography',
                title: 'Photography Restrictions Apply',
                description: 'Certain areas have photography restrictions',
                consequences: destination.travelLaws.photography.restrictedAreas,
                recommendations: [
                  'Ask permission before photographing people',
                  'Avoid restricted areas',
                  'Check permit requirements for commercial photography'
                ],
                lastUpdated: new Date()
              });
            }
            break;
          case 'alcohol':
            if (destination.travelLaws.publicBehavior.alcoholRestrictions.length > 0) {
              alerts.push({
                severity: 'warning',
                category: 'Alcohol',
                title: 'Alcohol Restrictions in Effect',
                description: 'Local alcohol laws may be strict',
                consequences: destination.travelLaws.publicBehavior.alcoholRestrictions,
                recommendations: [
                  'Check local drinking laws',
                  'Avoid public consumption unless permitted',
                  'Respect religious and cultural sensitivities'
                ],
                lastUpdated: new Date()
              });
            }
            break;
        }
      });
    }

    return alerts.slice(0, 5);
  }

  private async generateCulturalTips(
    destinations: EnhancedCityData[], 
    request: SearchRequest
  ): Promise<CulturalTip[]> {
    if (!destinations.length) return [];

    const destination = destinations[0];
    const tips: CulturalTip[] = [];

    // Essential etiquette tips
    destination.culturalNorms.etiquette.slice(0, 3).forEach(etiquette => {
      tips.push({
        category: 'Etiquette',
        tip: etiquette,
        importance: 'important',
        context: `Essential for respectful interaction in ${destination.name}`,
        examples: [`When visiting ${destination.name}, remember to ${etiquette.toLowerCase()}`]
      });
    });

    // Critical taboos
    destination.culturalNorms.taboos.slice(0, 2).forEach(taboo => {
      tips.push({
        category: 'Taboos',
        tip: `Avoid: ${taboo}`,
        importance: 'essential',
        context: 'Violating this could cause serious offense',
        examples: [taboo]
      });
    });

    // Dress code guidance
    tips.push({
      category: 'Dress Code',
      tip: destination.culturalNorms.dressCode.general,
      importance: 'important',
      context: 'Appropriate dress shows respect for local culture',
      examples: [
        `General: ${destination.culturalNorms.dressCode.general}`,
        `Religious sites: ${destination.culturalNorms.dressCode.religious}`
      ]
    });

    return tips.slice(0, 8);
  }

  private async generatePracticalInfo(destinations: EnhancedCityData[]): Promise<PracticalInformation> {
    if (!destinations.length) {
      return this.getDefaultPracticalInfo();
    }

    const destination = destinations[0];
    
    return {
      emergencyNumbers: {
        police: '911', // This would be destination-specific
        medical: '911',
        fire: '911',
        tourist: destination.metadata.sources.find(s => s.type === 'government')?.url || 'Contact local tourism office'
      },
      businessHours: {
        general: '9:00 AM - 6:00 PM',
        restaurants: '11:00 AM - 10:00 PM',
        shops: '10:00 AM - 8:00 PM',
        government: '9:00 AM - 5:00 PM (Mon-Fri)',
        banks: '9:00 AM - 4:00 PM (Mon-Fri)'
      },
      healthAndSafety: {
        vaccinations: destination.travelLaws.immigration.healthRequirements,
        commonRisks: ['Check current health advisories'],
        medicalFacilities: ['Hospitals and clinics available'],
        pharmacies: ['Pharmacies widely available'],
        drinkingWater: 'Check local water safety recommendations'
      },
      connectivity: {
        internetAvailability: 'Widely available',
        wifiCommon: true,
        simCards: ['Available at airports and shops'],
        internetCafes: false,
        dataRoaming: 'Check with your provider'
      }
    };
  }

  private async findSimilarDestinations(
    destination: EnhancedCityData, 
    request: SearchRequest
  ): Promise<EnhancedCityData[]> {
    if (!destination) return [];

    try {
      // Search for similar destinations based on characteristics
      const similarityQuery = `${destination.costLevel} ${destination.culturalNorms.etiquette.join(' ')} ${destination.country} similar destinations`;
      
      const vectorRequest = {
        query: similarityQuery,
        limit: 4,
        threshold: 0.4,
        contentTypes: ['enhanced_city', 'destination'],
        metadata: {
          country: { ne: destination.country }, // Exclude same country
          costLevel: destination.costLevel
        }
      };

      const results = await vectorStore.searchSimilar(vectorRequest);
      const similar: EnhancedCityData[] = [];

      for (const result of results) {
        try {
          const cityData = JSON.parse(result.content);
          if (cityData.id !== destination.id) {
            similar.push(cityData);
          }
        } catch (error) {
          console.error('Error parsing similar destination:', error);
        }
      }

      return similar.slice(0, 3);
    } catch (error) {
      console.error('Error finding similar destinations:', error);
      return [];
    }
  }

  private calculateSearchConfidence(vectorResults: any[], destinations: EnhancedCityData[]): number {
    if (!vectorResults.length || !destinations.length) return 0.3;

    const avgSimilarity = vectorResults.reduce((sum, result) => sum + (result.similarity || 0), 0) / vectorResults.length;
    const dataQuality = destinations[0].metadata.dataQuality.overallScore;
    
    return Math.min((avgSimilarity * 0.6) + (dataQuality * 0.4), 0.95);
  }

  private generateWarnings(destinations: EnhancedCityData[], request: SearchRequest): string[] {
    const warnings: string[] = [];

    if (!destinations.length) {
      warnings.push('No destinations found matching your criteria');
      return warnings;
    }

    const destination = destinations[0];

    // Data quality warnings
    if (destination.metadata.dataQuality.overallScore < 0.6) {
      warnings.push('Data quality for this destination is below average - verify information independently');
    }

    // Safety warnings
    if (destination.safetyRating < 6) {
      warnings.push('This destination has a lower safety rating - exercise increased caution');
    }

    // Legal warnings
    const severeViolations = destination.travelLaws.penalties.commonViolations.filter(v => v.severity === 'severe');
    if (severeViolations.length > 0) {
      warnings.push('This destination has strict laws with severe penalties - review legal requirements carefully');
    }

    return warnings;
  }

  private generateErrorResponse(error: any, searchTime: number): TravelIntelligenceResponse {
    return {
      data: {
        destination: {} as EnhancedCityData,
        recommendations: [],
        legalAlerts: [],
        culturalTips: [],
        practicalInfo: this.getDefaultPracticalInfo(),
        similarDestinations: []
      },
      metadata: {
        dataQuality: {
          dataFreshness: 0,
          sourceReliability: 0,
          userValidation: 0,
          expertReview: 0,
          crossReferenceAccuracy: 0,
          overallScore: 0
        },
        lastUpdated: new Date(),
        sources: [],
        confidence: 0,
        searchTime
      },
      status: {
        code: 500,
        message: error instanceof Error ? error.message : 'Search failed',
        warnings: ['Search system temporarily unavailable']
      }
    };
  }

  private getDefaultPracticalInfo(): PracticalInformation {
    return {
      emergencyNumbers: {
        police: '911',
        medical: '911',
        fire: '911',
        tourist: 'Contact local tourism office'
      },
      businessHours: {
        general: '9:00 AM - 6:00 PM',
        restaurants: '11:00 AM - 10:00 PM',
        shops: '10:00 AM - 8:00 PM',
        government: '9:00 AM - 5:00 PM (Mon-Fri)',
        banks: '9:00 AM - 4:00 PM (Mon-Fri)'
      },
      healthAndSafety: {
        vaccinations: [],
        commonRisks: [],
        medicalFacilities: [],
        pharmacies: [],
        drinkingWater: 'Check local recommendations'
      },
      connectivity: {
        internetAvailability: 'Variable',
        wifiCommon: true,
        simCards: [],
        internetCafes: false,
        dataRoaming: 'Check with provider'
      }
    };
  }

  private getMinimalTravelLaws() {
    return {
      immigration: {
        visaRequired: true,
        visaTypes: ['Tourist'],
        maxStayDuration: 90,
        entryRestrictions: ['Valid passport required'],
        customsRegulations: ['Standard customs apply'],
        healthRequirements: ['Check requirements']
      },
      transportation: {
        drivingLaws: ['Valid license required'],
        publicTransportRules: ['Follow local rules'],
        rideSharingRegulations: ['Use official services'],
        cyclingRules: ['Follow traffic laws'],
        walkingRegulations: ['Use crosswalks']
      },
      accommodation: {
        hotelRegistration: ['ID required'],
        shortTermRentals: ['Check regulations'],
        guestObligations: ['Respect property'],
        touristTax: ['May apply']
      },
      publicBehavior: {
        noiseOrdinances: ['Respect quiet hours'],
        alcoholRestrictions: ['Check local laws'],
        smokingBans: ['No smoking indoors'],
        publicDisplayRestrictions: ['Be respectful'],
        dressCodes: ['Dress appropriately']
      },
      photography: {
        restrictedAreas: ['Government buildings'],
        permitsRequired: ['Commercial use'],
        privacyLaws: ['Respect privacy'],
        commercialRestrictions: ['Get permission']
      },
      shopping: {
        taxRefunds: ['Keep receipts'],
        customsDeclaration: ['Declare purchases'],
        restrictedItems: ['Check prohibited items'],
        bargainingEtiquette: ['Respect local customs']
      },
      penalties: {
        commonViolations: [],
        contactAuthorities: ['Local police'],
        emergencyProcedures: ['Contact embassy'],
        embassyContacts: ['Check embassy info']
      }
    };
  }

  private getMinimalCulturalNorms() {
    return {
      etiquette: ['Be respectful'],
      taboos: ['Avoid offensive behavior'],
      dressCode: {
        general: 'Dress appropriately',
        religious: 'Conservative dress',
        business: 'Business attire',
        formal: 'Formal wear',
        beach: 'Appropriate swimwear'
      },
      religiousConsiderations: ['Respect religious practices'],
      businessCulture: ['Be professional'],
      socialInteractions: ['Be polite'],
      giftGiving: ['Small gifts acceptable'],
      diningEtiquette: ['Follow local customs']
    };
  }

  private getMinimalEconomicData() {
    return {
      averageDailyCost: 50,
      accommodationCosts: { budget: 25, midRange: 75, luxury: 200 },
      mealCosts: { streetFood: 5, restaurant: 15, fineining: 50 },
      transportCosts: { local: 2, taxi: 10, longDistance: 25 },
      tippingGuide: '10-15% standard'
    };
  }

  private getMinimalClimate() {
    return {
      averageTemperature: {},
      rainySeasons: [],
      bestWeather: ['Year-round'],
      packingRecommendations: {}
    };
  }

  private getMinimalLanguageGuide(language: string) {
    return {
      primaryLanguage: language,
      essentialPhrases: [],
      communicationTips: ['Speak slowly'],
      writingSystem: 'Latin'
    };
  }
}

// Singleton instance
export const intelligentSearchEngine = new IntelligentSearchEngine();