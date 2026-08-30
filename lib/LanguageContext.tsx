'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Locale } from './i18n';

interface LanguageContextType {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: typeof translations.fr;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Locale>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('vexel_lang') as Locale;
    if (saved && ['fr', 'en', 'es'].includes(saved)) {
      setLang(saved);
    }
  }, []);

  const handleSetLang = (newLang: Locale) => {
    setLang(newLang);
    localStorage.setItem('vexel_lang', newLang);
  };

  const t = translations[lang] || translations.fr;

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation doit être utilisé dans LanguageProvider');
  return context;
}
