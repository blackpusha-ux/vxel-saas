import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Générateur d'Images IA Gratuit pour DTF | VXEL",
  description: "Créez gratuitement des designs textiles DTF percutants grâce à l'IA Flux. Générez, vectorisez en SVG ou détourez en haute résolution avec VXEL Studio Pro.",
  openGraph: {
    title: "Générateur d'Images IA Gratuit pour DTF | VXEL",
    description: "Générez des designs textiles uniques en quelques secondes gratuitement avec l'IA.",
  },
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
