'use client';

import React, { useState } from 'react';
import { useSignUp, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, UserCheck, Mail, Phone, Building, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';

export default function CustomSignUpPage() {
  const { isLoaded, signUp } = useSignUp() as any;
  const { loaded: clerkLoaded } = useClerk();
  const router = useRouter();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign up with Google OAuth
  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      setError('');
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sign-up/redirect',
        redirectUrlComplete: '/dtf-studio',
      });
    } catch (err: any) {
      console.error('Google SignUp Error:', err);
      setError(err?.errors?.[0]?.message || 'Erreur lors de la connexion Google');
      setLoading(false);
    }
  };

  // Sign up with Email/Password Form
  const handleSubmitEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (!email || !password || !firstName || !lastName) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        ...(phone ? { phoneNumber: phone } : {}),
      });

      // Send email code verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Navigate to code verification page
      router.push('/verify-email');
    } catch (err: any) {
      console.error('Email SignUp Error:', err);
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Erreur lors de la création de compte.');
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-[#161616] border border-[#2E2E2E] rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {/* Header text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Créer un compte</h1>
            <p className="text-sm text-slate-400">Accédez instantanément à vos outils VXEL DTF Studio Pro</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs font-semibold text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Big White Button : Continuer avec Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuer avec Google</span>
          </button>

          {/* Separator "ou" */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#2E2E2E]" />
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">ou</span>
            <div className="flex-1 h-px bg-[#2E2E2E]" />
          </div>

          {/* Option Button or Email Form */}
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full py-3.5 px-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl shadow-lg shadow-[#F7941D]/20 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              <span>S'inscrire avec email</span>
            </button>
          ) : (
            <form onSubmit={handleSubmitEmailSignUp} className="space-y-4">
              {/* Prénom & Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Prénom *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean"
                      className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nom *</label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jean.dupont@exemple.com"
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Entreprise (Optionnel) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Entreprise <span className="text-slate-500 font-normal">(optionnel)</span></label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Imprimerie VXEL"
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mot de passe *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl shadow-lg shadow-[#F7941D]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>Créer mon compte VXEL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Already have account */}
          <div className="mt-8 text-center text-xs text-slate-400">
            Vous avez déjà un compte ?{' '}
            <Link href="/sign-in" className="text-[#F7941D] hover:underline font-bold">
              Se connecter
            </Link>
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
