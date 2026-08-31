'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactModal from '@/components/ContactModal';
import VectorizerTool from '@/components/VectorizerTool';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft } from 'lucide-react';

export default function VectoriseurPage() {
  const { t } = useTranslation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col font-sans selection:bg-[#F7941D] selection:text-black">
      <Header onOpenContact={() => setIsContactOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
          <Link href="/" className="text-slate-400 hover:text-white text-xs flex items-center gap-1.5 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t('common.home')}
          </Link>
          <span className="text-xs text-slate-500 font-mono">Image to Vector Pro v2.0</span>
        </div>

        <VectorizerTool />
      </main>

      <Footer onOpenContact={() => setIsContactOpen(true)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
