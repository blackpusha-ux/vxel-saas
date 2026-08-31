'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  Menu, X, Image as ImageIcon, Scissors, Printer, Zap, Check, ArrowRight,
  Mail, MapPin, Layers, Sparkles, RefreshCw, LayoutDashboard, Shield,
  Upload, Wand2, Download, Building2, Shirt, Palette, Lock, Headphones, Cpu
} from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/contexts/AppContext';

export default function Home() {
  const { t } = useTranslation();
  const { userCredits, refreshCredits } = useAppContext();
  const { isLoaded, isSignedIn, user } = useUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  const isAdmin = primaryEmail === 'contact.tbalbiza@gmail.com' || primaryEmail === 'contact@vexel.com';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Header / Navigation */}
      <header className="fixed w-full z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2E2E2E] py-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
            <span className="text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
          </Link>

          {/* User Profile Bar or Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageCurrencySelector />

            {isLoaded && isSignedIn ? (
              <div className="flex items-center gap-3 bg-[#161616] border border-[#2E2E2E] px-4 py-1.5 rounded-full">
                <UserButton />
                <div className="text-left text-xs">
                  <div className="text-white font-bold leading-none">{user.firstName || t('common.welcome')}</div>
                  <div className="text-slate-400 text-[10px] truncate max-w-[140px]">{primaryEmail}</div>
                </div>
                <div className="h-4 w-px bg-[#2E2E2E]" />
                <div className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#F7941D] px-2.5 py-1 rounded-full text-xs font-extrabold text-[#F7941D]">
                  <Zap className="w-3.5 h-3.5 fill-[#F7941D]" />
                  <span>{userCredits !== null ? userCredits : '...'} {t('common.credits')}</span>
                </div>
                <button
                  onClick={() => refreshCredits()}
                  title="Rafraîchir mes crédits"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {isAdmin && (
                  <Link href="/admin" className="p-1.5 bg-red-950/60 border border-red-800 text-red-400 rounded-lg text-xs font-bold" title="Back-Office Admin">
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
                <Link href="/dashboard" className="p-1.5 bg-[#2E2E2E] hover:bg-[#3E3E3E] text-white rounded-lg text-xs font-bold" title="Dashboard">
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/sign-in" className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2">
                  {t('common.signIn')}
                </Link>
                <Link href="/sign-up" className="px-4 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-full text-xs shadow-lg shadow-[#F7941D]/20 transition-all">
                  {t('common.signUp')}
                </Link>
              </div>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-300">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#161616] border-b border-[#2E2E2E] px-4 py-4 space-y-4">
            <LanguageCurrencySelector isMobile />
            {isSignedIn ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between bg-[#0A0A0A] p-3 rounded-xl border border-[#2E2E2E]">
                  <div className="flex items-center gap-2">
                    <UserButton />
                    <span className="text-xs font-bold text-white">{user.firstName}</span>
                  </div>
                  <span className="text-xs font-bold text-[#F7941D] bg-[#F7941D]/10 border border-[#F7941D] px-2 py-1 rounded-full">
                    ⚡ {userCredits} {t('common.credits')}
                  </span>
                </div>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-2 bg-[#2E2E2E] text-white rounded-xl text-xs font-bold">
                  {t('common.dashboard')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/sign-in" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-center bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded-xl text-xs font-bold">
                  {t('common.signIn')}
                </Link>
                <Link href="/sign-up" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-center bg-[#F7941D] text-black rounded-xl text-xs font-extrabold">
                  {t('common.signUp')}
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Hero & Quick Tools Access */}
      <main className="pt-28 pb-16 px-4 max-w-7xl mx-auto space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-extrabold uppercase tracking-wider">
            <Zap className="w-4 h-4" /> {t('hero.badge')}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            {t('hero.title1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7941D] to-[#FFB25A]">
              {t('hero.title2')}
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            {t('hero.desc')}
          </p>

          {/* 2 Big Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {/* Outil 1 : Studio DTF */}
            <div className="group bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F7941D]/10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-2">{t('tools.studioTitle')}</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {t('tools.studioDesc')}
                </p>
              </div>

              <Link
                href="/dtf-studio"
                className="w-full py-3.5 px-6 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl shadow-lg shadow-[#F7941D]/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>{t('tools.studioBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Outil 2 : Planche DTF */}
            <div className="group bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F7941D]/10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-2">{t('tools.plancheTitle')}</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {t('tools.plancheDesc')}
                </p>
              </div>

              <Link
                href="/dtf-planche"
                className="w-full py-3.5 px-6 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>{t('tools.plancheBtn')}</span>
                <ArrowRight className="w-4 h-4 text-[#F7941D]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 1 : Comment ça marche ? (3 Étapes visuelles) */}
        <section className="pt-12 border-t border-[#2E2E2E]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">{t('howItWorks.title')}</h2>
            <p className="text-xs text-slate-400">{t('howItWorks.sub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 relative">
              <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('howItWorks.step1Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('howItWorks.step1Desc')}</p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 relative">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('howItWorks.step2Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('howItWorks.step2Desc')}</p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 relative">
              <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center mb-6">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('howItWorks.step3Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('howItWorks.step3Desc')}</p>
            </div>
          </div>
        </section>

        {/* Section 2 : Pour qui ? */}
        <section className="pt-12 border-t border-[#2E2E2E]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">{t('forWho.title')}</h2>
            <p className="text-xs text-slate-400">{t('forWho.sub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('forWho.aud1Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('forWho.aud1Desc')}</p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8">
              <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center mb-6">
                <Shirt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('forWho.aud2Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('forWho.aud2Desc')}</p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8">
              <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center mb-6">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('forWho.aud3Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('forWho.aud3Desc')}</p>
            </div>
          </div>
        </section>

        {/* Section 3 : Réassurance & Confiance */}
        <section className="pt-12 border-t border-[#2E2E2E]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">{t('reassurance.mainTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 flex items-start gap-4">
              <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{t('reassurance.r1Title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t('reassurance.r1Desc')}</p>
              </div>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{t('reassurance.r2Title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t('reassurance.r2Desc')}</p>
              </div>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 flex items-start gap-4">
              <div className="p-3 bg-[#F7941D]/10 text-[#F7941D] rounded-xl">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{t('reassurance.r3Title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t('reassurance.r3Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Final CTA : Voir les Tarifs */}
        <section className="bg-gradient-to-r from-[#161616] via-[#1F1F1F] to-[#161616] border border-[#F7941D]/40 rounded-3xl p-10 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            {t('pricing.title')}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto">
            {t('pricing.sub')}
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-sm rounded-xl shadow-xl shadow-[#F7941D]/20 transition-all hover:scale-105"
          >
            <span>{t('common.viewPricing')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </main>

      {/* Footer avec liens légaux */}
      <footer className="bg-[#0A0A0A] border-t border-[#2E2E2E] py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
              <span className="text-xl font-bold text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
            </div>
            <p className="text-xs max-w-xs leading-relaxed">{t('footer.desc')}</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3">{t('footer.tools')}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/dtf-studio" className="hover:text-[#F7941D]">{t('common.studio')}</Link></li>
              <li><Link href="/dtf-planche" className="hover:text-[#F7941D]">{t('common.planche')}</Link></li>
              <li><Link href="/pricing" className="hover:text-[#F7941D]">{t('common.viewPricing')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs mb-3">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/legal/cgu" className="hover:text-[#F7941D]">{t('footer.cguLink')}</Link></li>
              <li><Link href="/legal/confidentialite" className="hover:text-[#F7941D]">{t('footer.privacyLink')}</Link></li>
              <li><Link href="/legal/mentions-legales" className="hover:text-[#F7941D]">{t('footer.mentionsLink')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-[#2E2E2E] pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VXEL DTF Studio Pro. {t('footer.rights')}</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <Link href="/legal/cgu" className="hover:text-slate-300">CGU</Link>
            <Link href="/legal/confidentialite" className="hover:text-slate-300">Confidentialité</Link>
            <Link href="/legal/mentions-legales" className="hover:text-slate-300">Mentions Légales</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}