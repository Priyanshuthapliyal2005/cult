import { geminiService } from './gemini';
import { groqService } from './groq';
import { getChatResponse } from './mockData';

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
    important_regulations: string[];
    legal_considerations: string[];
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
        
        const geminiResult = await geminiService.model?.generateContent(conversationPrompt);
        const response = await geminiResult?.response?.text();
        
        if (response) {
          console.log('✅ Chat response generated using Gemini fallback');
          return response;
        }
        
        throw new Error('Gemini failed to generate response');
      } catch (geminiError) {
        console.log('❌ Both AI services failed, using mock response:', geminiError);
        
        // Ultimate fallback to mock responses
        const lastMessage = messages[messages.length - 1];
        return getChatResponse(lastMessage.content, context?.location);
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

// Singleton instance
export const hybridAI = new HybridAIService();

// Legacy exports for backward compatibility
export const getCulturalInsights = (request: CulturalInsightRequest) => 
  hybridAI.getCulturalInsights(request);

export const generateChatResponse = (
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context?: any
) => hybridAI.generateChatResponse(messages, context);