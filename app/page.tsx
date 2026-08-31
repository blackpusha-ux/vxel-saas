'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactModal from '@/components/ContactModal';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Sparkles,
  Layers,
  Wand2,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Shirt,
  Sparkle,
  FileCheck,
  Headphones,
  Check,
  Star,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Header */}
      <Header onOpenContact={() => setIsContactOpen(true)} />

      <main className="flex-1 space-y-20 pb-20">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 px-4 max-w-7xl mx-auto text-center space-y-8 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#F7941D]/15 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161616] border border-[#2E2E2E] text-xs font-bold text-[#F7941D] shadow-lg animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#F7941D]" />
            <span>{t('hero.badge')}</span>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {t('hero.title1')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7941D] to-[#FFB25A]">
                {t('hero.title2')}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t('hero.desc')}
            </p>
          </div>

          {/* 3 Quick Access Tool Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-6 text-left">
            {/* Tool 1: Studio DTF */}
            <Link
              href="/dtf-studio"
              className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F7941D]/10 group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center border border-[#F7941D]/30 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white group-hover:text-[#F7941D] transition-colors">
                    Studio DTF
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Détourage intelligent, suppression de fond, anti-halo et préparation professionnelle 300 DPI.
                  </p>
                </div>
              </div>

              <div className="pt-8 flex items-center gap-2 text-xs font-black text-[#F7941D] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                <span>Ouvrir Studio DTF</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Tool 2: Vectoriseur DTF Pro (VTracer) */}
            <Link
              href="/vectoriseur"
              className="bg-[#161616] border border-[#F7941D]/60 hover:border-[#F7941D] rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F7941D]/20 group flex flex-col justify-between relative overflow-hidden shadow-lg"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#F7941D] text-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-[#F7941D]/30">
                  <Zap className="w-7 h-7 fill-black" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-white group-hover:text-[#F7941D] transition-colors">
                      Vectoriseur Pro
                    </h3>
                    <span className="px-2 py-0.5 bg-[#F7941D]/20 text-[#F7941D] border border-[#F7941D]/40 text-[10px] font-extrabold rounded-full">
                      VTracer IA
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Vectorisation multicolore HD sans perte, conversion PNG/JPG en SVG vectoriel lisse pour impression DTF.
                  </p>
                </div>
              </div>

              <div className="pt-8 flex items-center gap-2 text-xs font-black text-[#F7941D] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                <span>Vectoriser une image</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Tool 3: Outil Planche DTF */}
            <Link
              href="/dtf-planche"
              className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F7941D]/10 group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center border border-[#F7941D]/30 group-hover:scale-110 transition-transform">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white group-hover:text-[#F7941D] transition-colors">
                    Outil Planche DTF
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Nesting automatique, optimisation film, export PDF / DTX prêt à imprimer.
                  </p>
                </div>
              </div>

              <div className="pt-8 flex items-center gap-2 text-xs font-black text-[#F7941D] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                <span>Ouvrir Outil Planche</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </section>

        {/* Section: Comment ça marche (3 étapes) */}
        <section className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white">{t('howItWorks.title')}</h2>
            <p className="text-sm text-slate-400">{t('howItWorks.sub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 space-y-4 relative">
              <span className="text-4xl font-black text-[#F7941D]/30 absolute top-6 right-6">01</span>
              <div className="w-12 h-12 bg-[#0A0A0A] text-[#F7941D] rounded-2xl flex items-center justify-center border border-[#2E2E2E]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">{t('howItWorks.step1Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('howItWorks.step1Desc')}</p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 space-y-4 relative">
              <span className="text-4xl font-black text-[#F7941D]/30 absolute top-6 right-6">02</span>
              <div className="w-12 h-12 bg-[#0A0A0A] text-[#F7941D] rounded-2xl flex items-center justify-center border border-[#2E2E2E]">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">{t('howItWorks.step2Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('howItWorks.step2Desc')}</p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 space-y-4 relative">
              <span className="text-4xl font-black text-[#F7941D]/30 absolute top-6 right-6">03</span>
              <div className="w-12 h-12 bg-[#0A0A0A] text-[#F7941D] rounded-2xl flex items-center justify-center border border-[#2E2E2E]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">{t('howItWorks.step3Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('howItWorks.step3Desc')}</p>
            </div>
          </div>
        </section>

        {/* Section: Pour qui */}
        <section className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-white">{t('forWho.title')}</h2>
            <p className="text-sm text-slate-400">{t('forWho.sub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center border border-[#F7941D]/30">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">{t('forWho.aud1Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('forWho.aud1Desc')}</p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center border border-[#F7941D]/30">
                <Shirt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">{t('forWho.aud2Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('forWho.aud2Desc')}</p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 space-y-4">
              <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center border border-[#F7941D]/30">
                <Sparkle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">{t('forWho.aud3Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('forWho.aud3Desc')}</p>
            </div>
          </div>
        </section>

        {/* Section: Réassurance */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 md:p-12 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">{t('reassurance.mainTitle')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0A0A0A] text-[#F7941D] rounded-xl flex items-center justify-center border border-[#2E2E2E] flex-shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">{t('reassurance.r1Title')}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('reassurance.r1Desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0A0A0A] text-[#F7941D] rounded-xl flex items-center justify-center border border-[#2E2E2E] flex-shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">{t('reassurance.r2Title')}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('reassurance.r2Desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0A0A0A] text-[#F7941D] rounded-xl flex items-center justify-center border border-[#2E2E2E] flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">{t('reassurance.r3Title')}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('reassurance.r3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Tarifs */}
        <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="bg-gradient-to-r from-[#161616] via-[#1A1A1A] to-[#161616] border border-[#F7941D]/30 rounded-3xl p-10 space-y-6 shadow-2xl">
            <h2 className="text-3xl font-black text-white">Prêt à optimiser vos impressions DTF ?</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Découvrez nos tarifs flexibles et nos packs de crédits adaptés à tous vos projets d'impression textile.
            </p>
            <div className="pt-2">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-black text-sm rounded-2xl shadow-xl shadow-[#F7941D]/20 transition-all hover:scale-105"
              >
                <span>{t('common.viewPricing')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer onOpenContact={() => setIsContactOpen(true)} />

      {/* Modal Contact */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}