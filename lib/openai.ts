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
  const prompt = `Provide comprehensive cultural insights for ${request.location}. 
  Include local customs, important laws, current events, essential phrases with pronunciation, 
  and local recommendations. Format as JSON with the following structure:
  
  {
    "customs": {
      "title": "Local Customs & Etiquette",
      "description": "Brief overview",
      "dos": ["List of things to do"],
      "donts": ["List of things to avoid"]
    },
    "laws": {
      "title": "Important Laws & Regulations",
      "important_regulations": ["Key laws to know"],
      "legal_considerations": ["Legal considerations for tourists"]
    },
    "events": {
      "title": "Cultural Events & Festivals",
      "current_events": [{"name": "", "date": "", "description": ""}],
      "seasonal_festivals": [{"name": "", "season": "", "description": ""}]
    },
    "phrases": {
      "title": "Essential Phrases",
      "essential_phrases": [{"english": "", "local": "", "pronunciation": ""}]
    },
    "recommendations": {
      "title": "Local Recommendations",
      "restaurants": [{"name": "", "type": "", "description": ""}],
      "attractions": [{"name": "", "type": "", "description": ""}],
      "local_tips": ["Helpful local tips"]
    }
  }`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
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

    return JSON.parse(content);
  } catch (error) {
    console.error('Error getting cultural insights:', error);
    throw error;
  }
}

export async function generateChatResponse(
  messages: Array<{ role: string; content: string }>,
  context?: any
): Promise<string> {
  try {
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful travel assistant with deep cultural knowledge. 
      Provide accurate, respectful, and practical advice about travel destinations, 
      local customs, and cultural experiences. Be conversational and engaging while 
      maintaining accuracy. ${context ? `Context: ${JSON.stringify(context)}` : ''}`,
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [systemMessage, ...messages],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'I apologize, but I encountered an error processing your request. Please try again.';
  }
}