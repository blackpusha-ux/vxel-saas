'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface AppContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  userCredits: number | null;
  setUserCredits: (credits: number | null) => void;
  refreshCredits: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('CAD');
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const { isSignedIn } = useAuth();

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('vxel_currency');
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('vxel_currency', newCurrency);
    window.dispatchEvent(new Event('vxel-settings-changed'));
  };

  // Fetch credits for logged in user
  const refreshCredits = useCallback(async () => {
    if (!isSignedIn) {
      setUserCredits(null);
      return;
    }
    try {
      const res = await fetch('/api/credits');
      const data = await res.json();
      if (data.success && typeof data.credits === 'number') {
        setUserCredits(data.credits);
      }
    } catch (e) {
      console.error('Error fetching user credits:', e);
    }
  }, [isSignedIn]);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency,
        userCredits,
        setUserCredits,
        refreshCredits,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
