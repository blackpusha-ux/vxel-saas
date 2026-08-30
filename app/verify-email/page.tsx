'use client';

import React, { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';

export default function VerifyEmailPage() {
  const { isLoaded, signUp, setActive } = useSignUp() as any;
  const router = useRouter();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    if (!code || code.trim().length === 0) {
      setError('Veuillez saisir le code de vérification.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/dtf-studio');
      } else {
        console.log('Verification state:', completeSignUp);
        setError('Le code saisi n\'a pas pu valider votre compte.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Verification Error:', err);
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Code invalide ou expiré.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 flex flex-col justify-between p-4 selection:bg-[#F7941D] selection:text-black">
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center py-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
          <span className="text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
        </Link>
        <LanguageCurrencySelector />
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {/* Icon Header */}
          <div className="w-16 h-16 bg-[#F7941D]/10 rounded-2xl flex items-center justify-center text-[#F7941D] mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-white mb-2">Vérification du compte</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Saisissez le code à 6 chiffres envoyé à votre adresse email pour activer votre accès VXEL DTF Studio.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs font-semibold text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 text-center">
                Code de vérification (6 chiffres)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-10 pr-4 py-3 text-center tracking-widest text-lg font-mono font-bold text-[#F7941D] placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl shadow-lg shadow-[#F7941D]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>Vérifier l'email</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Vous n'avez pas reçu le code ?{' '}
            <button
              onClick={() => signUp?.prepareEmailAddressVerification({ strategy: 'email_code' })}
              className="text-[#F7941D] hover:underline font-bold"
            >
              Renvoyer le code
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center py-4 text-xs text-slate-600">
        © {new Date().getFullYear()} VXEL DTF Studio Pro. Tous droits réservés.
      </footer>
    </div>
  );
}
