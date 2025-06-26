import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function getCulturalInsights(
  request: CulturalInsightRequest
): Promise<CulturalInsightResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `Provide comprehensive cultural insights for ${request.location}. 
  Include local customs, important laws, current events, essential phrases with pronunciation, 
  and local recommendations. Format as JSON with the following structure:
  
  {
    "customs": {
      "title": "Local Customs & Etiquette",
      "description": "Brief overview of cultural norms and social expectations",
      "dos": ["List of respectful behaviors and customs to follow"],
      "donts": ["List of behaviors to avoid or cultural taboos"]
    },
    "laws": {
      "title": "Important Laws & Regulations",
      "important_regulations": ["Key laws tourists should be aware of"],
      "legal_considerations": ["Legal considerations and requirements for visitors"]
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

  Provide accurate, respectful, and helpful information. Include at least 3-5 items in each array.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a cultural intelligence assistant providing accurate, respectful, and helpful information about different cultures and locations. Always provide responses in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from AI service');
    }
  } catch (error) {
    console.error('Error getting cultural insights:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get cultural insights');
  }
}

export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context?: any
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful travel assistant with deep cultural knowledge. 
      Provide accurate, respectful, and practical advice about travel destinations, 
      local customs, and cultural experiences. Be conversational and engaging while 
      maintaining accuracy. Focus on cultural sensitivity and authentic experiences.
      ${context ? `Context: Location: ${context.location || 'Unknown'}, Coordinates: ${context.latitude || 'N/A'}, ${context.longitude || 'N/A'}` : ''}`,
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
  } catch (error) {
    console.error('Error generating chat response:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('AI service is not properly configured');
    }
    throw new Error('Failed to generate response. Please try again.');
  }
}