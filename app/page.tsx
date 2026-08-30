'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  Menu, X, Image as ImageIcon, Scissors, Printer, Zap, Check, ArrowRight,
  Mail, MapPin, Layers, Sparkles, RefreshCw, LayoutDashboard, Shield
} from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/lib/LanguageContext';
import { useCurrency } from '@/lib/CurrencyContext';
import { useAppContext } from '@/contexts/AppContext';
import { getPriceInCurrency, formatPrice } from '@/lib/pricing';

export default function Home() {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const { userCredits, refreshCredits } = useAppContext();
  const { isLoaded, isSignedIn, user } = useUser();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  const isAdmin = primaryEmail === 'contact.tbalbiza@gmail.com' || primaryEmail === 'contact@vexel.com';

  const discountFactor = isAnnual ? 0.8 : 1.0;

  // Handle direct credit purchase / plan upgrade
  const handlePurchase = async (planKey: string, creditsAmount: number, basePriceCAD: number) => {
    if (!isSignedIn) {
      window.location.href = '/sign-in';
      return;
    }

    try {
      setPurchasing(true);
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          credits: creditsAmount,
          price: basePriceCAD,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage(`✅ ${creditsAmount} crédits ajoutés à votre compte !`);
        await refreshCredits();
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(data.error || 'Erreur lors de l\'ajout des crédits');
      }
    } catch (e: any) {
      alert(e.message || 'Erreur de connexion');
    } finally {
      setPurchasing(false);
    }
  };

  const plansList = [
    {
      key: 'free',
      name: 'Gratuit',
      cadPrice: 0,
      credits: 5,
      creditsLabel: '5 crédits / mois',
      desc: 'Idéal pour tester nos outils DTF',
      features: ['5 crédits offerts par mois', 'Accès Studio DTF', 'Accès Outil Planche', 'Support communautaire'],
      badge: null,
    },
    {
      key: 'starter',
      name: 'Starter',
      cadPrice: 29,
      credits: 100,
      creditsLabel: '100 crédits / mois',
      desc: 'Pour les créateurs et indépendants',
      features: ['100 crédits par mois', 'Détourage IA & Anti-halo', 'Export Haute Définition (300 DPI)', 'Support email 24h'],
      badge: null,
    },
    {
      key: 'pro',
      name: 'Pro',
      cadPrice: 59,
      credits: 500,
      creditsLabel: '500 crédits / mois',
      desc: 'Pour les ateliers d\'impression et pros',
      features: ['500 crédits par mois', 'Accès prioritaire Outil Planche', 'Nesting automatique multi-images', 'Support prioritaire 7j/7'],
      badge: 'POPULAIRE',
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      cadPrice: 149,
      credits: 2000,
      creditsLabel: 'Crédits illimités',
      desc: 'Pour les gros volumes et réseaux',
      features: ['Crédits illimités (2000+)', 'Manager de compte dédié', 'Accès API sur-mesure', 'Garantie SLA 99.9%'],
      badge: null,
    },
  ];

  const creditPacksList = [
    { key: 'pack_50', credits: 50, bonus: 0, cadPrice: 15, badge: null },
    { key: 'pack_200', credits: 200, bonus: 20, cadPrice: 39, badge: 'POPULAIRE' },
    { key: 'pack_500', credits: 500, bonus: 100, cadPrice: 99, badge: null },
    { key: 'pack_1000', credits: 1000, bonus: 300, cadPrice: 179, badge: null },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#F7941D] text-black font-extrabold px-6 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

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
                  <div className="text-white font-bold leading-none">{user.firstName || 'Profil'}</div>
                  <div className="text-slate-400 text-[10px] truncate max-w-[140px]">{primaryEmail}</div>
                </div>
                <div className="h-4 w-px bg-[#2E2E2E]" />
                <div className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#F7941D] px-2.5 py-1 rounded-full text-xs font-extrabold text-[#F7941D]">
                  <Zap className="w-3.5 h-3.5 fill-[#F7941D]" />
                  <span>{userCredits !== null ? userCredits : '...'} crédits</span>
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
                  Se connecter
                </Link>
                <Link href="/sign-up" className="px-4 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-full text-xs shadow-lg shadow-[#F7941D]/20 transition-all">
                  Créer un compte
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
                    ⚡ {userCredits} crédits
                  </span>
                </div>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-2 bg-[#2E2E2E] text-white rounded-xl text-xs font-bold">
                  Mon Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/sign-in" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-center bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded-xl text-xs font-bold">
                  Se connecter
                </Link>
                <Link href="/sign-up" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-center bg-[#F7941D] text-black rounded-xl text-xs font-extrabold">
                  Créer un compte
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Hero & Quick Tools Access */}
      <main className="pt-28 pb-16 px-4 max-w-7xl mx-auto space-y-16">
        {/* Section Accès Rapide aux 2 Outils */}
        <section className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-extrabold uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Plateforme VXEL Studio Pro DTF
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Préparez vos impressions DTF en <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7941D] to-[#FFB25A]">
              quelques secondes
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Accédez directement à nos 2 outils professionnels de traitement d'images et de génération de planches d'impression.
          </p>

          {/* 2 Big Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {/* Outil 1 : Studio DTF */}
            <div className="group bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F7941D]/10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-2">Studio DTF</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Détourage intelligent par IA, suppression des halos, retouche rapide de couleurs et mise à l'échelle HD (300 DPI).
                </p>
              </div>

              <Link
                href="/dtf-studio"
                className="w-full py-3.5 px-6 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl shadow-lg shadow-[#F7941D]/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Ouvrir Studio DTF</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Outil 2 : Planche DTF */}
            <div className="group bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-[#F7941D]/10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-white mb-2">Outil Planche DTF</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Nesting automatique multi-visuels, optimisation des espaces de film, prévisualisation temps réel et export PDF prêt à imprimer.
                </p>
              </div>

              <Link
                href="/dtf-planche"
                className="w-full py-3.5 px-6 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Ouvrir Outil Planche</span>
                <ArrowRight className="w-4 h-4 text-[#F7941D]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section Tarification & Forfaits */}
        <section id="pricing" className="pt-12 border-t border-[#2E2E2E]">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-3">Abonnements & Crédits</h2>
            <p className="text-xs text-slate-400">
              Choisissez un forfait mensuel/annuel ou rechargez votre solde avec des packs de crédits instantanés.
            </p>

            {/* Toggle Monthly / Annual */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <span className={`text-xs font-bold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Mensuel</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-12 h-6 bg-[#161616] border border-[#2E2E2E] rounded-full p-0.5 transition-colors"
              >
                <div className={`w-5 h-5 bg-[#F7941D] rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1 ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
                Annuel
                <span className="bg-[#F7941D]/20 border border-[#F7941D] text-[#F7941D] text-[9px] px-1.5 py-0.5 rounded-full font-extrabold">
                  -20%
                </span>
              </span>
            </div>
          </div>

          {/* Grid Forfaits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plansList.map((plan) => {
              const rawPrice = getPriceInCurrency(plan.cadPrice * discountFactor, currency);
              const formatted = plan.cadPrice === 0 ? 'Gratuit' : formatPrice(rawPrice, currency);

              return (
                <div
                  key={plan.key}
                  className={`relative bg-[#161616] border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                    plan.badge ? 'border-[#F7941D] shadow-xl shadow-[#F7941D]/10' : 'border-[#2E2E2E]'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F7941D] text-black text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-[11px] text-slate-400 mb-4 h-8">{plan.desc}</p>

                    <div className="mb-4">
                      <span className="text-2xl font-extrabold text-white font-mono">{formatted}</span>
                      {plan.cadPrice > 0 && <span className="text-xs text-slate-400"> / mois</span>}
                      <div className="text-xs font-extrabold text-[#F7941D] mt-1">{plan.creditsLabel}</div>
                    </div>

                    <div className="space-y-2 border-t border-[#2E2E2E] pt-4 mb-6">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-[#F7941D] flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(plan.key, plan.credits, plan.cadPrice)}
                    disabled={purchasing}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      plan.badge
                        ? 'bg-[#F7941D] text-black hover:bg-[#FFB25A]'
                        : 'bg-[#0A0A0A] border border-[#2E2E2E] text-white hover:border-[#F7941D]'
                    }`}
                  >
                    <span>Choisir {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Section Packs de Crédits */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h3 className="text-xl font-extrabold text-white mb-1">Packs de Crédits Ponctuels</h3>
              <p className="text-xs text-slate-400">Achetez des crédits à l'unité. Vos crédits n'expirent jamais.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditPacksList.map((pack) => {
                const rawPrice = getPriceInCurrency(pack.cadPrice, currency);
                const formatted = formatPrice(rawPrice, currency);

                return (
                  <div
                    key={pack.key}
                    className={`relative bg-[#0A0A0A] border rounded-2xl p-6 text-center transition-all ${
                      pack.badge ? 'border-[#F7941D]' : 'border-[#2E2E2E]'
                    }`}
                  >
                    {pack.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F7941D] text-black text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {pack.badge}
                      </div>
                    )}

                    <div className="text-3xl font-extrabold text-white font-mono mb-1">{pack.credits}</div>
                    <div className="text-xs font-bold text-slate-400 mb-2">Crédits d'impression</div>

                    {pack.bonus > 0 ? (
                      <div className="inline-block bg-[#F7941D]/10 text-[#F7941D] text-[10px] font-bold px-2 py-0.5 rounded-full mb-3">
                        +{pack.bonus} crédits bonus
                      </div>
                    ) : (
                      <div className="h-6 mb-3"></div>
                    )}

                    <div className="text-xl font-bold text-white mb-4">{formatted}</div>

                    <button
                      onClick={() => handlePurchase('pack', pack.credits + pack.bonus, pack.cadPrice)}
                      disabled={purchasing}
                      className="w-full py-2.5 px-3 bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Acheter ce pack
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#2E2E2E] py-8 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} VXEL DTF Studio Pro. Tous droits réservés.
      </footer>
    </div>
  );
}