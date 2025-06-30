import { geminiService } from './gemini';
import { getGroqService } from './groq';
import { cityDatabase, type CityData } from './cityDatabase';
import { jsonrepair } from 'jsonrepair';
import { sanitizeAIJson } from './utils';

export interface CulturalInsightRequest {
  location: string;
  latitude?: number;
  longitude?: number;
  category?: string;
}

export interface CulturalInsightResponse {
  customs: {
    title: string;
    description: string;
    dos: string[];
    donts: string[];
  };
  laws: {
    title: string;
    legal: string[]; // Legal requirements and restrictions
    cultural: string[]; // Cultural rules and expectations 
    guidelines: string[]; // Local guidelines and etiquette
    penalties: string[]; // Potential penalties for violations
  };
  events: {
    title: string;
    current_events: Array<{
      name: string;
      date: string;
      description: string;
    }>;
    seasonal_festivals: Array<{
      name: string;
      season: string;
      description: string;
    }>;
  };
  phrases: {
    title: string;
    essential_phrases: Array<{
      english: string;
      local: string;
      pronunciation: string;
    }>;
  };
  recommendations: {
    title: string;
    restaurants: Array<{
      name: string;
      type: string;
      description: string;
    }>;
    attractions: Array<{
      name: string;
      type: string;
      description: string;
    }>;
    local_tips: string[];
  };
}

export class HybridAIService {
  constructor() {}

  /**
   * Get cultural insights using Gemini (primary) with Groq fallback
   */
  async getCulturalInsights(request: CulturalInsightRequest): Promise<CulturalInsightResponse> {
    // Try Gemini first for detailed cultural analysis
    try {
      const insights = await geminiService.getCulturalInsights(request);
      console.log('✅ Cultural insights generated using Gemini');
      return insights;
    } catch (geminiError) {
      console.log('❌ Gemini failed, trying Groq fallback:', geminiError);
      
      // Fallback to Groq with structured prompt
      try {
        const structuredPrompt = `Generate comprehensive cultural insights for ${request.location} in JSON format. Include customs (dos/donts), laws, events, essential phrases with pronunciation, and recommendations for restaurants/attractions. Make it detailed and culturally sensitive.`;
        
        const groqResponse = await getGroqService().generateQuickResponse(structuredPrompt);
        
        // Try to parse Groq response as JSON, using jsonrepair if needed
        try {
          let parsedResponse: CulturalInsightResponse;
          try {
            parsedResponse = JSON.parse(sanitizeAIJson(groqResponse));
          } catch (parseError) {
            // Try to repair and parse
            const repaired = jsonrepair(sanitizeAIJson(groqResponse));
            parsedResponse = JSON.parse(repaired);
          }
          console.log('✅ Cultural insights generated using Groq fallback');
          return parsedResponse;
        } catch (parseError) {
          console.log('❌ Groq response not valid JSON, returning minimal fallback');
          // Minimal fallback object
          return {
            customs: { title: '', description: '', dos: [], donts: [] },
            laws: { title: '', legal: [], cultural: [], guidelines: [], penalties: [] },
            events: { title: '', current_events: [], seasonal_festivals: [] },
            phrases: { title: '', essential_phrases: [] },
            recommendations: { title: '', restaurants: [], attractions: [], local_tips: [] }
          };
        }
      } catch (groqError) {
        console.log('❌ Both AI services failed:', groqError);
        // Minimal fallback object
        return {
          customs: { title: '', description: '', dos: [], donts: [] },
          laws: { title: '', legal: [], cultural: [], guidelines: [], penalties: [] },
          events: { title: '', current_events: [], seasonal_festivals: [] },
          phrases: { title: '', essential_phrases: [] },
          recommendations: { title: '', restaurants: [], attractions: [], local_tips: [] }
        };
      }
    }
  }

