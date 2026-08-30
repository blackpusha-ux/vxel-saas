'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { Check, Zap, ArrowRight, RefreshCw, LayoutDashboard } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useCurrency } from '@/lib/CurrencyContext';
import { useAppContext } from '@/contexts/AppContext';
import { getPriceInCurrency, formatPrice } from '@/lib/pricing';

export default function PricingPage() {
  const { currency } = useCurrency();
  const { userCredits, refreshCredits } = useAppContext();
  const { isLoaded, isSignedIn, user } = useUser();

  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const discountFactor = isAnnual ? 0.8 : 1.0;

  const handlePurchase = async (planKey: string, creditsAmount: number, baseCAD: number) => {
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
          price: baseCAD,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage(`✅ ${creditsAmount} crédits ajoutés à votre compte !`);
        await refreshCredits();
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(data.error || 'Erreur lors de l\'achat');
      }
    } catch (e: any) {
      alert(e.message || 'Erreur de connexion');
    } finally {
      setPurchasing(false);
    }
  };

  const plans = [
    {
      key: 'free',
      name: 'Gratuit',
      cadPrice: 0,
      credits: 5,
      creditsLabel: '5 crédits / mois',
      description: 'Idéal pour tester nos outils DTF et faire un essai gratuit.',
      features: ['5 crédits offerts par mois', 'Accès à VXEL Studio Pro', 'Export image standard', 'Support communautaire'],
      cta: 'Commencer gratuitement',
      highlighted: false,
    },
    {
      key: 'starter',
      name: 'Starter',
      cadPrice: 29,
      credits: 100,
      creditsLabel: '100 crédits / mois',
      description: 'Pour les créateurs et indépendants lançant leurs impressions.',
      features: ['100 crédits d\'impression par mois', 'Détourage IA & Anti-halo', 'Exports HD (300 DPI)', 'Support email 24h'],
      cta: 'Choisir Starter',
      highlighted: false,
    },
    {
      key: 'pro',
      name: 'Pro',
      cadPrice: 59,
      credits: 500,
      creditsLabel: '500 crédits / mois',
      description: 'Pour les ateliers et imprimeurs DTF professionnels.',
      badge: 'Populaire',
      features: ['500 crédits d\'impression par mois', 'Accès prioritaire Outil Planche', 'Nesting automatique multi-images', 'Support prioritaire 7j/7'],
      cta: 'Passer en Pro',
      highlighted: true,
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      cadPrice: 149,
      credits: 2000,
      creditsLabel: 'Crédits illimités',
      description: 'Pour les gros volumes d\'impression et réseaux.',
      features: ['Crédits illimités (2000+)', 'API sur-mesure', 'Manager dédié', 'Garantie SLA 99.9%'],
      cta: 'Contacter l\'équipe',
      highlighted: false,
    },
  ];

  const creditPacks = [
    { key: 'pack_50', credits: 50, bonus: 0, cadPrice: 15, bestValue: false },
    { key: 'pack_200', credits: 200, bonus: 20, cadPrice: 39, bestValue: true },
    { key: 'pack_500', credits: 500, bonus: 100, cadPrice: 99, bestValue: false },
    { key: 'pack_1000', credits: 1000, bonus: 300, cadPrice: 179, bestValue: false },
  ];

  const faqs = [
    { q: 'Comment fonctionnent les crédits ?', a: 'Chaque optimisation d\'image ou création de planche consommée équivaut à 1 crédit.' },
    { q: 'Puis-je changer de forfait à tout moment ?', a: 'Oui, vous pouvez surclasser votre abonnement à tout moment sans frais supplémentaires.' },
    { q: 'Les packs de crédits expirent-ils ?', a: 'Non ! Les crédits n\'expirent jamais et restent valables indéfiniment.' },
    { q: 'Quel format de fichier puis-je exporter ?', a: 'Vous pouvez exporter au format PNG haute définition avec transparence et PDF vectoriel.' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#F7941D] text-black font-extrabold px-6 py-3 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center py-6 px-4 border-b border-[#2E2E2E]">
        <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
          <span className="text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageCurrencySelector />
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <UserButton />
              <div className="bg-[#161616] border border-[#F7941D] px-3 py-1.5 rounded-full text-xs font-extrabold text-[#F7941D] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>{userCredits !== null ? userCredits : '...'} crédits</span>
              </div>
            </div>
          ) : (
            <Link href="/sign-in" className="px-4 py-2 bg-[#F7941D] text-black rounded-lg font-bold text-xs hover:bg-[#FFB25A]">
              Se connecter
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-extrabold uppercase mb-4">
            <Zap className="w-4 h-4" /> Tarification Transparente
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            Des forfaits simples pour <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7941D] to-[#FFB25A]">
              tous vos besoins DTF
            </span>
          </h1>
          <p className="text-slate-400 text-base">
            Abonnez-vous ou achetez des packs de crédits rechargeables en un clic.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Mensuel</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 bg-[#161616] border border-[#2E2E2E] rounded-full p-1 transition-colors"
            >
              <div className={`w-6 h-6 bg-[#F7941D] rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold flex items-center gap-1.5 ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              Annuel
              <span className="bg-[#F7941D]/20 border border-[#F7941D] text-[#F7941D] text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                -20%
              </span>
            </span>
          </div>
        </div>

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {plans.map((plan) => {
            const rawConvertedPrice = getPriceInCurrency(plan.cadPrice * discountFactor, currency);
            const formattedPrice = plan.cadPrice === 0 ? 'Gratuit' : formatPrice(rawConvertedPrice, currency);

            return (
              <div
                key={plan.key}
                className={`relative bg-[#161616] border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                  plan.highlighted ? 'border-[#F7941D] shadow-2xl shadow-[#F7941D]/15' : 'border-[#2E2E2E]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F7941D] text-black text-[11px] font-extrabold px-3 py-1 rounded-full uppercase">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-extrabold text-white font-mono">{formattedPrice}</span>
                    {plan.cadPrice > 0 && <span className="text-xs text-slate-400 font-medium"> / mois</span>}
                    <div className="text-xs font-bold text-[#F7941D] mt-1">{plan.creditsLabel}</div>
                  </div>

                  <div className="space-y-3 border-t border-[#2E2E2E] pt-6 mb-6">
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-[#F7941D] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(plan.key, plan.credits, plan.cadPrice)}
                  disabled={purchasing}
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs text-center transition-all flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? 'bg-[#F7941D] text-black hover:bg-[#FFB25A]'
                      : 'bg-[#0A0A0A] border border-[#2E2E2E] text-white hover:border-[#F7941D]'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Credit Packs Section */}
        <section className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-white mb-2">Packs de crédits sans abonnement</h2>
            <p className="text-xs text-slate-400">Achetez un pack de crédits sans engagement. Vos crédits n'expirent jamais.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPacks.map((pack, pIdx) => {
              const rawPrice = getPriceInCurrency(pack.cadPrice, currency);
              const formattedPrice = formatPrice(rawPrice, currency);

              return (
                <div
                  key={pIdx}
                  className={`relative bg-[#0A0A0A] border rounded-2xl p-6 text-center transition-all ${
                    pack.bestValue ? 'border-[#F7941D]' : 'border-[#2E2E2E]'
                  }`}
                >
                  {pack.bestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F7941D] text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      POPULAIRE
                    </div>
                  )}
                  <div className="text-3xl font-extrabold text-white font-mono mb-1">{pack.credits}</div>
                  <div className="text-xs font-bold text-slate-400 mb-3">Crédits d'impression</div>

                  {pack.bonus > 0 ? (
                    <div className="inline-block bg-[#F7941D]/10 text-[#F7941D] text-[11px] font-extrabold px-2.5 py-1 rounded-full mb-4">
                      +{pack.bonus} crédits bonus
                    </div>
                  ) : (
                    <div className="h-7 mb-4"></div>
                  )}

                  <div className="text-2xl font-bold text-white mb-4">{formattedPrice}</div>

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
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white mb-2">Foire aux questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, fIdx) => {
              const isOpen = openFaq === fIdx;
              return (
                <div key={fIdx} className="bg-[#161616] border border-[#2E2E2E] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                    className="w-full py-4 px-6 text-left flex justify-between items-center text-sm font-bold text-white hover:text-[#F7941D]"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#F7941D] font-mono text-lg">{isOpen ? '-' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-slate-400 border-t border-[#2E2E2E] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto text-center py-8 border-t border-[#2E2E2E] text-xs text-slate-600">
        © {new Date().getFullYear()} VXEL DTF Studio Pro. Tous droits réservés.
      </footer>
    </div>
  );
}
