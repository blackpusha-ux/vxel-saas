'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Mail } from 'lucide-react';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
      <div className="bg-[#161616] border border-red-900/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-950/80 border border-red-800 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-2">Compte Suspendu</h1>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Votre accès aux outils VXEL DTF Studio Pro a été temporairement suspendu par l'administration.
        </p>

        <div className="p-4 bg-[#0A0A0A] border border-[#2E2E2E] rounded-xl text-xs text-slate-300 mb-6 space-y-2">
          <div>Pour réactiver votre accès, veuillez contacter le support :</div>
          <div className="text-[#F7941D] font-bold flex items-center justify-center gap-1.5">
            <Mail className="w-4 h-4" /> contact@vexel.com
          </div>
        </div>

        <Link
          href="/"
          className="inline-block w-full py-3 px-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl transition-all text-xs"
        >
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );
}
