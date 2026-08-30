'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { CurrencyCode, currencies } from '@/lib/currencies';
import { useTranslation } from '@/lib/LanguageContext';
import { useCurrency } from '@/lib/CurrencyContext';
import { useAppContext } from '@/contexts/AppContext';

const languagesList: { code: Locale; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const currenciesList: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: 'CAD', symbol: 'CA$', name: 'CAD' },
  { code: 'USD', symbol: '$', name: 'USD' },
  { code: 'EUR', symbol: '€', name: 'EUR' },
  { code: 'GBP', symbol: '£', name: 'GBP' },
  { code: 'TND', symbol: 'د.ت', name: 'TND' },
];

export default function LanguageCurrencySelector({ isMobile = false }: { isMobile?: boolean }) {
  const { lang, setLang } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const { setCurrency: setAppCurrency } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLang = (newLang: Locale) => {
    setLang(newLang);
    localStorage.setItem('vexel_lang', newLang);
    localStorage.setItem('vxel_lang', newLang);
    setIsOpen(false);
  };

  const handleSelectCurr = (newCurr: string) => {
    setCurrency(newCurr);
    setAppCurrency(newCurr);
    localStorage.setItem('vexel_currency', newCurr);
    localStorage.setItem('vxel_currency', newCurr);
    setIsOpen(false);
  };

  const activeLangObj = languagesList.find((l) => l.code === lang) || languagesList[0];
  const activeCurrObj = currencies[currency as CurrencyCode] || currencies.CAD;

  if (isMobile) {
    return (
      <div className="space-y-4 p-3 bg-[#161616] border border-[#2E2E2E] rounded-xl">
        {/* Mobile Languages: 3 horizontal buttons with flags */}
        <div>
          <div className="text-[11px] font-bold uppercase text-[#F7941D] tracking-wider mb-2">Langue</div>
          <div className="grid grid-cols-3 gap-2">
            {languagesList.map((item) => {
              const isSelected = item.code === lang;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelectLang(item.code)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#F7941D] text-black border-[#F7941D]'
                      : 'bg-[#0A0A0A] border-[#2E2E2E] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span>{item.flag}</span>
                  <span>{item.code.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Currencies: horizontal scroll list */}
        <div>
          <div className="text-[11px] font-bold uppercase text-[#F7941D] tracking-wider mb-2">Devise</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {currenciesList.map((item) => {
              const isSelected = item.code === currency;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelectCurr(item.code)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#F7941D] text-black border-[#F7941D]'
                      : 'bg-[#0A0A0A] border-[#2E2E2E] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {item.symbol} {item.code}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Dropdown
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#161616] hover:bg-[#202020] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-lg text-xs font-medium text-slate-200 transition-all shadow-sm"
        aria-label="Sélectionner la langue et la devise"
      >
        <Globe className="w-4 h-4 text-[#F7941D]" />
        <span className="font-bold">{activeLangObj.code.toUpperCase()} • {activeCurrObj.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#161616] border border-[#2E2E2E] rounded-xl shadow-2xl z-50 p-3 space-y-3 backdrop-blur-md">
          {/* Langues */}
          <div>
            <div className="text-[10px] font-extrabold uppercase text-[#F7941D] tracking-wider mb-1.5 px-1">
              Langue / Language
            </div>
            <div className="grid grid-cols-3 gap-1">
              {languagesList.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelectLang(item.code)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-[#F7941D]/10 border-[#F7941D] text-[#F7941D]'
                        : 'bg-[#0A0A0A] border-[#2E2E2E] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span>{item.flag}</span>
                    <span>{item.code.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#2E2E2E]" />

          {/* Devises */}
          <div>
            <div className="text-[10px] font-extrabold uppercase text-[#F7941D] tracking-wider mb-1.5 px-1">
              Devise / Currency
            </div>
            <div className="grid grid-cols-1 gap-1">
              {currenciesList.map((item) => {
                const isSelected = item.code === currency;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelectCurr(item.code)}
                    className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all border ${
                      isSelected
                        ? 'bg-[#F7941D]/10 border-[#F7941D] text-[#F7941D]'
                        : 'bg-[#0A0A0A] border-[#2E2E2E] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold w-7 text-left">{item.symbol}</span>
                      <span>{item.name} ({item.code})</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#F7941D]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
