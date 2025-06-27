import { geminiService } from './gemini';
import { groqService } from './groq';
import { cityDatabase } from './cityDatabase';

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
        
        const groqResponse = await groqService.generateQuickResponse(structuredPrompt);
        
        // Try to parse Groq response as JSON
        try {
          const parsedResponse = JSON.parse(groqResponse);
          console.log('✅ Cultural insights generated using Groq fallback');
          return parsedResponse;
        } catch (parseError) {
          console.log('❌ Groq response not valid JSON, using mock fallback');
          throw new Error('Both AI services failed to generate valid cultural insights');
        }
      } catch (groqError) {
        console.log('❌ Both AI services failed:', groqError);
        throw new Error('AI services are currently unavailable for cultural insights');
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
      const response = await groqService.generateChatResponse(messages, context);
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
      groqService.testConnection()
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
      const summary = await groqService.generateQuickResponse(
        `Write a brief, engaging 2-sentence summary of ${location} highlighting its cultural significance and what makes it special for travelers.`
      );
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
      
      return await groqService.generateQuickResponse(contextualPrompt);
    } catch (error) {
      // Simple fallback
      return await groqService.translatePhrase(phrase, targetLanguage);
    }
  }
}

// Generate fallback responses based on city database
function generateFallbackResponse(message: string, location?: string): string {
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