'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, dictionary, translatePath } from '@/lib/i18n/dictionary';

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('fr');

  useEffect(() => {
    const saved = (localStorage.getItem('vexel_lang') || localStorage.getItem('vxel_lang')) as Language;
    if (saved && ['fr', 'en', 'es'].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const setLanguage = useCallback((newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vexel_lang', newLang);
      localStorage.setItem('vxel_lang', newLang);
      document.cookie = `vexel_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `vxel_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new Event('vxel-language-changed'));
    }
  }, []);

  const t = useCallback(
    (keyPath: string): string => {
      const currentDict = dictionary[lang] || dictionary.fr;
      return translatePath(currentDict, keyPath);
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
}
