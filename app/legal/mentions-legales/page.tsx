'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black">
      <header className="max-w-7xl mx-auto flex justify-between items-center py-6 px-4 border-b border-[#2E2E2E]">
        <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
          <span className="text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageCurrencySelector />
          <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Accueil
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <div className="border-b border-[#2E2E2E] pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Mentions Légales</h1>
          <p className="text-xs text-slate-400">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <section className="space-y-6 text-xs leading-relaxed text-slate-300">
          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">1. Éditeur de la Plateforme</h2>
            <p>
              Le site <strong>VXEL DTF Studio Pro</strong> est édité par la société VXEL Inc., spécialisée dans les solutions logicielles d'optimisation d'impression textile B2B.
              <br />
              <strong>Email de contact :</strong> contact@vexel.com / contact.tbalbiza@gmail.com
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">2. Hébergement Web</h2>
            <p>
              La plateforme est hébergée sur l'infrastructure cloud sécurisée de Vercel Inc. (Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis).
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">3. Authentification & Base de Données</h2>
            <p>
              Le système d'authentification sécurisé est fourni par Clerk Inc. Les données d'utilisateurs et de crédits sont stockées sur MongoDB Atlas avec chiffrement des données au repos et en transit.
            </p>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto text-center py-8 border-t border-[#2E2E2E] text-xs text-slate-600">
        © {new Date().getFullYear()} VXEL DTF Studio Pro. Tous droits réservés.
      </footer>
    </div>
  );
}
