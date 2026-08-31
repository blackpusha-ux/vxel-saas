'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserButton, SignInButton, useAuth } from '@clerk/nextjs';
import { ArrowRight, ShieldCheck, Zap, Layers, Sparkles, CheckCircle2, Lock, Headphones, Server, Upload, Download, Wand2, Image as ImageIcon, Mail, Check, Star } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';
import VectorizerTool from '@/components/VectorizerTool';

export default function HomePage() {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useAuth();
  const [activeGalleryTab, setActiveGalleryTab] = useState<'cartoon' | 'logo' | 'illustration' | 'typo'>('cartoon');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const galleryItems = {
    cartoon: {
      title: 'Cartoons & Aplats de Couleurs',
      desc: 'Lissage parfait des courbes de Bézier, aplats de couleurs éclatants et suppression automatique des artefacts.',
      beforeImg: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
      afterSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><g fill="#F7941D"><path d="M 100 20 Q 150 20 150 70 Q 150 120 100 120 Q 50 120 50 70 Q 50 20 100 20 Z" /><circle cx="80" cy="60" r="10" fill="#000" /><circle cx="120" cy="60" r="10" fill="#000" /><path d="M 80 90 Q 100 110 120 90" stroke="#000" stroke-width="5" fill="none" /></g></svg>',
    },
    logo: {
      title: 'Logos & Identités Visuelles',
      desc: 'Précision vectorielle chirurgicale sur les lignes droites, cercles et angles vifs.',
      beforeImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      afterSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><polygon points="100,20 170,160 30,160" fill="#F7941D" /><circle cx="100" cy="105" r="30" fill="#161616" /><polygon points="100,50 140,130 60,130" fill="#FFF" /></svg>',
    },
    illustration: {
      title: 'Illustrations Complexes',
      desc: 'Conservation de la palette de couleurs originale, hiérarchie de couches cutout sans chevauchement.',
      beforeImg: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
      afterSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><path d="M 30 150 Q 100 20 170 150 Z" fill="#F7941D" /><circle cx="100" cy="70" r="25" fill="#FFB25A" /><path d="M 10 170 L 190 170 L 190 190 L 10 190 Z" fill="#FFF" /></svg>',
    },
    typo: {
      title: 'Typographies & Lettrages DTF',
      desc: 'Contours vectoriels nets, aucune pixelisation à l\'agrandissement 300 DPI.',
      beforeImg: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80',
      afterSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="55" fill="#F7941D">VXEL</text></svg>',
    },
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setShowContactModal(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[#161616]/90 backdrop-blur-md border-b border-[#2E2E2E] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black text-white tracking-tight">
              VXEL <span className="text-[#F7941D]">DTF Studio</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="#vectorizer-tool" className="hover:text-white transition-colors">Outil Vectorisation</Link>
            <Link href="#gallery" className="hover:text-white transition-colors">Galerie Avant/Après</Link>
            <Link href="#features" className="hover:text-white transition-colors">Avantages</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <button onClick={() => setShowContactModal(true)} className="hover:text-white transition-colors">Contact</button>
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
                Mon Compte
              </Link>
              <UserButton />
            </div>
          )}

          {isLoaded && !isSignedIn && (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="px-4 py-2 border border-[#2E2E2E] hover:border-[#F7941D] text-white rounded-xl text-xs font-bold transition-all">
                  Se connecter
                </button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-[#F7941D]/20">
                  Créer un compte
                </button>
              </SignInButton>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-extrabold uppercase mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Moteur VTracer & Potrace IA 300 DPI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-5xl mx-auto">
          Vectorisez vos images pour{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7941D] via-[#FFB25A] to-[#F7941D]">
            l'impression DTF professionnelle
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-3xl mx-auto mb-8 leading-relaxed">
          Transformez vos visuels matriciels (PNG, JPG, WEBP) en fichiers vectoriels SVG ultra-nets (300 DPI), sans fond et prêts pour l'impression textile DTF professionnelle.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
          <a
            href="#vectorizer-tool"
            className="w-full sm:w-auto px-8 py-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-2xl text-sm transition-all shadow-xl shadow-[#F7941D]/25 flex items-center justify-center gap-2 group"
          >
            <Upload className="w-4 h-4" />
            <span>Uploader une image à vectoriser</span>
          </a>
        </div>
      </section>

      {/* Main Interactive Vectorizer Tool Section */}
      <section id="vectorizer-tool" className="py-8 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#161616] border border-[#F7941D]/40 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#2E2E2E] pb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#F7941D]" /> Outil de Vectorisation DTF Intégré
            </h2>
            <span className="text-xs text-slate-400">Formats acceptés : PNG, JPG, WEBP (Max 50MB)</span>
          </div>

          <VectorizerTool />
        </div>
      </section>

      {/* Section Features / Avantages */}
      <section id="features" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-black text-white">Pourquoi choisir VXEL DTF Vectorizer ?</h2>
          <p className="text-xs sm:text-sm text-slate-400">Une suite d'outils optimisée pour les imprimeurs et ateliers textile</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-3xl p-6 space-y-4 transition-all">
            <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Vectorisation Haute Qualité</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Tracés Bézier lisses sans pixels parasites ni bavures pour une impression nette.</p>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-3xl p-6 space-y-4 transition-all">
            <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Suppression de Fond IA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Détourage automatique par IA pour obtenir un fond 100% transparent prêt pour l'impression.</p>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-3xl p-6 space-y-4 transition-all">
            <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Rendu 300 DPI HD</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Mise à l'échelle vectorielle scalable à l'infini sans perte de détails.</p>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D]/50 rounded-3xl p-6 space-y-4 transition-all">
            <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Exports SVG & PNG HD</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Téléchargement immédiat du fichier SVG vectoriel et du PNG transparent HD.</p>
          </div>
        </div>
      </section>

      {/* Interactive Before/After Gallery Section */}
      <section id="gallery" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto bg-[#161616]/40 border border-[#2E2E2E] rounded-3xl">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-black text-white">Galerie Exemples Avant / Après</h2>
          <p className="text-xs sm:text-sm text-slate-400">Découvrez le rendu vectoriel sur différents styles d'images</p>
        </div>

        {/* Gallery Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {(['cartoon', 'logo', 'illustration', 'typo'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveGalleryTab(key)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeGalleryTab === key
                  ? 'bg-[#F7941D] text-black border-[#F7941D] shadow-lg shadow-[#F7941D]/20'
                  : 'bg-[#0A0A0A] border-[#2E2E2E] text-slate-400 hover:border-slate-500'
              }`}
            >
              {key === 'cartoon' && 'Cartoons & Aplats'}
              {key === 'logo' && 'Logos & Marques'}
              {key === 'illustration' && 'Illustrations Complexes'}
              {key === 'typo' && 'Typographies'}
            </button>
          ))}
        </div>

        {/* Active Gallery Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#0A0A0A] border border-[#2E2E2E] rounded-3xl p-8">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-[#F7941D]/10 text-[#F7941D] border border-[#F7941D]/30 rounded-lg text-xs font-bold uppercase">
              Style : {galleryItems[activeGalleryTab].title}
            </div>
            <h3 className="text-2xl font-extrabold text-white">{galleryItems[activeGalleryTab].title}</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {galleryItems[activeGalleryTab].desc}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-4 text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Avant (Matriciel)</span>
              <img
                src={galleryItems[activeGalleryTab].beforeImg}
                alt="Before"
                className="w-full h-40 object-cover rounded-xl border border-[#2E2E2E]"
              />
            </div>

            <div className="bg-[#161616] border border-[#F7941D]/50 rounded-2xl p-4 text-center space-y-2">
              <span className="text-[11px] font-bold text-[#F7941D] uppercase">Après (SVG Vectoriel)</span>
              <div
                dangerouslySetInnerHTML={{ __html: galleryItems[activeGalleryTab].afterSvg }}
                className="w-full h-40 bg-[#111] rounded-xl flex items-center justify-center border border-[#2E2E2E]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section className="py-20 px-4 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[#161616] via-[#222222] to-[#161616] border border-[#F7941D]/40 rounded-3xl p-10 space-y-6 shadow-2xl">
          <h2 className="text-3xl font-black text-white">Tarifs & Offres B2B DTF</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Accédez à des crédits rechargeables et des abonnements sans engagement adaptés à votre volume d'impression.
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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl max-w-md w-full p-6 space-y-6 relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ×
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#F7941D]" /> Contactez l'Équipe VXEL
              </h3>
              <p className="text-xs text-slate-400">Une question technique ou besoin d'un forfait sur-mesure ?</p>
            </div>

            {contactSent ? (
              <div className="bg-green-950/60 border border-green-500 text-green-300 p-4 rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Message envoyé avec succès ! Notre équipe vous répondra sous 24h.</span>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Votre Email</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@votre-atelier.com"
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-xl p-3 text-xs text-white outline-none focus:border-[#F7941D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Décrivez votre besoin d'impression ou de vectorisation..."
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-xl p-3 text-xs text-white outline-none focus:border-[#F7941D]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#F7941D]/20 transition-all"
                >
                  Envoyer le Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Professional Footer */}
      <footer className="border-t border-[#2E2E2E] bg-[#161616] py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <span className="text-lg font-black text-white">
              VXEL <span className="text-[#F7941D]">DTF Studio</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plateforme SaaS B2B professionnelle pour la vectorisation d'images et l'optimisation de planches d'impression DTF textile.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-[#F7941D] transition-colors">Accueil</Link></li>
              <li><a href="#vectorizer-tool" className="hover:text-[#F7941D] transition-colors">Outil Vectorisation</a></li>
              <li><a href="#gallery" className="hover:text-[#F7941D] transition-colors">Galerie Avant/Après</a></li>
              <li><Link href="/pricing" className="hover:text-[#F7941D] transition-colors">Tarifs & Plans</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Nos Outils DTF</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/dtf-studio" className="hover:text-[#F7941D] transition-colors">Studio DTF Retouche</Link></li>
              <li><Link href="/dtf-planche" className="hover:text-[#F7941D] transition-colors">Outil Planche DTF</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Legal & Contact</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/legal/cgu" className="hover:text-[#F7941D] transition-colors">Conditions Générales (CGU)</Link></li>
              <li><Link href="/legal/confidentialite" className="hover:text-[#F7941D] transition-colors">Politique de Confidentialité</Link></li>
              <li><Link href="/legal/mentions-legales" className="hover:text-[#F7941D] transition-colors">Mentions Légales</Link></li>
              <li><button onClick={() => setShowContactModal(true)} className="hover:text-[#F7941D] transition-colors">Contact Support</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#2E2E2E] flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-4">
          <span>© {new Date().getFullYear()} VXEL DTF Studio Pro. Tous droits réservés.</span>
          <div className="flex items-center gap-4">
            <span>🔒 Connexion Sécurisée</span>
            <span>⚡ Serveurs 300 DPI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}