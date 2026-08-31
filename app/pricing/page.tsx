'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';
import { Check, Zap, ArrowRight, ShieldCheck, Lock, RotateCcw } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useCurrency } from '@/lib/CurrencyContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/contexts/AppContext';
import { getPriceInCurrency, formatPrice } from '@/lib/pricing';

export default function PricingPage() {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const { userCredits, refreshCredits } = useAppContext();
  const { isLoaded, isSignedIn } = useUser();

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
          price: Math.round(baseCAD * discountFactor),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage(`✅ ${creditsAmount} ${t('common.credits')} ${t('pricing.addedSuccess') || 'ajoutés !'}`);
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
      name: t('plans.free') || 'Gratuit',
      cadPrice: 0,
      credits: 5,
      creditsLabel: `5 ${t('common.credits')} ${t('common.perMonth')}`,
      description: t('pricing.freeDesc'),
      features: [`5 ${t('common.credits')} / mois`, `Accès ${t('common.studio')}`, `Accès ${t('common.planche')}`, 'Support'],
      cta: t('common.choose'),
      highlighted: false,
    },
    {
      key: 'starter',
      name: t('plans.starter') || 'Starter',
      cadPrice: 19,
      credits: 100,
      creditsLabel: `100 ${t('common.credits')} ${t('common.perMonth')}`,
      description: t('pricing.starterDesc'),
      features: [`100 ${t('common.credits')} / mois`, 'Détourage IA & Anti-halo', 'Export HD 300 DPI', 'Support 24h'],
      cta: t('common.choose'),
      highlighted: false,
    },
    {
      key: 'pro',
      name: t('plans.pro') || 'Pro',
      cadPrice: 39,
      credits: 500,
      creditsLabel: `500 ${t('common.credits')} ${t('common.perMonth')}`,
      description: t('pricing.proDesc'),
      badge: t('common.popular'),
      features: [`500 ${t('common.credits')} / mois`, `Accès prioritaire ${t('common.planche')}`, 'Nesting automatique', 'Support prioritaire 7j/7'],
      cta: t('common.choose'),
      highlighted: true,
    },
    {
      key: 'enterprise',
      name: t('plans.enterprise') || 'Enterprise',
      cadPrice: 99,
      credits: 2000,
      creditsLabel: t('common.unlimited'),
      description: t('pricing.enterpriseDesc'),
      features: [`${t('common.unlimited')} (2000+)`, 'API sur-mesure', 'Manager dédié', 'Garantie SLA 99.9%'],
      cta: t('common.choose'),
      highlighted: false,
    },
  ];

  const creditPacks = [
    { key: 'pack_50', credits: 50, bonus: 0, cadPrice: 15, bestValue: false },
    { key: 'pack_200', credits: 200, bonus: 20, cadPrice: 39, bestValue: true },
    { key: 'pack_500', credits: 500, bonus: 100, cadPrice: 89, bestValue: false },
    { key: 'pack_1000', credits: 1000, bonus: 300, cadPrice: 149, bestValue: false },
  ];

  const faqs = [
    { q: 'Comment fonctionnent les crédits ?', a: 'Chaque optimisation d\'image ou création de planche consommée équivaut à 1 crédit.' },
    { q: 'Quelle est la différence entre abonnement et packs ?', a: 'Les crédits de votre abonnement se renouvellent chaque mois. Les crédits achetés en pack n\'expirent jamais.' },
    { q: 'Puis-je changer de forfait à tout moment ?', a: 'Oui, vous pouvez surclasser votre abonnement à tout moment sans frais.' },
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
                <span>{userCredits !== null ? userCredits : '...'} {t('common.credits')}</span>
              </div>
            </div>
          ) : (
            <Link href="/sign-in" className="px-4 py-2 bg-[#F7941D] text-black rounded-lg font-bold text-xs hover:bg-[#FFB25A]">
              {t('common.signIn')}
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-extrabold uppercase mb-4">
            <Zap className="w-4 h-4" /> {t('pricing.title')}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            {t('pricing.title')}
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            {t('pricing.sub')}
          </p>

          {/* Encart explicatif Modèle Hybride */}
          <div className="p-4 bg-[#161616] border border-[#2E2E2E] rounded-2xl text-xs text-slate-300 max-w-2xl mx-auto text-left leading-relaxed">
            {t('pricing.hybridInfo')}
          </div>

          {/* Toggle Monthly / Annual */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <span className={`text-xs font-bold ${!isAnnual ? 'text-white' : 'text-slate-400'}`}>{t('pricing.monthly') || 'Mensuel'}</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 bg-[#161616] border border-[#2E2E2E] rounded-full p-0.5 transition-colors"
            >
              <div className={`w-5 h-5 bg-[#F7941D] rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1 ${isAnnual ? 'text-white' : 'text-slate-400'}`}>
              {t('pricing.annual') || 'Annuel (-20%)'}
            </span>
          </div>
        </div>

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const rawConvertedPrice = Math.round(getPriceInCurrency(plan.cadPrice * discountFactor, currency));
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
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white font-mono">{formattedPrice}</span>
                      {plan.cadPrice > 0 && <span className="text-xs text-slate-400 font-medium">{t('common.perMonth')}</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{t('common.taxIncluded')}</div>
                    <div className="text-xs font-bold text-[#F7941D] mt-2">{plan.creditsLabel}</div>
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
        <section className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-white mb-2">{t('pricing.creditPacksTitle')}</h2>
            <p className="text-xs text-slate-400">{t('pricing.creditPacksSub')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPacks.map((pack, pIdx) => {
              const rawPrice = Math.round(getPriceInCurrency(pack.cadPrice, currency));
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
                      {t('common.popular')}
                    </div>
                  )}
                  <div className="text-3xl font-extrabold text-white font-mono mb-1">{pack.credits}</div>
                  <div className="text-xs font-bold text-slate-400 mb-3">{t('common.credits')}</div>

                  {pack.bonus > 0 ? (
                    <div className="inline-block bg-[#F7941D]/10 text-[#F7941D] text-[11px] font-extrabold px-2.5 py-1 rounded-full mb-4">
                      +{pack.bonus} crédits bonus
                    </div>
                  ) : (
                    <div className="h-7 mb-4"></div>
                  )}

                  <div className="text-2xl font-bold text-white mb-1">{formattedPrice}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mb-4">{t('common.taxIncluded')}</div>

                  <button
                    onClick={() => handlePurchase('pack', pack.credits + pack.bonus, pack.cadPrice)}
                    disabled={purchasing}
                    className="w-full py-2.5 px-3 bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-bold text-xs rounded-xl transition-all"
                  >
                    {t('common.buyPack')}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Badges de Réassurance en bas de page */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 flex flex-col items-center">
            <div className="p-3 bg-[#F7941D]/10 text-[#F7941D] rounded-full mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">{t('pricing.badgeGuarantee')}</h4>
            <p className="text-[11px] text-slate-400">Garantie remboursement sous 7 jours sans justification</p>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 flex flex-col items-center">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-full mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">{t('pricing.badgePayment')}</h4>
            <p className="text-[11px] text-slate-400">Transactions sécurisées par cryptage SSL 256 bits</p>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 flex flex-col items-center">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">{t('pricing.badgeCancel')}</h4>
            <p className="text-[11px] text-slate-400">Modifiez ou stoppez votre abonnement en 1 clic</p>
          </div>
        </section>

        {/* FAQ Accordion Section */}
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

      {/* Footer */}
      <footer className="max-w-7xl mx-auto text-center py-8 border-t border-[#2E2E2E] text-xs text-slate-600 space-y-3">
        <div className="flex justify-center gap-6 text-slate-400">
          <Link href="/legal/cgu" className="hover:text-white">{t('footer.cguLink')}</Link>
          <Link href="/legal/confidentialite" className="hover:text-white">{t('footer.privacyLink')}</Link>
          <Link href="/legal/mentions-legales" className="hover:text-white">{t('footer.mentionsLink')}</Link>
        </div>
        <p>© {new Date().getFullYear()} VXEL DTF Studio Pro. {t('footer.rights')}</p>
      </footer>
    </div>
  );
}
