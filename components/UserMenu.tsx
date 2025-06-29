'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { User, Settings, LogOut, Heart, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { useLocale } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function UserMenu() {
  // Add voice control state
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('voiceEnabled') === 'true';
    }
    return false;
  });
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const locale = useLocale();

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
    setIsLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link href={getLocalizedPath('/auth/signin')}>Sign In</Link>
        </Button>
        <Button asChild>
          <Link href={getLocalizedPath('/auth/signup')}>Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-gray-100 transition-all duration-300">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || ''} alt={user?.name || ''} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 border-0 shadow-lg rounded-lg overflow-hidden" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={getLocalizedPath('/profile')} className="cursor-pointer">
            <User className="mr-2 h-4 w-4 text-blueberry" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={getLocalizedPath('/chat')} className="cursor-pointer">
            <MessageCircle className="mr-2 h-4 w-4 text-ube" />
            <span>My Conversations</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={getLocalizedPath('/favorites')} className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4 text-dragonfruit" />
            <span>Favorites</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={getLocalizedPath('/settings')} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4 text-tangarine" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setVoiceEnabled(!voiceEnabled);
            if (typeof window !== 'undefined') {
              localStorage.setItem('voiceEnabled', (!voiceEnabled).toString());
            }
            // Announce the change
            if (!voiceEnabled) {
              const utterance = new SpeechSynthesisUtterance("Voice control enabled");
              window.speechSynthesis.speak(utterance);
            }
          }}
        >
          {voiceEnabled ? (
            <>
              <VolumeX className="mr-2 h-4 w-4 text-green-600" />
              <span>Disable Voice Control</span>
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4 text-gray-600" />
              <span>Enable Voice Control</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleSignOut}
          disabled={isLoading}
          className="text-gray-700 hover:text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4 text-gray-600" />
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}