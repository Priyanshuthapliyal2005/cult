'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, MapPin, Volume2, Copy, ThumbsUp, ThumbsDown, Mic, MicOff, Phone, VideoIcon, Settings, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import { useTranslations } from 'next-intl';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
  isTyping?: boolean;
  audioUrl?: string;
}

interface AssistantSettings {
  voice: boolean;
  autoSpeak: boolean;
  language: string;
  personality: 'friendly' | 'professional' | 'casual' | 'expert';
  responseSpeed: 'fast' | 'normal' | 'detailed';
}

interface RealTimeAssistantProps {
  initialLocation?: string;
  onLocationChange?: (location: string) => void;
  isMinimized?: boolean;
  onToggleSize?: () => void;
  className?: string;
}

export default function RealTimeAssistant({
  initialLocation,
  onLocationChange,
  isMinimized = false,
  onToggleSize,
  className = ''
}: RealTimeAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hello! I'm your real-time Cultural Intelligence Assistant. I'm here to help you navigate any destination with confidence. I have knowledge about 1000+ cities worldwide and can provide instant answers about local customs, translate phrases, suggest authentic experiences, and help you connect respectfully with local culture. What would you like to explore today?",
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState(initialLocation || '');
  const [settings, setSettings] = useState<AssistantSettings>({
    voice: false,
    autoSpeak: false,
    language: 'en',
    personality: 'friendly',
    responseSpeed: 'normal'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const t = useTranslations();
  
  const sendMessage = trpc.sendMessage.useMutation();
  const generateAudio = trpc.audio.generatePhraseAudio.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Add typing indicator
      const typingMessage: Message = {
        id: 'typing',
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true
      };
      setMessages(prev => [...prev, typingMessage]);

      const response = await sendMessage.mutateAsync({
        conversationId: conversationId || undefined,
        message: input,
        location: currentLocation,
      });

      if (!conversationId) {
        setConversationId(response.conversationId);
      }

      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const assistantMessage: Message = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      // Simulate typing effect for response
      await simulateTyping(assistantMessage);

      // Auto-speak if enabled
      if (settings.autoSpeak && settings.voice) {
        await playAudio(response.response);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: "I apologize, but I'm experiencing some technical difficulties. Let me help you with what I can from my knowledge base. What specific cultural question can I assist you with?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const simulateTyping = async (message: Message) => {
    const words = message.content.split(' ');
    let currentContent = '';
    
    const typingMessage: Message = {
      ...message,
      content: '',
      isTyping: true
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    for (let i = 0; i < words.length; i++) {
      currentContent += (i > 0 ? ' ' : '') + words[i];
      
      setMessages(prev => prev.map(m => 
        m.id === message.id 
          ? { ...m, content: currentContent, isTyping: i < words.length - 1 }
          : m
      ));
      
      // Vary typing speed based on settings
      const delay = settings.responseSpeed === 'fast' ? 50 : 
                   settings.responseSpeed === 'normal' ? 100 : 150;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert('Speech recognition not supported in this browser');
      }
    }
  };

  const playAudio = async (text: string) => {
    try {
      const result = await generateAudio.mutateAsync({
        text: text.slice(0, 200), // Limit for demo
        language: settings.language,
      });
      
      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleLocationChange = (newLocation: string) => {
    setCurrentLocation(newLocation);
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  };

  const quickActions = [
    "What are the cultural customs in Tokyo?",
    "Help me with essential Hindi phrases",
    "What's the best way to greet locals in India?",
    "Tell me about cultural etiquette in Paris",
    "Recommend authentic experiences in Bali",
    "What festivals happen in Pushkar?",
    "Help me navigate like a local in any city",
    "What traditional food should I try?"
  ];

  const personalities = {
    friendly: { name: "Friendly Guide", emoji: "😊", description: "Warm and encouraging" },
    professional: { name: "Expert Advisor", emoji: "🎓", description: "Detailed and informative" },
    casual: { name: "Travel Buddy", emoji: "🤙", description: "Relaxed and conversational" },
    expert: { name: "Cultural Scholar", emoji: "📚", description: "In-depth cultural insights" }
  };

  if (isMinimized) {
    return (
      <Card className={`w-80 ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm">Cultural Assistant</CardTitle>
                <div className="text-xs text-gray-500">
                  {isTyping ? 'Typing...' : 'Ready to help'}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onToggleSize}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about culture..."
              className="flex-1 text-sm"
              disabled={isLoading}
            />
            <Button type="submit" size="sm" disabled={!input.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Bot className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Cultural Intelligence Assistant</span>
                <span className="text-lg">{personalities[settings.personality].emoji}</span>
              </CardTitle>
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span>
                  {isTyping ? 'Typing...' : 
                   isLoading ? 'Thinking...' : 
                   'Ready to help'}
                </span>
                {currentLocation && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{currentLocation}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Tabs defaultValue="chat" className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
            {onToggleSize && (
              <Button variant="ghost" size="sm" onClick={onToggleSize}>
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsContent value="chat" className="flex-1 flex flex-col">
            {/* Location Input */}
            {currentLocation !== undefined && (
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <Input
                    value={currentLocation}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="Enter your current location..."
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-xs md:max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="w-8 h-8 mx-2 shrink-0">
                        <AvatarFallback className={message.role === 'user' ? 'bg-blue-100' : 'bg-purple-100'}>
                          {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <Card className={`${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border-gray-200'}`}>
                        <CardContent className="p-3">
                          {message.isTyping ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">{message.content}</span>
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.role === 'assistant' && !message.isTyping && (
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                  onClick={() => handleCopy(message.content)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                  onClick={() => playAudio(message.content)}
                                  disabled={generateAudio.isLoading}
                                >
                                  <Volume2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-green-600"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Quick cultural questions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {quickActions.slice(0, 4).map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start h-auto py-2 px-3 whitespace-normal text-left"
                      onClick={() => setInput(action)}
                      disabled={isLoading}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about local culture, customs, or travel advice..."
                    className="min-h-[44px] max-h-32 resize-none pr-20 border-2 border-gray-200 focus:border-blue-500"
                    rows={1}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="absolute right-2 top-2 flex space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={toggleVoiceInput}
                      disabled={isLoading}
                    >
                      {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-11 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 p-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Assistant Settings</h3>
              
              {/* Personality */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium">Assistant Personality</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(personalities).map(([key, personality]) => (
                    <Button
                      key={key}
                      variant={settings.personality === key ? 'default' : 'outline'}
                      onClick={() => setSettings(prev => ({ ...prev, personality: key as any }))}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-lg mb-1">{personality.emoji}</span>
                      <span className="text-xs">{personality.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Voice Settings */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium">Voice & Audio</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable voice responses</span>
                  <Switch
                    checked={settings.voice}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, voice: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-speak responses</span>
                  <Switch
                    checked={settings.autoSpeak}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSpeak: checked }))}
                    disabled={!settings.voice}
                  />
                </div>
              </div>

              {/* Response Speed */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Response Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['fast', 'normal', 'detailed'] as const).map((speed) => (
                    <Button
                      key={speed}
                      variant={settings.responseSpeed === speed ? 'default' : 'outline'}
                      onClick={() => setSettings(prev => ({ ...prev, responseSpeed: speed }))}
                      className="text-xs capitalize"
                    >
                      {speed}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}