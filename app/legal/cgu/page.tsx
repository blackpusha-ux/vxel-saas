'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';

export default function CGUPage() {
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Conditions Générales d'Utilisation (CGU)</h1>
          <p className="text-xs text-slate-400">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <section className="space-y-6 text-xs leading-relaxed text-slate-300">
          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">1. Objet et Présentation de la Plateforme</h2>
            <p>
              VXEL DTF Studio Pro propose une solution SaaS B2B dédiée à l'optimisation, au détourage et à la préparation de fichiers d'impression Direct-to-Film (DTF). Les présentes CGU régissent l'accès et l'utilisation de l'ensemble des services disponibles sur le domaine vxelbeta-teal.vercel.app.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">2. Accès aux Services et Crédits</h2>
            <p>
              L'accès aux fonctionnalités d'exportation nécessite un compte utilisateur valide et l'utilisation de crédits. Chaque utilisateur se voit attribuer 10 crédits d'essai à l'inscription. Des crédits supplémentaires peuvent être achetés via des abonnements mensuels/annuels ou des packs rechargeables sans expiration.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">3. Propriété Intellectuelle et Fichiers Client</h2>
            <p>
              L'utilisateur conserve l'entière propriété intellectuelle des fichiers image importés. VXEL s'engage à ne pas diffuser, revendre ou utiliser les visuels clients à d'autres fins que le traitement technique commandé par l'utilisateur.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">4. Responsabilité et Disponibilité</h2>
            <p>
              VXEL met en œuvre tous les moyens raisonnables pour assurer une disponibilité de 99.9% des serveurs. VXEL ne saurait être tenu responsable d'éventuels défauts d'impression dus à un fichier source de qualité insuffisante fourni par l'utilisateur.
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
