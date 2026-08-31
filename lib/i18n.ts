import { fr } from './i18n/fr';
import { en } from './i18n/en';
import { es } from './i18n/es';

export type Language = 'fr' | 'en' | 'es';
export type Locale = Language;

export const translations = {
  fr,
  en,
  es,
};

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';
  const saved = localStorage.getItem('vexel_lang') || localStorage.getItem('vxel_lang');
  if (saved && ['fr', 'en', 'es'].includes(saved)) {
    return saved as Language;
  }
  return 'fr';
}

export function setLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vexel_lang', lang);
    localStorage.setItem('vxel_lang', lang);
    window.dispatchEvent(new Event('vxel-settings-changed'));
  }
}

export function getTranslations(lang?: Language) {
  const currentLang = lang || getLanguage();
  return translations[currentLang] || translations.fr;
}
