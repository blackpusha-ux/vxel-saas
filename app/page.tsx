'use client';

import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-[#2E2E2E] bg-[#161616]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-white">
            VXEL <span className="text-[#F7941D]">DTF Studio Pro</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dtf-studio"
                className="px-4 py-2 bg-[#F7941D] text-black font-extrabold rounded hover:bg-[#FFB25A] text-xs transition"
              >
                DTF Studio Pro →
              </Link>
              <UserButton />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-[#F7941D] text-black font-extrabold rounded hover:bg-[#FFB25A] text-xs transition">
                Connexion
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl bg-[#161616] border border-[#2E2E2E] p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-extrabold mb-4 text-white">
            Bienvenue sur VXEL <span className="text-[#F7941D]">DTF Studio Pro</span>
          </h2>
          <p className="text-gray-300 text-sm mb-8 leading-relaxed">
            Optimisation de nesting, suppression de fond, anti-halo et préparation professionnelle de vos fichiers pour l'impression DTF.
          </p>

          {!isSignedIn ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <SignInButton mode="modal">
                <button className="px-6 py-3 bg-[#F7941D] text-black font-extrabold rounded-lg hover:bg-[#FFB25A] transition text-sm">
                  Se connecter avec Clerk
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-3 bg-[#1F1F1F] text-white border border-[#2E2E2E] hover:border-[#F7941D] font-bold rounded-lg transition text-sm">
                  Créer un compte
                </button>
              </SignUpButton>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-400 font-bold text-sm">✅ Connecté avec succès avec Clerk !</p>
              <Link
                href="/dtf-studio"
                className="inline-block px-8 py-3 bg-[#F7941D] text-black font-extrabold rounded-lg hover:bg-[#FFB25A] transition shadow-lg text-sm"
              >
                Ouvrir DTF Studio Pro →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}