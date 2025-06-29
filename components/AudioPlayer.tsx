'use client';

import { useState, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { playAudioFromBase64 } from '@/lib/elevenlabs';

interface AudioPlayerProps {
  text: string;
  language?: string;
  voiceId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export default function AudioPlayer({
  text,
  language = 'en',
  voiceId,
  className = '',
  size = 'sm',
  variant = 'ghost'
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateAudio = trpc.audio.generatePhraseAudio.useMutation();
  const testElevenLabs = trpc.audio.testElevenLabs.useQuery();

  const handlePlay = async () => {
    if (isPlaying) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    setError(null);
    setIsPlaying(true);

    try {
      // Check if ElevenLabs is available
      if (testElevenLabs.data?.status !== 'success') {
        // Show demo message
        // Use browser's speech synthesis API as fallback
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language if provided
        if (language) {
          utterance.lang = language.includes('-') ? language : mapLanguageCode(language);
        }
        
        // Adjust voice parameters
        utterance.rate = 0.9; // Slightly slower for better pronunciation
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
        setIsPlaying(false);
        return;
      }

      const result = await generateAudio.mutateAsync({
        text,
        language,
        voiceId,
      });

      if (result.audioUrl) {
        await playAudioFromBase64(result.audioUrl);
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setError(error instanceof Error ? error.message : 'Audio playback failed');
      
      // Fallback to demo message
      alert(`🔊 Audio pronunciation for "${text}" would play here!\n\nError: ${error instanceof Error ? error.message : 'Playback failed'}`);
    } finally {
      setIsPlaying(false);
    }
  };

  const sizeClasses = {
    sm: 'h-6 w-6 p-0',
    md: 'h-8 w-8 p-0',
    lg: 'h-10 w-10 p-0'
  };
  
  // Helper function to map common language names to BCP 47 language codes
  const mapLanguageCode = (lang: string): string => {
    const languageMap: Record<string, string> = {
      'english': 'en-US',
      'en': 'en-US',
      'hindi': 'hi-IN',
      'hi': 'hi-IN',
      'spanish': 'es-ES',
      'es': 'es-ES',
      'french': 'fr-FR',
      'fr': 'fr-FR',
      'japanese': 'ja-JP',
      'ja': 'ja-JP',
      'chinese': 'zh-CN',
      'zh': 'zh-CN',
      'german': 'de-DE',
      'de': 'de-DE'
    };
    
    return languageMap[lang.toLowerCase()] || 'en-US';
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Button
      variant={variant}
      size="sm"
      className={`${sizeClasses[size]} ${className} ${error ? 'text-red-500 hover:text-red-600' : 'hover:bg-blue-100'}`}
      onClick={handlePlay}
      disabled={generateAudio.isLoading}
      title={`Play pronunciation: ${text}`}
    >
      {generateAudio.isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isPlaying ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </Button>
  );
}