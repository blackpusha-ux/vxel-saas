import { ClerkProvider } from '@clerk/nextjs'
import './globals.css' // ⚠️ Active le design Tailwind

export const metadata = {
  title: 'VXEL Studio Pro',
  description: 'Outils DTF Pro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider> {/* ⚠️ Active les boutons de connexion Clerk */}
      <html lang="fr">
        <body className="bg-gray-900 text-white min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}