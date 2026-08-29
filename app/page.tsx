'use client';

import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#161616] to-[#1F1F1F] text-white">
      {/* Header */}
      <header className="border-b border-[#2E2E2E] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">VXEL <span className="text-[#F7941D]">Studio</span></h1>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="bg-[#F7941D] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#FFB25A] transition">
                  Connexion
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-12 text-center">
        {!isSignedIn ? (
          <>
            <h2 className="text-4xl font-bold mb-4">
              Bienvenue sur <span className="text-[#F7941D]">VXEL Studio</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Connecte-toi pour accéder à tes outils DTF Pro.
            </p>
            <div className="flex justify-center gap-4">
              <SignInButton mode="modal">
                <button className="bg-[#F7941D] text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#FFB25A] transition">
                  Se connecter
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="border-2 border-[#F7941D] text-[#F7941D] px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#F7941D] hover:text-black transition">
                  Créer un compte
                </button>
              </SignUpButton>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold mb-4">Bonjour ! 👋</h2>
            <p className="text-gray-400 text-lg mb-8">
              Tu es connecté. Tes outils sont prêts.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link href="/dtf-studio" className="group block bg-[#161616] border-2 border-[#2E2E2E] rounded-xl p-8 hover:border-[#F7941D] transition-all hover:scale-105">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-[#F7941D]">DTF Studio Pro</h3>
                <p className="text-gray-400">Optimisation et préparation de fichiers DTF.</p>
              </Link>
              <Link href="/planche-dtf" className="group block bg-[#161616] border-2 border-[#2E2E2E] rounded-xl p-8 hover:border-[#F7941D] transition-all hover:scale-105">
                <div className="text-5xl mb-4">📐</div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-[#F7941D]">Préparation Planche</h3>
                <p className="text-gray-400">Nesting automatique et optimisation de planches.</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}