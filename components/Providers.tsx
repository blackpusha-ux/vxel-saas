'use client';

// ============================================================================
// Providers.tsx — Wrapper client unique pour tous les Context Providers
// Ce composant est 'use client', donc il peut importer d'autres client components.
// app/layout.tsx (Server Component) l'importe proprement sans conflit Next.js.
// ============================================================================

import React from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import { AppProvider } from '@/contexts/AppContext';
import ChatWidget from '@/components/ChatWidget';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <LanguageProvider>
        <CurrencyProvider>
          {children}
          <ChatWidget />
        </CurrencyProvider>
      </LanguageProvider>
    </AppProvider>
  );
}

