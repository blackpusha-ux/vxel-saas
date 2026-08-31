'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';

export default function PrivacyPage() {
  const { t } = useTranslation();

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
            <ArrowLeft className="w-4 h-4" /> {t('common.home')}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <div className="border-b border-[#2E2E2E] pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{t('legal.privacyTitle')}</h1>
          <p className="text-xs text-slate-400">{t('legal.lastUpdate')} {new Date().toLocaleDateString()}</p>
        </div>

        <section className="space-y-6 text-xs leading-relaxed text-slate-300">
          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">1. Données Collectées</h2>
            <p>
              VXEL traite uniquement les données strictement nécessaires à la fourniture de nos services : votre adresse e-mail (gérée via Clerk pour l'authentification), vos informations de compte, le solde de crédits et l'historique anonymisé de vos projets d'impression.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">2. Traitement et Hébergement des Fichiers</h2>
            <p>
              Les images que vous téléchargez sur VXEL DTF Studio Pro sont traitées temporairement en mémoire vive sur nos serveurs sécurisés. Aucune image n'est conservée au-delà de la durée nécessaire au traitement et à l'exportation par l'utilisateur.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">3. Vos Droits (RGPD)</h2>
            <p>
              Conformément à la réglementation européenne sur la protection des données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment en contactant contact@vexel.com.
            </p>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto text-center py-8 border-t border-[#2E2E2E] text-xs text-slate-600">
        © {new Date().getFullYear()} VXEL DTF Studio Pro. {t('footer.rights')}
      </footer>
    </div>
  );
}
