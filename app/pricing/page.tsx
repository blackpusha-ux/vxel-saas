'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Zap,
  ShieldCheck,
  ArrowLeft,
  Lock,
  RefreshCw,
  Gift,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Coins,
  ArrowRight,
} from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';

export default function PricingPage() {
  const { t } = useTranslation();
  const [currency, setCurrency] = useState<'EUR' | 'CAD' | 'USD'>('EUR');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const symbol = currency === 'EUR' ? '€' : '$';

  const subPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: currency === 'EUR' ? 19 : 25,
      credits: 50,
      desc: t('pricing.starterDesc'),
      popular: false,
      features: [
        '50 crédits Premium / mois',
        'Priorité d\'utilisation (consommés en 1er)',
        'Exports HD 300 DPI & PDF Vectoriel',
        'Détourage IA & Anti-halo',
        'Nesting automatique de planches',
        'Support par email',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Atelier',
      price: currency === 'EUR' ? 39 : 49,
      credits: 150,
      desc: t('pricing.proDesc'),
      popular: true,
      features: [
        '150 crédits Premium / mois',
        'Priorité d\'utilisation (consommés en 1er)',
        'Exports HD 300 DPI & PDF Vectoriel',
        'Détourage IA & Anti-halo avancé',
        'Nesting automatique multi-visuels',
        'Vectorisation Potrace IA serveur',
        'Support prioritaire 7j/7',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: currency === 'EUR' ? 89 : 119,
      credits: 500,
      desc: t('pricing.enterpriseDesc'),
      popular: false,
      features: [
        '500 crédits Premium / mois',
        'Priorité d\'utilisation (consommés en 1er)',
        'Accès illimité à tous les outils DTF',
        'Vectorisation Potrace Ultra 4x',
        'Traitement prioritaire sur serveur dédié',
        'Support téléphonique & dédié',
      ],
    },
  ];

  const creditPacks = [
    {
      name: 'Pack 20 Crédits',
      price: currency === 'EUR' ? 10 : 15,
      credits: 20,
      validity: t('pricing.packValidity'),
    },
    {
      name: 'Pack 50 Crédits',
      price: currency === 'EUR' ? 22 : 30,
      credits: 50,
      validity: t('pricing.packValidity'),
    },
    {
      name: 'Pack 100 Crédits',
      price: currency === 'EUR' ? 39 : 50,
      credits: 100,
      validity: t('pricing.packValidity'),
    },
  ];

  const actionCosts = [
    {
      action: t('pricing.actionDetourage'),
      cost: t('pricing.actionDetourageCost'),
      desc: t('pricing.actionDetourageDesc'),
      icon: '🎨',
    },
    {
      action: t('pricing.actionVector'),
      cost: t('pricing.actionVectorCost'),
      desc: t('pricing.actionVectorDesc'),
      icon: '⚡',
    },
    {
      action: t('pricing.actionPlancheSmall'),
      cost: t('pricing.actionPlancheSmallCost'),
      desc: t('pricing.actionPlancheSmallDesc'),
      icon: '📐',
    },
    {
      action: t('pricing.actionPlancheLarge'),
      cost: t('pricing.actionPlancheLargeCost'),
      desc: t('pricing.actionPlancheLargeDesc'),
      icon: '🖨️',
    },
    {
      action: t('pricing.actionUpscale2x'),
      cost: t('pricing.actionUpscale2xCost'),
      desc: t('pricing.actionUpscale2xDesc'),
      icon: '🔍',
    },
    {
      action: t('pricing.actionUpscale4x'),
      cost: t('pricing.actionUpscale4xCost'),
      desc: t('pricing.actionUpscale4xDesc'),
      icon: '✨',
    },
  ];

  const faqItems = [
    { q: t('pricing.faq1Q'), a: t('pricing.faq1A') },
    { q: t('pricing.faq2Q'), a: t('pricing.faq2A') },
    { q: t('pricing.faq3Q'), a: t('pricing.faq3A') },
    { q: t('pricing.faq4Q'), a: t('pricing.faq4A') },
    { q: t('pricing.faq5Q'), a: t('pricing.faq5A') },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] font-sans pb-24 selection:bg-[#F7941D] selection:text-black">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#161616]/90 backdrop-blur-md border-b border-[#2E2E2E] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('common.home')}
          </Link>
          <span className="text-lg font-black text-white">
            VXEL <span className="text-[#F7941D]">Pricing</span>
          </span>
        </div>
        <LanguageCurrencySelector />
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161616] border border-[#F7941D]/40 text-xs font-extrabold text-[#F7941D] shadow-lg">
            <Gift className="w-4 h-4 text-[#F7941D]" />
            <span>{t('pricing.heroBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {t('pricing.heroTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {t('pricing.heroSub')}
          </p>
        </div>

        {/* Hero Banner CTA "10 crédits offerts - Sans carte bancaire" */}
        <div className="bg-gradient-to-r from-[#161616] via-[#2A1705] to-[#161616] border-2 border-[#F7941D] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-[#F7941D]/15">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#F7941D] flex items-center justify-center text-black font-extrabold shrink-0 shadow-lg shadow-[#F7941D]/30">
              <Gift className="w-8 h-8" />
            </div>
            <div className="space-y-1 text-left">
              <span className="text-[11px] font-black uppercase text-[#F7941D] tracking-wider">Offre de Bienvenue</span>
              <h3 className="text-xl sm:text-2xl font-black text-white">10 crédits offerts • Sans carte bancaire</h3>
              <p className="text-xs text-slate-300">
                Créez votre compte en 30 secondes et commencez à détourer, vectoriser et composer vos planches immédiatement.
              </p>
            </div>
          </div>
          <Link
            href="/sign-up?plan=free"
            className="px-8 py-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-black text-sm rounded-2xl transition-all shadow-xl shadow-[#F7941D]/30 shrink-0 flex items-center gap-2 group"
          >
            <span>Activer mes 10 crédits gratuits</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Pricing Grid: Free Card + 3 Subscription Plans */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">{t('pricing.title')}</h2>
            <p className="text-xs text-slate-400">{t('pricing.sub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Carte Gratuit */}
            <div className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-3xl p-6 flex flex-col justify-between relative transition-all">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-[#222] border border-[#333] text-slate-300 text-[10px] font-black uppercase rounded-full">
                    Sans CB
                  </span>
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">{t('pricing.freePlanName')}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t('pricing.freeDesc')}</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">0{symbol}</span>
                  </div>
                  <div className="text-xs font-black text-[#F7941D] uppercase mt-1">
                    {t('pricing.freeCredits')}
                  </div>
                </div>

                <div className="border-t border-[#2E2E2E] pt-4 space-y-2.5">
                  {[
                    '10 crédits offerts à l\'inscription',
                    'Accès Studio DTF, Vectoriseur & Planche',
                    'Exports PNG HD 300 DPI',
                    'Aucune carte bancaire requise',
                    'Support communautaire',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-[#F7941D] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/sign-up?plan=free"
                  className="w-full py-3 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] hover:bg-[#222] text-white text-xs font-extrabold rounded-xl flex items-center justify-center transition-all"
                >
                  {t('pricing.freeCta')}
                </Link>
              </div>
            </div>

            {/* 3 Paid Subscription Plans */}
            {subPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-[#161616] border rounded-3xl p-6 flex flex-col justify-between relative transition-all ${
                  plan.popular
                    ? 'border-[#F7941D] shadow-2xl shadow-[#F7941D]/15 scale-105 z-10'
                    : 'border-[#2E2E2E] hover:border-slate-500'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F7941D] text-black text-[9px] font-black uppercase px-3 py-0.5 rounded-full tracking-wider shadow-md">
                    {t('common.popular')}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">{plan.price}{symbol}</span>
                      <span className="text-xs text-slate-400 font-bold">{t('common.perMonth')}</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-[#F7941D] uppercase mt-1">
                      {t('common.taxIncluded')} • {plan.credits} crédits
                    </div>
                  </div>

                  <div className="border-t border-[#2E2E2E] pt-4 space-y-2.5">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#F7941D] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href="/dtf-studio"
                    className={`w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all ${
                      plan.popular
                        ? 'bg-[#F7941D] hover:bg-[#FFB25A] text-black shadow-lg shadow-[#F7941D]/20'
                        : 'bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white'
                    }`}
                  >
                    {t('common.choose')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Cost Table ("Combien coûte 1 action ?") */}
        <div className="space-y-6 pt-6 border-t border-[#2E2E2E]">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#2E2E2E] text-xs font-bold text-[#F7941D]">
              <Coins className="w-3.5 h-3.5 text-[#F7941D]" />
              <span>Transparence Totale</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{t('pricing.costTableTitle')}</h2>
            <p className="text-xs text-slate-400">1 crédit débité uniquement après résultat validé et téléchargé</p>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl overflow-hidden shadow-xl text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2E2E2E] bg-[#0F0F0F]">
                    <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">{t('pricing.costAction')}</th>
                    <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider text-center">{t('pricing.costCredits')}</th>
                    <th className="p-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider">{t('pricing.costDetails')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2E2E]">
                  {actionCosts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="p-4 font-extrabold text-white flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.action}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] font-extrabold font-mono text-xs">
                          {item.cost}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">
                        {item.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Credit Packs Section */}
        <div className="space-y-8 pt-6 border-t border-[#2E2E2E]">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">{t('pricing.creditPacksTitle')}</h2>
            <p className="text-xs text-slate-400">{t('pricing.creditPacksSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPacks.map((pack, idx) => (
              <div key={idx} className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-2xl p-6 text-center space-y-4 shadow-lg transition-all">
                <h4 className="text-base font-extrabold text-white">{pack.name}</h4>
                <div>
                  <span className="text-3xl font-black text-white">{pack.price}{symbol}</span>
                  <div className="text-[10px] text-slate-400 uppercase mt-0.5">{t('common.taxIncluded')}</div>
                </div>
                <div className="text-xs font-semibold text-[#F7941D] bg-[#F7941D]/10 py-1.5 px-3 rounded-lg inline-block">
                  ⏱️ {pack.validity}
                </div>
                <Link
                  href="/dtf-studio"
                  className="block w-full py-2.5 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white text-xs font-bold rounded-xl transition-all"
                >
                  {t('common.buyPack')}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive FAQ Accordion (5 questions) */}
        <div className="space-y-6 pt-6 border-t border-[#2E2E2E] max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#2E2E2E] text-xs font-bold text-[#F7941D]">
              <HelpCircle className="w-3.5 h-3.5 text-[#F7941D]" />
              <span>Questions & Réponses</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{t('pricing.faqTitle')}</h2>
            <p className="text-xs text-slate-400">{t('pricing.faqSub')}</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#161616] border border-[#2E2E2E] rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-extrabold text-sm text-white flex items-center justify-between gap-4 hover:text-[#F7941D] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#F7941D] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-[#2E2E2E]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reassurance Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 border-t border-[#2E2E2E]">
          <div className="flex items-center gap-3 bg-[#161616] border border-[#2E2E2E] px-6 py-3.5 rounded-2xl">
            <Lock className="w-5 h-5 text-[#F7941D]" />
            <span className="text-xs font-extrabold text-white">{t('pricing.badgePayment')}</span>
          </div>

          <div className="flex items-center gap-3 bg-[#161616] border border-[#2E2E2E] px-6 py-3.5 rounded-2xl">
            <RefreshCw className="w-5 h-5 text-[#F7941D]" />
            <span className="text-xs font-extrabold text-white">{t('pricing.badgeCancel')}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
