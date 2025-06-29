'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

// Define context with default values to avoid null check issues
const defaultContextValue: VoiceCommandContextType = {
  isListening: false,
  startListening: () => {},
  stopListening: () => {},
  lastCommand: null,
  isVoiceEnabled: false,
  toggleVoiceEnabled: () => {},
  speak: () => {}
};

interface VoiceCommandContextType {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  lastCommand: string | null;
  isVoiceEnabled: boolean;
  toggleVoiceEnabled: () => void;
  speak: (text: string) => void;
}

const VoiceCommandContext = createContext<VoiceCommandContextType>(defaultContextValue);

export function useVoiceCommand() {
  const context = useContext(VoiceCommandContext);
  return context;
}

interface VoiceCommandProviderProps {
  children: ReactNode;
}

export function VoiceCommandProvider({ children }: VoiceCommandProviderProps) {
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    return false;  // Default to false, will update in useEffect
  });
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const locale = useLocale();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Now safe to use localStorage
    if (typeof localStorage !== 'undefined') {
      const storedValue = localStorage.getItem('voiceEnabled') === 'true';
      setIsVoiceEnabled(storedValue);
    }
  }, []);

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  useEffect(() => {
    if (!isMounted) return;
    
    if ('webkitSpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
      }
      
      if (!recognitionRef.current) return;
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setLastCommand(transcript);
        
        // Process voice commands
        processCommand(transcript);
        
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [router]);

  const toggleVoiceEnabled = () => {
    if (typeof window === 'undefined') return;
    if (!isMounted) return;

    setIsVoiceEnabled(!isVoiceEnabled);
    try {
      localStorage.setItem('voiceEnabled', (!isVoiceEnabled).toString());
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
    
    // Announce the change
    if (!isVoiceEnabled) {
      speak("Voice control enabled. You can now navigate the app using voice commands.");
    }
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !isMounted) return;
    
    try {
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for clarity
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  };

  const processCommand = (transcript: string) => {
    if (!isVoiceEnabled) return;
    
    const lowerText = transcript.toLowerCase();

    // Navigation commands
    if (lowerText.includes('go to explore') || lowerText.includes('show explore') || lowerText.includes('open explore')) {
      speak('Navigating to explore page');
      router.push(getLocalizedPath('/explore'));
    } else if (lowerText.includes('go to chat') || lowerText.includes('open chat')) {
      speak('Navigating to chat page');
      router.push(getLocalizedPath('/chat'));
    } else if (lowerText.includes('go to laws') || lowerText.includes('show laws')) {
      speak('Navigating to travel laws page');
      router.push(getLocalizedPath('/explore?tab=laws'));
    } else if (lowerText.includes('go home') || lowerText.includes('back to home')) {
      speak('Navigating to home page');
      router.push(getLocalizedPath('/'));
    } else if (lowerText.includes('search for')) {
      const searchTerm = lowerText.replace('search for', '').trim();
      if (searchTerm) {
        speak(`Searching for ${searchTerm}`);
        router.push(getLocalizedPath(`/explore?q=${encodeURIComponent(searchTerm)}`));
      }
    }
    
    // For other commands, we'll let the individual components handle them
  };

  return (
    <VoiceCommandContext.Provider
      value={{
        isListening,
        startListening,
        stopListening,
        lastCommand,
        isVoiceEnabled,
        toggleVoiceEnabled,
        speak
      }}
    >
      {children}
      
      {/* Voice listening indicator */}
      {isListening && isVoiceEnabled && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 animate-pulse">
          Listening...
        </div>
      )}
    </VoiceCommandContext.Provider>
  );
}