  /**
   * Generate chat responses using Groq (primary) with mock fallback
   */
  async generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    context?: any
  ): Promise<string> {
    // Try Groq first for fast conversational responses
    try {
      const response = await getGroqService().generateChatResponse(messages, context);
      console.log('✅ Chat response generated using Groq');
      return response;
    } catch (groqError) {
      console.log('❌ Groq failed, trying Gemini fallback:', groqError);
      
      // Fallback to Gemini for chat
      try {
        const lastMessage = messages[messages.length - 1];
        const conversationPrompt = `As a travel assistant, respond to this message: "${lastMessage.content}"
        ${context ? `Context: Location: ${context.location}, Coordinates: ${context.latitude}, ${context.longitude}` : ''}
        
        Provide a helpful, conversational response about travel and cultural topics. Keep it under 200 words.`;
        
        const response = await geminiService.generateChatResponse([
          { role: 'user', content: conversationPrompt }
        ]);
        
        if (response) {
          console.log('✅ Chat response generated using Gemini fallback');
          return response;
        }
        
        throw new Error('Gemini failed to generate response');
      } catch (geminiError) {
        console.log('❌ Both AI services failed, using mock response:', geminiError);
        
        // Ultimate fallback to general cultural response
        const lastMessage = messages[messages.length - 1];
        return generateFallbackResponse(lastMessage.content, context?.location);
      }
    }
  }

  /**
   * Test both AI services
   */
  async testServices(): Promise<{
    gemini: { status: string; message: string };
    groq: { status: string; message: string };
    overall: { status: string; message: string };
  }> {
    const [geminiTest, groqTest] = await Promise.all([
      geminiService.testConnection(),
      getGroqService().testConnection()
    ]);

    const successCount = [geminiTest, groqTest].filter(test => test.status === 'success').length;
    
    let overallStatus = 'error';
    let overallMessage = 'All AI services are unavailable';
    
    if (successCount === 2) {
      overallStatus = 'success';
      overallMessage = 'All AI services are operational';
    } else if (successCount === 1) {
      overallStatus = 'partial';
      overallMessage = 'Partial AI services available with fallbacks';
    } else if ([geminiTest, groqTest].some(test => test.status === 'demo')) {
      overallStatus = 'demo';
      overallMessage = 'AI services in demo mode';
    }

    return {
      gemini: geminiTest,
      groq: groqTest,
      overall: { status: overallStatus, message: overallMessage }
    };
  }

  /**
   * Generate location summary using available AI service
   */
  async generateLocationSummary(location: string): Promise<string> {
    try {
      // Try Groq first for quick summaries
      const prompt = `Write a brief, engaging 2-3 sentence summary of ${location} highlighting its cultural significance, main attractions, and what makes it special for travelers. Focus on authentic cultural experiences.`;
      
      const summary = await getGroqService().generateQuickResponse(prompt);
      return summary;
    } catch (groqError) {
      try {
        // Fallback to Gemini
        const summary = await geminiService.generateLocationDescription(location);
        return summary;
      } catch (geminiError) {
        return `${location} is a culturally rich destination with unique local traditions and experiences waiting to be discovered.`;
      }
    }
  }

  /**
   * Generate comprehensive city data for a location
   */
  async generateCityData(cityName: string, countryName?: string): Promise<CityData> {
    try {
      // Try Gemini first for structured data generation
      const result = await geminiService.generateChatResponse([
        {
          role: 'user',
          content: `Generate detailed travel data for ${cityName}${countryName ? `, ${countryName}` : ''} in JSON format including: name, country, region, coordinates, language, currency, attractions, cuisine, etc. Return ONLY valid JSON.`
        }
      ]);
      console.log('Gemini raw response:', result);
      // Parse JSON from Gemini response
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/) || 
                        result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0].replace(/```json\s*|\s*```/g, '');
        return JSON.parse(jsonStr);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (geminiError) {
      console.error('Gemini service failed, trying Groq fallback:', geminiError);
      try {
        const prompt = `Generate comprehensive travel and cultural data for ${cityName}${countryName ? `, ${countryName}` : ''} in JSON format.\n\nPlease provide detailed information with the following structure:\n{\n  "id": "${cityName.toLowerCase().replace(/\\s+/g, '-')}${countryName ? `-${countryName.toLowerCase().replace(/\\s+/g, '-')}` : ''}-generated",\n  "name": "${cityName}",\n  "country": "${countryName || ''}",\n  "region": "",\n  "latitude": 0,\n  "longitude": 0,\n  "population": 0,\n  "timezone": "",\n  "language": [""],\n  "currency": "",\n  "culture": "",\n  "image": "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=600",\n  "description": "",\n  "highlights": [""],\n  "rating": 4.5,\n  "costLevel": "moderate",\n  "bestTimeToVisit": [""],\n  "averageStay": 3,\n  "mainAttractions": [""],\n  "localCuisine": [""],\n  "transportOptions": [""],\n  "safetyRating": 8.0,\n  "touristFriendly": 8.5,\n  "emergencyNumbers": {\n    "police": "",\n    "medical": "",\n    "fire": "",\n    "tourist": ""\n  }\n}\n\nFocus on accuracy for location, cultural details, and practical information. If exact data is unavailable, provide reasonable estimates based on similar locations. Fill ALL fields with meaningful information.\n\nReturn ONLY valid JSON with no explanation or comments.`;
        const groqResult = await getGroqService().generateQuickResponse(prompt);
        console.log('Groq raw response:', groqResult);
        try {
          // Clean any markdown formatting and parse JSON, using jsonrepair if needed
          let cityObj: CityData;
          try {
            const cleanResponse = sanitizeAIJson(groqResult.replace(/```json\s*|\s*```/g, '').trim());
            cityObj = JSON.parse(cleanResponse);
          } catch (parseError) {
            const repaired = jsonrepair(sanitizeAIJson(groqResult));
            cityObj = JSON.parse(repaired);
          }
          return cityObj;
        } catch (parseError) {
          console.error('Failed to parse city data JSON from Groq:', parseError, 'Raw:', groqResult);
          // Fallback: return a minimal city object
          return {
            id: `${cityName.toLowerCase().replace(/\s+/g, '-')}${countryName ? `-${countryName.toLowerCase().replace(/\s+/g, '-')}` : ''}-generated`,
            name: cityName,
            country: countryName || '',
            region: '',
            latitude: 0,
            longitude: 0,
            population: 0,
            timezone: '',
            language: [''],
            currency: '',
            culture: '',
            image: '',
            description: '',
            highlights: [''],
            rating: 0,
            costLevel: 'moderate',
            bestTimeToVisit: [''],
            averageStay: 0,
            mainAttractions: [''],
            localCuisine: [''],
            transportOptions: [''],
            safetyRating: 0,
            touristFriendly: 0,
            emergencyNumbers: { police: '', medical: '', fire: '', tourist: '' }
          };
        }
      } catch (groqError) {
        console.error('Both AI services failed to generate city data:', groqError);
        // Fallback: return a minimal city object
        return {
          id: `${cityName.toLowerCase().replace(/\s+/g, '-')}${countryName ? `-${countryName.toLowerCase().replace(/\s+/g, '-')}` : ''}-generated`,
          name: cityName,
          country: countryName || '',
          region: '',
          latitude: 0,
          longitude: 0,
          population: 0,
          timezone: '',
          language: [''],
          currency: '',
          culture: '',
          image: '',
          description: '',
          highlights: [''],
          rating: 0,
          costLevel: 'moderate',
          bestTimeToVisit: [''],
          averageStay: 0,
          mainAttractions: [''],
          localCuisine: [''],
          transportOptions: [''],
          safetyRating: 0,
          touristFriendly: 0,
          emergencyNumbers: { police: '', medical: '', fire: '', tourist: '' }
        };
      }
    }
  }

  /**
   * Smart phrase translation with cultural context
   */
  async translateWithContext(phrase: string, targetLanguage: string, culturalContext?: string): Promise<string> {
    try {
      const contextualPrompt = `Translate "${phrase}" to ${targetLanguage} considering the cultural context: ${culturalContext || 'general travel'}. 
      
      Provide:
      1. Direct translation
      2. Phonetic pronunciation
      3. Cultural usage notes if applicable
      
      Format as: Translation | Pronunciation | Notes`;
      
      return await getGroqService().generateQuickResponse(contextualPrompt);
    } catch (error) {
      // Simple fallback
      return await getGroqService().translatePhrase(phrase, targetLanguage);
    }
  }
}

