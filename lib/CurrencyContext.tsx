'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currencies, formatPrice, CurrencyCode } from './currencies';

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  formatPrice: (priceEUR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('EUR');

  useEffect(() => {
    const saved = localStorage.getItem('vexel_currency');
    if (saved && currencies[saved as CurrencyCode]) setCurrencyState(saved);
  }, []);

  const handleSetCurrency = (code: string) => {
    setCurrencyState(code);
    localStorage.setItem('vexel_currency', code);
  };

  const formatPriceFn = (priceEUR: number) => formatPrice(priceEUR, currency as CurrencyCode);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice: formatPriceFn }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency doit être utilisé dans CurrencyProvider');
  return context;
}
