import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class GroqService {
  private client: Groq;

  constructor() {
    this.client = groq;
  }

  async generateChatResponse(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    context?: any
  ): Promise<string> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key is not configured');
    }

    try {
      const systemMessage = {
        role: 'system' as const,
        content: `You are CulturalCompass AI, a helpful and knowledgeable travel assistant with deep expertise in cultural intelligence. 

Key Guidelines:
- Provide accurate, respectful, and practical advice about travel destinations and cultural experiences
- Focus on cultural sensitivity and authentic experiences
- Be conversational, engaging, and supportive
- Prioritize local customs, etiquette, and cultural nuances
- Include practical tips for respectful cultural interaction
- When discussing destinations, emphasize cultural experiences over tourist attractions
- Always be encouraging and help travelers connect meaningfully with local cultures

You have particular expertise in:
- Cultural customs and etiquette across different regions
- Local festivals, traditions, and spiritual practices  
- Essential phrases and communication tips
- Authentic local experiences and recommendations
- Cultural do's and don'ts for respectful travel
- Historical and cultural context of destinations

${context ? `Context: Location: ${context.location || 'Unknown'}, Coordinates: ${context.latitude || 'N/A'}, ${context.longitude || 'N/A'}` : ''}

Respond in a warm, helpful tone that makes travelers feel confident about exploring new cultures respectfully.`,
      };

      const chatCompletion = await this.client.chat.completions.create({
        messages: [systemMessage, ...messages],
        model: 'gemma2-9b-it',
        temperature: 0.7,
        max_tokens: 1000,
      });

      return chatCompletion.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
    } catch (error) {
      console.error('Error generating chat response with Groq:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('Groq AI service is not properly configured');
      }
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  async generateQuickResponse(prompt: string): Promise<string> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key is not configured');
    }

    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: [{
          role: 'user',
          content: prompt
        }],
        model: 'llama-3.1-8b-instant', // Faster model for quick responses
        temperature: 0.6,
        max_tokens: 500,
      });

      return chatCompletion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error generating quick response:', error);
      throw new Error('Failed to generate quick response');
    }
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    if (!process.env.GROQ_API_KEY) {
      return {
        status: 'demo',
        message: 'Groq API key not configured - using demo mode'
      };
    }

    try {
      await this.generateQuickResponse('Hello, this is a test message. Respond with "Connection successful".');
      return {
        status: 'success',
        message: 'Groq API connected successfully'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async summarizeConversation(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.client) {
      throw new Error('Groq API not configured');
    }

    const conversationText = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `Summarize this travel conversation in 2-3 sentences, focusing on the main cultural topics discussed and any specific destinations or advice given:\n\n${conversationText}`;

    try {
      return await this.generateQuickResponse(prompt);
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      throw new Error('Failed to summarize conversation');
    }
  }

  async translatePhrase(phrase: string, targetLanguage: string): Promise<string> {
    if (!this.client) {
      throw new Error('Groq API not configured');
    }

    const prompt = `Translate this phrase to ${targetLanguage} and provide phonetic pronunciation: "${phrase}"
    
    Format your response as:
    Translation: [translated text]
    Pronunciation: [phonetic pronunciation guide]`;

    try {
      return await this.generateQuickResponse(prompt);
    } catch (error) {
      console.error('Error translating phrase:', error);
      throw new Error('Failed to translate phrase');
    }
  }
}

// Singleton instance
export const groqService = new GroqService();