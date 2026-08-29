import { ClerkProvider } from '@clerk/nextjs'
import './globals.css' // ⚠️ C'est cette ligne qui active le design et les couleurs !

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
    <ClerkProvider> {/* ⚠️ C'est ce bloc qui active les boutons de connexion ! */}
      <html lang="fr" className="dark">
        <body className="bg-[#0A0A0A] text-white min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}