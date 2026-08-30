'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Image, Scissors, Printer, Zap, Check, ArrowRight, Mail, MapPin, Layers } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black scroll-smooth">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }
        .reveal.active { opacity: 1; transform: translateY(0); }
      `}</style>

      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2E2E2E] py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
              <span className="text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
            </Link>
            <div className="hidden md:flex space-x-6 items-center">
              <a href="#services" className="text-sm font-medium text-slate-300 hover:text-[#F7941D] transition-colors">Services</a>
              <a href="#process" className="text-sm font-medium text-slate-300 hover:text-[#F7941D] transition-colors">Processus</a>
              <a href="#portfolio" className="text-sm font-medium text-slate-300 hover:text-[#F7941D] transition-colors">Galerie</a>
              <LanguageCurrencySelector />
              <Link href="/dtf-studio" className="px-5 py-2.5 bg-[#F7941D] text-black rounded-full font-bold text-sm hover:bg-[#FFB25A] transition-all shadow-lg shadow-[#F7941D]/20 hover:shadow-[#F7941D]/40 flex items-center gap-2">
                Essayer l'outil <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-300 hover:text-[#F7941D]">
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#161616] border-b border-[#2E2E2E] shadow-2xl">
            <div className="px-4 py-6 space-y-4">
              <a href="#services" onClick={() => setIsMenuOpen(false)} className="block text-slate-300 hover:text-[#F7941D] font-medium">Services</a>
              <a href="#process" onClick={() => setIsMenuOpen(false)} className="block text-slate-300 hover:text-[#F7941D] font-medium">Processus</a>
              <a href="#portfolio" onClick={() => setIsMenuOpen(false)} className="block text-slate-300 hover:text-[#F7941D] font-medium">Galerie</a>
              <Link href="/dtf-studio" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-5 py-3 bg-[#F7941D] text-black rounded-lg font-bold">Essayer l'outil</Link>
            </div>
          </div>
        )}
      </nav>

      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#F7941D]/10 via-[#0A0A0A] to-[#0A0A0A]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#2E2E2E 1px, transparent 1px), linear-gradient(90deg, #2E2E2E 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className={`relative z-10 text-center px-4 max-w-5xl mx-auto reveal ${isVisible('home') ? 'active' : ''}`}>
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-[#F7941D]" />
            <span className="text-[#F7941D] font-semibold text-sm tracking-wide uppercase">Solution DTF Nouvelle Génération</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Vos visuels, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7941D] to-[#FFB25A]">prêts à imprimer.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
            Optimisation de nesting, détourage chirurgical anti-halo et préparation professionnelle de vos fichiers pour une impression DTF sans compromis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dtf-studio" className="px-8 py-4 bg-[#F7941D] text-black rounded-full font-bold text-lg hover:bg-[#FFB25A] transition-all shadow-xl shadow-[#F7941D]/30 hover:-translate-y-1 flex items-center justify-center gap-2">
              Accéder au Studio <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dtf-planche" className="px-8 py-4 bg-[#161616] border border-[#2E2E2E] text-white rounded-full font-bold text-lg hover:bg-[#2E2E2E] transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              <Layers className="w-5 h-5" /> Outil Planche
            </Link>
          </div>
        </div>
      </section>

      <section id="services" className={`py-24 bg-[#0A0A0A] reveal ${isVisible('services') ? 'active' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[#F7941D] font-bold tracking-wider uppercase text-sm mb-3">Notre Expertise</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Une préparation de fichier irréprochable</h3>
            <p className="text-slate-400 text-lg">Chaque pixel compte. Nous automatisons les tâches complexes pour garantir un résultat d'impression parfait à chaque fois.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-[#161616] p-8 rounded-2xl border border-[#2E2E2E] hover:border-[#F7941D]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#F7941D]/10">
              <div className="w-14 h-14 bg-[#F7941D]/10 rounded-xl flex items-center justify-center text-[#F7941D] mb-6 group-hover:scale-110 transition-transform">
                <Image className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Optimisation & Nesting</h4>
              <p className="text-slate-400 mb-4 leading-relaxed">Agencement intelligent et automatique de vos motifs sur la laize de film. Réduisez vos chutes de film et maximisez la rentabilité de chaque impression.</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#F7941D]" /> Rotation automatique des motifs</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#F7941D]" /> Minimisation des espaces perdus</li>
              </ul>
            </div>
            <div className="group bg-[#161616] p-8 rounded-2xl border border-[#2E2E2E] hover:border-[#F7941D]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#F7941D]/10" style={{ transitionDelay: '100ms' }}>
              <div className="w-14 h-14 bg-[#F7941D]/10 rounded-xl flex items-center justify-center text-[#F7941D] mb-6 group-hover:scale-110 transition-transform">
                <Scissors className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Détourage & Anti-Halo</h4>
              <p className="text-slate-400 mb-4 leading-relaxed">Suppression de fond chirurgicale avec lissage des contours. Éliminez les bordures blanches (halos) pour un transfert net et professionnel sur tous les textiles.</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#F7941D]" /> Détection intelligente des bords</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#F7941D]" /> Lissage anti-crénelage</li>
              </ul>
            </div>
            <div className="group bg-[#161616] p-8 rounded-2xl border border-[#2E2E2E] hover:border-[#F7941D]/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#F7941D]/10" style={{ transitionDelay: '200ms' }}>
              <div className="w-14 h-14 bg-[#F7941D]/10 rounded-xl flex items-center justify-center text-[#F7941D] mb-6 group-hover:scale-110 transition-transform">
                <Printer className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Préparation Machine DTF</h4>
              <p className="text-slate-400 mb-4 leading-relaxed">Calibrage des couleurs, gestion optimale des couches de blanc et export en PDF haute résolution prêt à l'emploi pour votre RIP et votre imprimante.</p>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#F7941D]" /> Profil colorimétrique optimisé</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#F7941D]" /> Export PDF vectoriel ou raster</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className={`py-24 bg-[#161616] border-y border-[#2E2E2E] reveal ${isVisible('process') ? 'active' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[#F7941D] font-bold tracking-wider uppercase text-sm mb-3">Flux de Travail</h2>
              <h3 className="text-4xl font-bold text-white mb-6">De l'import au fichier prêt à imprimer en 3 étapes</h3>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Notre studio en ligne simplifie la préparation de vos fichiers DTF. Plus besoin de logiciels lourds ou de compétences techniques avancées en graphisme.
              </p>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Importation', desc: 'Glissez-déposez vos images (PNG, JPG, SVG). Notre système les analyse instantanément.' },
                  { step: '02', title: 'Traitement', desc: 'Ajustez les dimensions, lancez le détourage automatique et optimisez le nesting sur la laize.' },
                  { step: '03', title: 'Export', desc: 'Téléchargez votre planche au format PDF haute définition, calibrée pour votre machine.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0A0A0A] border border-[#2E2E2E] flex items-center justify-center text-[#F7941D] font-bold font-mono">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{item.title}</h4>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#F7941D] to-[#FFB25A] rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative bg-[#0A0A0A] border border-[#2E2E2E] rounded-2xl p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#161616] rounded-lg border border-[#2E2E2E]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded flex items-center justify-center text-blue-400"><Image className="w-5 h-5"/></div>
                      <div>
                        <div className="text-white font-medium text-sm">design_original.png</div>
                        <div className="text-slate-500 text-xs">2.4 MB • 300 DPI</div>
                      </div>
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Importé</span>
                  </div>
                  <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-[#F7941D] rotate-90" /></div>
                  <div className="flex items-center justify-between p-4 bg-[#161616] rounded-lg border border-[#F7941D]/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F7941D]/20 rounded flex items-center justify-center text-[#F7941D]"><Printer className="w-5 h-5"/></div>
                      <div>
                        <div className="text-white font-medium text-sm">planche_finale.pdf</div>
                        <div className="text-slate-500 text-xs">58cm x 34cm • Prêt à imprimer</div>
                      </div>
                    </div>
                    <span className="text-xs bg-[#F7941D] text-black font-bold px-2 py-1 rounded">Exporté</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="portfolio" className={`py-24 bg-[#0A0A0A] reveal ${isVisible('portfolio') ? 'active' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#F7941D] font-bold tracking-wider uppercase text-sm mb-3">Résultats Concrets</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-white">Galerie de Préparation</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Détourage Complexe', tag: 'Anti-Halo', color: 'from-purple-500 to-blue-500' },
              { title: 'Nesting Optimisé', tag: 'Gain de Film', color: 'from-[#F7941D] to-red-500' },
              { title: 'Calibrage Couleur', tag: 'Fidélité CMJN', color: 'from-green-500 to-teal-500' }
            ].map((item, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-xl border border-[#2E2E2E] cursor-pointer">
                <div className={`w-full h-80 bg-gradient-to-br ${item.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center`}>
                  <span className="text-white/20 text-6xl font-bold">VXEL</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                  <span className="text-[#F7941D] text-xs font-bold uppercase tracking-wider mb-1 block">{item.tag}</span>
                  <h4 className="text-white text-xl font-bold">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#F7941D] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-6">Prêt à optimiser votre production DTF ?</h2>
          <p className="text-black/80 text-xl mb-10 max-w-2xl mx-auto">Rejoignez les professionnels de l'impression qui gagnent du temps et de l'argent avec VXEL Studio.</p>
          <Link href="/dtf-studio" className="inline-flex items-center gap-2 px-10 py-5 bg-black text-white rounded-full font-bold text-lg hover:bg-[#161616] transition-all shadow-2xl hover:scale-105">
            Commencer gratuitement <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="bg-[#0A0A0A] border-t border-[#2E2E2E] py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
                <span className="text-xl font-bold text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed">
                La solution tout-en-un pour la préparation, l'optimisation et l'export de vos fichiers d'impression Direct to Film.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Outils</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dtf-studio" className="hover:text-[#F7941D] transition-colors">Studio d'Optimisation</Link></li>
                <li><Link href="/dtf-planche" className="hover:text-[#F7941D] transition-colors">Générateur de Planche</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#F7941D]" /> contact@vexel.com</li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#F7941D]" /> VXEL Studio</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#2E2E2E] pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>© {new Date().getFullYear()} VXEL DTF Studio Pro. Tous droits réservés.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}