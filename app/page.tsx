'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserButton, SignInButton, useAuth } from '@clerk/nextjs';
import { ArrowRight, ShieldCheck, Zap, Layers, Sparkles, CheckCircle2, Lock, Headphones, Server } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';

export default function HomePage() {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[#161616]/90 backdrop-blur-md border-b border-[#2E2E2E] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black text-white tracking-tight">
              VXEL <span className="text-[#F7941D]">Studio Pro</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <Link href="#features" className="hover:text-white transition-colors">{t('nav.services')}</Link>
            <Link href="#process" className="hover:text-white transition-colors">{t('nav.process')}</Link>
            <Link href="#for-who" className="hover:text-white transition-colors">Pour qui</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">{t('nav.pricing')}</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageCurrencySelector />

          {isLoaded && isSignedIn && (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-[#F7941D] text-black font-extrabold rounded-xl text-xs hover:bg-[#FFB25A] transition-all shadow-lg shadow-[#F7941D]/20"
              >
                {t('common.dashboard')}
              </Link>
              <UserButton />
            </div>
          )}

          {isLoaded && !isSignedIn && (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="px-4 py-2 border border-[#2E2E2E] hover:border-[#F7941D] text-white rounded-xl text-xs font-bold transition-all">
                  {t('common.signIn')}
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-[#F7941D]/20">
                  {t('common.signUp')}
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-extrabold uppercase mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('hero.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
          {t('hero.title1')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7941D] via-[#FFB25A] to-[#F7941D]">
            {t('hero.title2')}
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          {t('hero.desc')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            href="/dtf-studio"
            className="w-full sm:w-auto px-8 py-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-2xl text-sm transition-all shadow-xl shadow-[#F7941D]/25 flex items-center justify-center gap-2 group"
          >
            <span>{t('tools.studioBtn')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/dtf-planche"
            className="w-full sm:w-auto px-8 py-4 bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-extrabold rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>{t('tools.plancheBtn')}</span>
          </Link>
        </div>
      </section>

      {/* Tools Section */}
      <section id="features" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Studio DTF Card */}
          <div className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-3xl p-8 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#F7941D]/10 border border-[#F7941D]/30 rounded-2xl flex items-center justify-center text-[#F7941D]">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">{t('tools.studioTitle')}</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t('tools.studioDesc')}</p>
            </div>
            <Link
              href="/dtf-studio"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#F7941D] hover:text-[#FFB25A]"
            >
              <span>{t('tools.studioBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Outil Planche Card */}
          <div className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-3xl p-8 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#F7941D]/10 border border-[#F7941D]/30 rounded-2xl flex items-center justify-center text-[#F7941D]">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">{t('tools.plancheTitle')}</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t('tools.plancheDesc')}</p>
            </div>
            <Link
              href="/dtf-planche"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#F7941D] hover:text-[#FFB25A]"
            >
              <span>{t('tools.plancheBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section id="process" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto bg-[#161616]/50 border border-[#2E2E2E] rounded-3xl my-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-black text-white">{t('howItWorks.title')}</h2>
          <p className="text-xs sm:text-sm text-slate-400">{t('howItWorks.sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#0A0A0A] border border-[#2E2E2E] rounded-2xl p-6 space-y-3">
            <div className="text-[#F7941D] font-mono text-2xl font-black">01.</div>
            <h3 className="text-lg font-extrabold text-white">{t('howItWorks.step1Title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('howItWorks.step1Desc')}</p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2E2E2E] rounded-2xl p-6 space-y-3">
            <div className="text-[#F7941D] font-mono text-2xl font-black">02.</div>
            <h3 className="text-lg font-extrabold text-white">{t('howItWorks.step2Title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('howItWorks.step2Desc')}</p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2E2E2E] rounded-2xl p-6 space-y-3">
            <div className="text-[#F7941D] font-mono text-2xl font-black">03.</div>
            <h3 className="text-lg font-extrabold text-white">{t('howItWorks.step3Title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('howItWorks.step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Section Pour qui */}
      <section id="for-who" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-black text-white">{t('forWho.title')}</h2>
          <p className="text-xs sm:text-sm text-slate-400">{t('forWho.sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-extrabold text-white">{t('forWho.aud1Title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('forWho.aud1Desc')}</p>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-extrabold text-white">{t('forWho.aud2Title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('forWho.aud2Desc')}</p>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-extrabold text-white">{t('forWho.aud3Title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t('forWho.aud3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Reassurance Section */}
      <section className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Lock className="w-8 h-8 text-[#F7941D]" />
            <h4 className="text-sm font-extrabold text-white">{t('reassurance.r1Title')}</h4>
            <p className="text-xs text-slate-400">{t('reassurance.r1Desc')}</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <Headphones className="w-8 h-8 text-[#F7941D]" />
            <h4 className="text-sm font-extrabold text-white">{t('reassurance.r2Title')}</h4>
            <p className="text-xs text-slate-400">{t('reassurance.r2Desc')}</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <Server className="w-8 h-8 text-[#F7941D]" />
            <h4 className="text-sm font-extrabold text-white">{t('reassurance.r3Title')}</h4>
            <p className="text-xs text-slate-400">{t('reassurance.r3Desc')}</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[#161616] via-[#222222] to-[#161616] border border-[#F7941D]/40 rounded-3xl p-10 space-y-6 shadow-2xl">
          <h2 className="text-3xl font-black text-white">Prêt à optimiser vos planches d'impression DTF ?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Découvrez nos tarifs et packs de crédits adaptés aux professionnels et imprimeurs textile.
          </p>
          <div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-[#F7941D]/25 transition-all"
            >
              <span>{t('common.viewPricing')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2E2E2E] bg-[#161616] py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <span className="text-lg font-black text-white">
              VXEL <span className="text-[#F7941D]">Studio Pro</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">{t('footer.desc')}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{t('footer.tools')}</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/dtf-studio" className="hover:text-[#F7941D] transition-colors">{t('tools.studioTitle')}</Link></li>
              <li><Link href="/dtf-planche" className="hover:text-[#F7941D] transition-colors">{t('tools.plancheTitle')}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/legal/cgu" className="hover:text-[#F7941D] transition-colors">{t('footer.cguLink')}</Link></li>
              <li><Link href="/legal/confidentialite" className="hover:text-[#F7941D] transition-colors">{t('footer.privacyLink')}</Link></li>
              <li><Link href="/legal/mentions-legales" className="hover:text-[#F7941D] transition-colors">{t('footer.mentionsLink')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#2E2E2E] flex justify-between items-center text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} VXEL DTF Studio Pro. {t('footer.rights')}</span>
        </div>
      </footer>
    </div>
  );
}