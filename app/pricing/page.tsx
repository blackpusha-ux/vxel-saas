'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Sparkles, HelpCircle, ArrowRight, Layers, ShieldCheck } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useCurrency } from '@/lib/CurrencyContext';
import { getPriceInCurrency, formatPrice } from '@/lib/pricing';

export default function PricingPage() {
  const { currency } = useCurrency();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Discount factor for annual billing
  const discountFactor = isAnnual ? 0.8 : 1.0;

  const plans = [
    {
      name: 'Gratuit',
      cadPrice: 0,
      credits: '5 crédits / mois',
      description: 'Idéal pour tester nos outils DTF et faire un essai gratuit.',
      features: [
        '5 crédits offerts par mois',
        'Accès à VXEL Studio Pro',
        'Export image standard',
        'Support communautaire',
      ],
      cta: 'Commencer gratuitement',
      highlighted: false,
    },
    {
      name: 'Starter',
      cadPrice: 29,
      credits: '100 crédits / mois',
      description: 'Pour les créateurs et indépendants lançant leurs impressions.',
      features: [
        '100 crédits d\'impression par mois',
        'Détourage IA & Anti-halo',
        'Exports HD haute résolution (300 DPI)',
        'Support email sous 24h',
      ],
      cta: 'Choisir Starter',
      highlighted: false,
    },
    {
      name: 'Pro',
      cadPrice: 59,
      credits: '500 crédits / mois',
      description: 'Pour les ateliers et imprimeurs DTF professionnels.',
      badge: 'Populaire',
      features: [
        '500 crédits d\'impression par mois',
        'Accès illimité à l\'outil Planche DTF',
        'Nesting automatique multi-images',
        'Traitement prioritaire en serveur dédié',
        'Support prioritaire 7j/7',
      ],
      cta: 'Passer en Pro',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      cadPrice: 149,
      credits: 'Crédits illimités',
      description: 'Pour les gros volumes d\'impression et réseaux de boutiques.',
      features: [
        'Crédits d\'impression illimités',
        'Toutes les fonctionnalités Pro incluses',
        'API d\'intégration personnalisée',
        'Manager de compte dédié',
        'Garantie SLA 99.9%',
      ],
      cta: 'Contacter l\'équipe',
      highlighted: false,
    },
  ];

  const creditPacks = [
    { credits: 50, bonus: 0, cadPrice: 15 },
    { credits: 150, bonus: 15, cadPrice: 39, bestValue: false },
    { credits: 500, bonus: 100, cadPrice: 99, bestValue: true },
    { credits: 1000, bonus: 300, cadPrice: 179, bestValue: false },
  ];

  const faqs = [
    {
      q: 'Comment fonctionnent les crédits ?',
      a: 'Chaque optimisation d\'image ou création de planche consommée équivaut à 1 crédit. Vos crédits de forfait se renouvellent chaque mois.',
    },
    {
      q: 'Puis-je changer de forfait à tout moment ?',
      a: 'Oui, vous pouvez surclasser ou rétrograder votre abonnement à tout moment depuis votre tableau de bord sans aucun frais supplémentaire.',
    },
    {
      q: 'Les packs de crédits expirent-ils ?',
      a: 'Non ! Les crédits achetés hors abonnement n\'expirent jamais et restent disponibles sur votre compte indéfiniment.',
    },
    {
      q: 'Quel format de fichier puis-je exporter ?',
      a: 'Vous pouvez exporter vos fichiers prêts pour l\'impression au format PNG avec transparence et PDF vectoriel haute définition (300 DPI).',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center py-6 px-4 border-b border-[#2E2E2E]">
        <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
          <span className="text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageCurrencySelector />
          <Link href="/dtf-studio" className="px-4 py-2 bg-[#F7941D] text-black rounded-lg font-bold text-xs hover:bg-[#FFB25A] transition-all">
            Ouvrir le Studio
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Title */}
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
          <p className="text-slate-400 text-base md:text-lg">
            Choisissez l'abonnement adapté à votre volume d'impression ou achetez des packs de crédits à la demande.
          </p>

          {/* Toggle Monthly / Annual */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>Mensuel</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 bg-[#161616] border border-[#2E2E2E] rounded-full p-1 transition-colors"
            >
              <div
                className={`w-6 h-6 bg-[#F7941D] rounded-full transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
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
          {plans.map((plan, idx) => {
            const rawConvertedPrice = getPriceInCurrency(plan.cadPrice * discountFactor, currency);
            const formattedPrice = plan.cadPrice === 0 ? ' Gratuit' : formatPrice(rawConvertedPrice, currency);

            return (
              <div
                key={idx}
                className={`relative bg-[#161616] border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'border-[#F7941D] shadow-2xl shadow-[#F7941D]/15'
                    : 'border-[#2E2E2E] hover:border-slate-500'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F7941D] text-black text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-extrabold text-white font-mono">{formattedPrice}</span>
                    {plan.cadPrice > 0 && (
                      <span className="text-xs text-slate-400 font-medium"> / mois</span>
                    )}
                    <div className="text-xs font-bold text-[#F7941D] mt-1">{plan.credits}</div>
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

                <Link
                  href="/sign-up"
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs text-center transition-all flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? 'bg-[#F7941D] text-black hover:bg-[#FFB25A] shadow-lg shadow-[#F7941D]/20'
                      : 'bg-[#0A0A0A] border border-[#2E2E2E] text-white hover:bg-[#2E2E2E]'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Credit Packs Section */}
        <section className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-white mb-2">Packs de crédits sans abonnement</h2>
            <p className="text-xs text-slate-400">
              Besoin de crédits ponctuels ? Achetez un pack sans engagement. Vos crédits n'expirent jamais.
            </p>
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
                      Meilleure offre
                    </div>
                  )}
                  <div className="text-3xl font-extrabold text-white font-mono mb-1">{pack.credits}</div>
                  <div className="text-xs font-bold text-slate-400 mb-3">Crédits d'impression</div>

                  {pack.bonus > 0 ? (
                    <div className="inline-block bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-[11px] font-extrabold px-2.5 py-1 rounded-full mb-4">
                      +{pack.bonus} crédits bonus offerts
                    </div>
                  ) : (
                    <div className="h-7 mb-4"></div>
                  )}

                  <div className="text-2xl font-bold text-white mb-4">{formattedPrice}</div>

                  <Link
                    href="/sign-up"
                    className="block w-full py-2.5 px-3 bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Acheter ce pack
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white mb-2">Foire aux questions</h2>
            <p className="text-xs text-slate-400">Toutes les réponses à vos questions sur les abonnements et crédits VXEL.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, fIdx) => {
              const isOpen = openFaq === fIdx;
              return (
                <div
                  key={fIdx}
                  className="bg-[#161616] border border-[#2E2E2E] rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                    className="w-full py-4 px-6 text-left flex justify-between items-center text-sm font-bold text-white hover:text-[#F7941D] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-[#F7941D] font-mono text-lg">{isOpen ? '-' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-slate-400 leading-relaxed border-t border-[#2E2E2E] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto text-center py-8 border-t border-[#2E2E2E] text-xs text-slate-600">
        © {new Date().getFullYear()} VXEL DTF Studio Pro. Tous droits réservés.
      </footer>
    </div>
  );
}
