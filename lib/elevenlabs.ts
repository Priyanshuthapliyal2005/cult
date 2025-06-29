export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
}

export interface TextToSpeechRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw new Error('Failed to fetch available voices');
    }
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const voiceId = request.voice_id || 'pNInz6obpgDQGcFmaJgB'; // Default voice (Adam)
    
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: request.text,
          model_id: request.model_id || 'eleven_monolingual_v1',
          voice_settings: request.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech audio');
    }
  }

  async generatePhraseAudio(
    text: string, 
    language: string = 'en',
    voiceId?: string,
    stability: number = 0.6,
    similarityBoost: number = 0.8
  ): Promise<string> {
    try {
      const audioBuffer = await this.textToSpeech({
        text,
        voice_id: voiceId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style: 0.2,
          use_speaker_boost: true,
        },
      });

      // Convert ArrayBuffer to base64 for client-side playback
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      return `data:audio/mpeg;base64,${base64Audio}`;
    } catch (error) {
      console.error('Error generating phrase audio:', error);
      throw error;
    }
  }

  // Get appropriate voice for language/region
  getVoiceForLanguage(language: string, region?: string): string {
    const voiceMap: Record<string, string> = {
      'en': 'pNInz6obpgDQGcFmaJgB', // Adam - English
      'en-US': 'pNInz6obpgDQGcFmaJgB', // Adam - American English
      'en-GB': 'N2lVS1w4EtoT3dr4eOWO', // Callum - British English
      'hi': 'pNInz6obpgDQGcFmaJgB', // Using Adam for Hindi (can be customized)
      'es': 'VR6AewLTigWG4xSOukaG', // Antoni - Spanish
      'fr': 'QDwYtRuNnU7EJ2bnLimR', // Nicole - French
      'de': 'ErXwobaYiN019PkySvjV', // Antoni - German
      'it': 'AZnzlk1XvdvUeBnXmlld', // Domi - Italian
      'pt': 'yoZ06aMxZJJ28mfd3POQ', // Sam - Portuguese
      'ja': 'CYw3kZ02Hs0563khs1Fj', // Matilda - Japanese
      'ko': 'g5CIjZEefAph4nQFvHAz', // Bill - Korean
      'zh': 'onwK4e9ZLuTAKqWW03F9', // Daniel - Chinese
    };

    return voiceMap[language] || voiceMap['en'];
  }

  // Test connection to ElevenLabs API
  async testConnection(): Promise<{ status: string; message: string }> {
    if (!this.apiKey) {
      return {
        status: 'fallback',
        message: 'ElevenLabs API key not configured - using browser speech synthesis as fallback'
      };
    }

    try {
      await this.getVoices();
      return {
        status: 'success',
        message: 'ElevenLabs API connected successfully'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }
}

// Singleton instance
export const elevenLabsService = new ElevenLabsService();

// Helper function for client-side audio playback
export const playAudioFromBase64 = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(base64Audio);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Audio playback failed'));
      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Cache management for audio files
export class AudioCache {
  private cache = new Map<string, string>();
  private maxSize = 100; // Maximum number of cached audio files

  getCacheKey(text: string, language: string, voiceId?: string): string {
    return `${text}-${language}-${voiceId || 'default'}`;
  }

  get(text: string, language: string, voiceId?: string): string | null {
    const key = this.getCacheKey(text, language, voiceId);
    return this.cache.get(key) || null;
  }

  set(text: string, language: string, audioData: string, voiceId?: string): void {
    const key = this.getCacheKey(text, language, voiceId);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, audioData);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const audioCache = new AudioCache();