'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, ShieldCheck, ArrowLeft, Lock, RefreshCw, Star } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';

export default function PricingPage() {
  const { t } = useTranslation();
  const [currency, setCurrency] = useState<'EUR' | 'CAD' | 'USD'>('EUR');

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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] font-sans pb-20">
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
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl font-black text-white">{t('pricing.title')}</h1>
          <p className="text-sm text-slate-400 leading-relaxed">{t('pricing.sub')}</p>
        </div>

        {/* Hybrid Model Explanatory Banner */}
        <div className="bg-[#161616] border border-[#F7941D]/40 rounded-2xl p-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {t('pricing.hybridInfo')}
        </div>

        {/* Subscriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-[#161616] border rounded-3xl p-8 flex flex-col justify-between relative transition-all ${
                plan.popular
                  ? 'border-[#F7941D] shadow-2xl shadow-[#F7941D]/15 scale-105'
                  : 'border-[#2E2E2E] hover:border-slate-500'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F7941D] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-md">
                  {t('common.popular')}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}{symbol}</span>
                    <span className="text-xs text-slate-400 font-bold">{t('common.perMonth')}</span>
                  </div>
                  <div className="text-[11px] font-extrabold text-[#F7941D] uppercase mt-1">
                    {t('common.taxIncluded')}
                  </div>
                </div>

                <div className="border-t border-[#2E2E2E] pt-4 space-y-2.5">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-[#F7941D] flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/dtf-studio"
                  className={`w-full py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center transition-all ${
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

        {/* Credit Packs Section */}
        <div className="space-y-8 pt-8 border-t border-[#2E2E2E]">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white">{t('pricing.creditPacksTitle')}</h2>
            <p className="text-xs text-slate-400">{t('pricing.creditPacksSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPacks.map((pack, idx) => (
              <div key={idx} className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-2xl p-6 text-center space-y-4">
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

        {/* Comparison Table for Hybrid Model */}
        <div className="space-y-6 pt-8 border-t border-[#2E2E2E]">
          <h2 className="text-2xl font-black text-white text-center">{t('pricing.tableTitle')}</h2>

          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2E2E2E] bg-[#0A0A0A]">
                  <th className="p-4 font-bold text-slate-300">{t('pricing.tableColFeature')}</th>
                  <th className="p-4 font-extrabold text-[#F7941D]">{t('pricing.tableColSub')}</th>
                  <th className="p-4 font-bold text-slate-400">{t('pricing.tableColPack')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2E2E]">
                <tr>
                  <td className="p-4 font-semibold text-white">{t('pricing.featPriority')}</td>
                  <td className="p-4 text-green-400 font-bold">Oui (Consommés en 1er)</td>
                  <td className="p-4 text-slate-400">Non (Secondaires)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">{t('pricing.featValidity')}</td>
                  <td className="p-4 text-slate-300">{t('pricing.valSubMonthly')}</td>
                  <td className="p-4 text-slate-300">{t('pricing.valPack30Days')}</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">{t('pricing.featExportHD')}</td>
                  <td className="p-4 text-green-400 font-bold">Inclus</td>
                  <td className="p-4 text-slate-400">Basique</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">{t('pricing.featNesting')}</td>
                  <td className="p-4 text-green-400 font-bold">Inclus</td>
                  <td className="p-4 text-slate-400">Limité</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">{t('pricing.featSupport')}</td>
                  <td className="p-4 text-green-400 font-bold">Prioritaire 7j/7</td>
                  <td className="p-4 text-slate-400">Standard</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Reassurance Badges: EXACTLY TWO BADGES */}
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
