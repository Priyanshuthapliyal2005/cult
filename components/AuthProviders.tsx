'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { VoiceCommandProvider } from '@/components/VoiceCommandProvider';
import { useEffect, useState } from 'react';

export default function AuthProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Ensure we only render on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same structure to avoid layout shift
    return <>{children}</>;
  }

  return (
    <SessionProvider>
      <AuthProvider>
        <VoiceCommandProvider>
          {children}
        </VoiceCommandProvider>
      </AuthProvider>
    </SessionProvider>
  );
}