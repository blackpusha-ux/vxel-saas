import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'VXEL Studio Pro',
  description: 'Outils DTF Pro',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="fr" className="dark">
        <body className="bg-[#0A0A0A] text-white min-h-screen">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}