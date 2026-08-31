'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

interface FooterProps {
  onOpenContact?: () => void;
}

export default function Footer({ onOpenContact }: FooterProps) {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2E2E2E] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2 font-black text-lg text-white">
            <div className="w-7 h-7 rounded-lg bg-[#F7941D] flex items-center justify-center text-black font-extrabold text-xs">
              VX
            </div>
            <span>VXEL DTF Studio Pro</span>
          </div>
          <p className="max-w-sm text-slate-400 leading-relaxed">{t('footer.desc')}</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">{t('footer.tools')}</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/dtf-studio" className="hover:text-[#F7941D] transition-colors">
                Studio DTF
              </Link>
            </li>
            <li>
              <Link href="/dtf-planche" className="hover:text-[#F7941D] transition-colors">
                Outil Planche DTF
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-[#F7941D] transition-colors">
                {t('common.viewPricing')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">{t('footer.legal')}</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/legal/cgu" className="hover:text-[#F7941D] transition-colors">
                {t('footer.cguLink')}
              </Link>
            </li>
            <li>
              <Link href="/legal/confidentialite" className="hover:text-[#F7941D] transition-colors">
                {t('footer.privacyLink')}
              </Link>
            </li>
            <li>
              <Link href="/legal/mentions-legales" className="hover:text-[#F7941D] transition-colors">
                {t('footer.mentionsLink')}
              </Link>
            </li>
            {onOpenContact && (
              <li>
                <button onClick={onOpenContact} className="hover:text-[#F7941D] transition-colors">
                  Nous Contacter
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-[#2E2E2E]/60 text-center text-slate-500 text-[11px]">
        © {new Date().getFullYear()} VXEL DTF Studio Pro. {t('footer.rights')}
      </div>
    </footer>
  );
}
