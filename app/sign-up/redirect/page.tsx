'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpRedirectPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F7941D] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Finalisation de la connexion Google...</h2>
        <p className="text-xs text-slate-400 mb-6">Vous allez être redirigé automatiquement vers votre espace VXEL DTF Studio Pro.</p>
        <AuthenticateWithRedirectCallback signUpForceRedirectUrl="/dtf-studio" signInForceRedirectUrl="/dtf-studio" />
      </div>
    </div>
  );
}
