import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export class GeminiService {
  private model: any;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async getCulturalInsights(request: CulturalInsightRequest): Promise<CulturalInsightResponse> {
    if (!process.env.GEMINI_API_KEY || !this.model) {
      throw new Error('Gemini API key is not configured');
    }

    const prompt = `As a cultural intelligence expert, provide comprehensive cultural insights for ${request.location}. 
    
    Focus on accurate, respectful, and practical information that helps travelers understand and appreciate local culture.
    
    Structure your response as a JSON object with the following format:
    
    {
      "customs": {
        "title": "Local Customs & Etiquette",
        "description": "Brief overview of cultural norms and social expectations",
        "dos": ["List of respectful behaviors and customs to follow"],
        "donts": ["List of behaviors to avoid or cultural taboos"]
      },
      "laws": {
        "title": "Important Laws & Regulations",
        "legal": ["Legal requirements and restrictions tourists must follow"],
        "cultural": ["Cultural rules and expectations in the community"],
        "guidelines": ["Local guidelines and etiquette for respectful behavior"],
        "penalties": ["Potential consequences for violating local laws or customs"]
      },
      "events": {
        "title": "Cultural Events & Festivals",
        "current_events": [{"name": "Event name", "date": "Date/period", "description": "Brief description"}],
        "seasonal_festivals": [{"name": "Festival name", "season": "Season/time", "description": "Cultural significance"}]
      },
      "phrases": {
        "title": "Essential Phrases",
        "essential_phrases": [{"english": "English phrase", "local": "Local language", "pronunciation": "Phonetic pronunciation"}]
      },
      "recommendations": {
        "title": "Local Recommendations",
        "restaurants": [{"name": "Restaurant name", "type": "Cuisine type", "description": "Why it's recommended"}],
        "attractions": [{"name": "Attraction name", "type": "Type of attraction", "description": "Cultural significance"}],
        "local_tips": ["Practical tips for visitors"]
      }
    }

    Include at least 5 items in each array. Ensure all information is accurate and culturally sensitive.
    ${request.latitude && request.longitude ? `Location coordinates: ${request.latitude}, ${request.longitude}` : ''}
    ${request.category ? `Focus particularly on: ${request.category}` : ''}
    
    Respond ONLY with valid JSON, no additional text.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the response - remove any markdown formatting
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();

      try {
        return JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', cleanText);
        throw new Error('Invalid response format from Gemini');
      }
    } catch (error) {
      console.error('Error getting cultural insights from Gemini:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get cultural insights from Gemini');
    }
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        status: 'demo',
        message: 'Gemini API key not configured - using demo mode'
      };
    }

    try {
      const result = await this.model.generateContent('Hello, this is a test message. Respond with "Connection successful".');
      const response = await result.response;
      await response.text();
      
      return {
        status: 'success',
        message: 'Gemini API connected successfully'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async generateLocationDescription(location: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not configured');
    }

    const prompt = `Provide a brief, engaging description of ${location} highlighting its cultural significance, main attractions, and what makes it special for travelers. Keep it under 100 words and focus on cultural aspects.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating location description:', error);
      throw new Error('Failed to generate location description');
    }
  }

  async generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    context?: any
  ): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not configured');
    }

    try {
      // Convert messages to a single prompt (Gemini doesn't support conversation history in the same way)
      const conversationPrompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      const result = await this.model.generateContent(conversationPrompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('Empty response from Gemini');
      }
      
      return text;
    } catch (error) {
      console.error('Error generating chat response with Gemini:', error);
      throw new Error('Failed to generate chat response');
    }
  }
}

// Singleton instance
export const geminiService = new GeminiService();