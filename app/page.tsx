'use client';

import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-2xl font-bold">VXEL Studio</h1>
        <div>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
                Connexion
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">Bienvenue sur VXEL Studio</h2>
          <p className="text-xl text-gray-300 mb-8">
            Connecte-toi pour accéder à tes outils DTF Pro.
          </p>

          {!isSignedIn && (
            <div className="flex justify-center gap-4">
              <SignInButton mode="modal">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
                  Se connecter
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold">
                  Créer un compte
                </button>
              </SignUpButton>
            </div>
          )}

          {isSignedIn && (
            <div className="mt-8">
              <p className="text-green-400 text-lg">✅ Connecté avec succès !</p>
              <p className="text-gray-400 mt-2">
                Accède maintenant à tes outils DTF Pro.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}