// Generate fallback responses based on city database
function generateFallbackResponse(message: string, location?: string | null): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    const sampleCities = cityDatabase.slice(0, 3).map(city => city.name).join(', ');
    return `Hello! I'm your Cultural Intelligence Assistant. I can help you discover amazing cultural insights about destinations like ${sampleCities} and many more from our database of 1000+ cities worldwide. What would you like to explore today?`;
  }
  
  if (location) {
    const city = cityDatabase.find(c => 
      c.name.toLowerCase().includes(location.toLowerCase())
    );
    if (city) {
      return `I'd be happy to help you learn about ${city.name}! This ${city.culture} destination in ${city.region}, ${city.country} is known for ${city.highlights.slice(0, 2).join(' and ')}. What specific cultural aspect would you like to know about?`;
    }
  }
  
  if (lowerMessage.includes('food') || lowerMessage.includes('restaurant')) {
    return "Each destination has unique culinary experiences! I can help you discover authentic local cuisines, traditional dishes, and recommended restaurants. Which destination's food scene interests you?";
  }
  
  if (lowerMessage.includes('festival') || lowerMessage.includes('event')) {
    return "Festivals and cultural events are amazing ways to experience local culture! I can provide information about traditional celebrations, seasonal festivals, and cultural events. Which destination or type of festival interests you?";
  }
  
  if (lowerMessage.includes('language') || lowerMessage.includes('phrase')) {
    return "Learning local phrases is a great way to connect with people! I can help you with essential phrases, pronunciation guides, and cultural communication tips. Which language or destination would you like help with?";
  }
  
  const availableCities = cityDatabase.slice(0, 5).map(city => city.name).join(', ');
  return `I'd be happy to help you learn about cultural aspects of destinations worldwide! I have information about ${availableCities} and many more cities. You can ask me about local customs, festivals, food, language phrases, or recommendations for any destination.`;
}
// Singleton instance
export const hybridAI = new HybridAIService();

// Legacy exports for backward compatibility
export const getCulturalInsights = (request: CulturalInsightRequest) => 
  hybridAI.getCulturalInsights(request);

export const generateChatResponse = (
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context?: any
) => hybridAI.generateChatResponse(messages, context);