'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton, useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';
import { Layers, Wand2, Zap, CreditCard, Mail, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenContact?: () => void;
}

export default function Header({ onOpenContact }: HeaderProps) {
  const { t } = useTranslation();
  const { user, isSignedIn } = useUser();
  const [credits, setCredits] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      fetch('/api/user/credits')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && typeof data.credits === 'number') {
            setCredits(data.credits);
          }
        })
        .catch(() => {});
    }
  }, [isSignedIn, user]);

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2E2E2E]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-white tracking-tight">
          <div className="w-8 h-8 rounded-xl bg-[#F7941D] flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#F7941D]/30">
            VX
          </div>
          <span>VXEL <span className="text-[#F7941D]">DTF</span> Studio</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
          <Link href="/" className="hover:text-[#F7941D] transition-colors">
            {t('common.home')}
          </Link>
          <Link href="/dtf-studio" className="hover:text-[#F7941D] transition-colors flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[#F7941D]" />
            <span>Studio DTF</span>
          </Link>
          <Link href="/vectoriseur" className="hover:text-[#F7941D] transition-colors flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#F7941D]" />
            <span>{t('nav.imageToVector')}</span>
          </Link>
          <Link href="/dtf-planche" className="hover:text-[#F7941D] transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#F7941D]" />
            <span>Outil Planche</span>
          </Link>
          <Link href="/pricing" className="hover:text-[#F7941D] transition-colors">
            {t('common.viewPricing')}
          </Link>

          {onOpenContact && (
            <button onClick={onOpenContact} className="hover:text-[#F7941D] transition-colors flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Contact</span>
            </button>
          )}
        </nav>

        {/* Right Section: i18n & User Controls */}
        <div className="flex items-center gap-3">
          <LanguageCurrencySelector />

          {isSignedIn ? (
            <div className="flex items-center gap-3">
              {credits !== null && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#161616] border border-[#2E2E2E] rounded-full text-xs font-bold text-slate-200">
                  <CreditCard className="w-3.5 h-3.5 text-[#F7941D]" />
                  <span>{credits} crédits</span>
                </div>
              )}
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 bg-[#161616] hover:bg-[#222] border border-[#2E2E2E] text-white rounded-xl text-xs font-bold transition-all">
                  {t('common.signIn')}
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-3.5 py-1.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs shadow-md shadow-[#F7941D]/20 transition-all">
                  {t('common.signUp')}
                </button>
              </SignUpButton>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161616] border-b border-[#2E2E2E] p-4 space-y-3 text-xs font-bold text-slate-200">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2">
            {t('common.home')}
          </Link>
          <Link href="/dtf-studio" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#F7941D]">
            Studio DTF
          </Link>
          <Link href="/vectoriseur" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#F7941D]">
            Image to Vector
          </Link>
          <Link href="/dtf-planche" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#F7941D]">
            Outil Planche DTF
          </Link>
          <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2">
            {t('common.viewPricing')}
          </Link>
        </div>
      )}
    </header>
  );
}
