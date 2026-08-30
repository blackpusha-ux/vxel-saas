'use client';

import Link from 'next/link';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Compte suspendu</h1>
        <p className="text-slate-400 mb-6">
          Votre compte a été suspendu par l'administrateur. Si vous pensez qu'il s'agit d'une erreur, contactez-nous à :
        </p>
        <a href="mailto:contact.tbalbiza@gmail.com" className="text-[#F7941D] hover:underline font-medium">
          contact.tbalbiza@gmail.com
        </a>
        <div className="mt-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
