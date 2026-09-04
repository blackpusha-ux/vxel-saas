import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDictionary } from '@/lib/i18n/dictionary';

interface PageProps {
  params?: Promise<{ lang?: string }> | { lang?: string };
}

export default async function MentionsLegalesPage(props: PageProps) {
  const resolvedParams = props?.params ? await Promise.resolve(props.params) : {};
  const dict = await getDictionary(resolvedParams?.lang);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black">
      <header className="max-w-7xl mx-auto flex justify-between items-center py-6 px-4 border-b border-[#2E2E2E]">
        <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
          <span className="text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {dict.common?.home || 'Accueil'}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <div className="border-b border-[#2E2E2E] pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            {dict.legal?.legalNotice?.title || dict.legal?.mentionsTitle}
          </h1>
          <p className="text-xs text-slate-400">
            {dict.legal?.legalNotice?.lastUpdate || dict.legal?.lastUpdate} : 04/09/2026
          </p>
        </div>

        <section className="space-y-6 text-xs leading-relaxed text-slate-300">
          {dict.legal?.legalNotice?.sections?.editeur && (
            <div>
              <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">
                {dict.legal.legalNotice.sections.editeur.title}
              </h2>
              <p>{dict.legal.legalNotice.sections.editeur.content}</p>
            </div>
          )}

          {dict.legal?.legalNotice?.sections?.hebergeur && (
            <div>
              <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">
                {dict.legal.legalNotice.sections.hebergeur.title}
              </h2>
              <p>{dict.legal.legalNotice.sections.hebergeur.content}</p>
            </div>
          )}

          {dict.legal?.legalNotice?.sections?.securite && (
            <div>
              <h2 className="text-base font-bold text-white mb-2 text-[#F7941D]">
                {dict.legal.legalNotice.sections.securite.title}
              </h2>
              <p>{dict.legal.legalNotice.sections.securite.content}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-7xl mx-auto text-center py-8 border-t border-[#2E2E2E] text-xs text-slate-600">
        © {new Date().getFullYear()} VXEL DTF Studio Pro. {dict.footer?.rights}
      </footer>
    </div>
  );
}
