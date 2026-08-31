'use client';

import { useLanguageContext } from '@/contexts/LanguageContext';

export function useTranslation() {
  return useLanguageContext();
}

export default useTranslation;
