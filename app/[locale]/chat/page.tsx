'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations, useLocale } from 'next-intl';
import RealTimeAssistant from '@/components/RealTimeAssistant';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/UserMenu';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export default function ChatPage() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    } else {
      return localStorage.getItem('voiceEnabled') === 'true';
    }
    return false;
  });
  const [globalListening, setGlobalListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const t = useTranslations();
  const testElevenLabs = trpc.audio.testElevenLabs.useQuery();
  
  // Check for browser speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 
                                  'SpeechRecognition' in window;
      if (!hasSpeechRecognition) {
        console.log('Speech recognition not supported in this browser');
      }
    }
  }, []);

  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        // Handle global voice commands
        const lowerTranscript = transcript.toLowerCase();
        if (lowerTranscript.includes('go to explore') || lowerTranscript.includes('show explore')) {
          window.location.href = getLocalizedPath('/explore');
          return;
        } else if (lowerTranscript.includes('go to laws') || lowerTranscript.includes('show laws')) {
          window.location.href = getLocalizedPath('/explore?tab=laws');
          return;
        } else if (lowerTranscript.includes('go home') || lowerTranscript.includes('back to home')) {
          window.location.href = getLocalizedPath('/');
          return;
        } else if (lowerTranscript.includes('toggle chat') || lowerTranscript.includes('minimize chat') || 
                  lowerTranscript.includes('maximize chat')) {
          setIsMinimized(!isMinimized);
          return;
        }
        
        // Any other commands will be passed to the chat assistant
        // Simulate sending the message to the chat assistant
        const chatInput = document.querySelector('textarea, input[type="text"]') as HTMLTextAreaElement | HTMLInputElement | null;
        if (chatInput) {
          chatInput.value = transcript;
          chatInput.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Simulate form submission after a short delay
          setTimeout(() => {
            const form = chatInput.closest('form');
            if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
          }, 500);
        }
        
        setGlobalListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setGlobalListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setGlobalListening(false);
      };
    }
  }, []);

  const toggleGlobalVoiceInput = () => {
    if (globalListening) {
      recognitionRef.current?.stop();
      setGlobalListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setGlobalListening(true);
      } else {
        alert('Speech recognition not supported in this browser');
      }
    }
  };
  
  const toggleVoiceEnabled = () => {
    setVoiceEnabled(prev => !prev);
    // Announce the change
    if (!voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance("Voice control enabled. You can now navigate the app using voice commands.");
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild aria-label="Back to home">
            <Link href={getLocalizedPath('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">{t('chat.title')}</h1>
              <p className="text-sm text-gray-500">{t('chat.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`relative h-8 ${globalListening ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
            onClick={toggleGlobalVoiceInput}
            aria-label={globalListening ? 'Stop voice input' : 'Start voice input'}
          >
            <Mic className={`h-4 w-4 ${globalListening ? 'text-red-600' : ''}`} />
            {globalListening && (
              <motion.div
                className="absolute inset-0 rounded-md"
                animate={{ boxShadow: ['0 0 0 0 rgba(220, 38, 38, 0)', '0 0 0 4px rgba(220, 38, 38, 0.3)'] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </Button>
          
          <Button 
            variant={voiceEnabled ? 'default' : 'outline'} 
            size="sm"
            className="h-8"
            onClick={toggleVoiceEnabled}
            aria-label={voiceEnabled ? 'Disable voice control' : 'Enable voice control'}
            title={voiceEnabled ? 'Voice control enabled' : 'Enable voice control'}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          
          <LanguageSwitcher variant="compact" />
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 h-[calc(100vh-73px)]">
        {voiceEnabled && (
          <div className="mb-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Volume2 className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                {globalListening 
                  ? "Listening for voice commands... Try saying: 'go to explore', 'show laws', 'go home'" 
                  : "Voice control enabled. Click the microphone icon or say 'Hey Assistant' to start voice commands."}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto h-full"
        >
          <RealTimeAssistant
            initialLocation={currentLocation}
            onLocationChange={setCurrentLocation}
            isMinimized={isMinimized}
            onToggleSize={() => setIsMinimized(prev => !prev)}
            className="h-full"
            voiceEnabled={voiceEnabled}
          />
        </motion.div>
      </div>
      
      {/* Hidden audio resources */}
      <audio src="/sounds/message-complete.mp3" style={{ display: 'none' }} preload="auto" />
    </div>
  );
}