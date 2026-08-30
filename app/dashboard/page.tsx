'use client';

import React, { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Layers, Image as ImageIcon, Plus, ArrowRight, ShieldCheck, History } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/lib/LanguageContext';

interface UserProject {
  _id: string;
  fileName: string;
  type: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>('free');
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const resCredits = await fetch('/api/credits');
        const dataCredits = await resCredits.json();

        if (dataCredits.success) {
          setCredits(dataCredits.credits);
        }

        const resProjects = await fetch('/api/admin/projects');
        const dataProjects = await resProjects.json();

        if (dataProjects.success && Array.isArray(dataProjects.projects)) {
          setProjects(dataProjects.projects.slice(0, 10));
        }
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchUserData();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F7941D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 border-b border-[#2E2E2E]">
        <Link href="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F7941D] rounded-md flex items-center justify-center text-black font-bold">V</div>
          <span className="text-white">VXEL <span className="text-[#F7941D]">DTF Pro</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageCurrencySelector />
          <UserButton />
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              Bienvenue, {user.firstName || user.emailAddresses[0]?.emailAddress}!
            </h1>
            <p className="text-xs text-slate-400">
              Gérez votre compte, vos crédits et vos projets d'impression DTF en un coup d'œil.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dtf-studio"
              className="px-5 py-3 bg-[#F7941D] text-black font-bold text-xs rounded-xl hover:bg-[#FFB25A] transition-all flex items-center gap-2 shadow-lg shadow-[#F7941D]/20"
            >
              <ImageIcon className="w-4 h-4" /> Studio DTF
            </Link>
            <Link
              href="/dtf-planche"
              className="px-5 py-3 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" /> Outil Planche
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Crédits restants */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400">Crédits restants</span>
              <div className="p-2 bg-[#F7941D]/10 text-[#F7941D] rounded-lg">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-white font-mono mb-4">
              {credits !== null ? credits : '...'}
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F7941D] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Recharger mes crédits
            </Link>
          </div>

          {/* Plan Actuel */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400">Abonnement Actuel</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white uppercase mb-4 tracking-wider">
              {plan}
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
            >
              Changer de forfait <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Total Projets */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-400">Projets réalisés</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <History className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-white font-mono mb-4">
              {projects.length}
            </div>
            <span className="text-xs text-slate-500">Mise à jour en temps réel</span>
          </div>
        </div>

        {/* Historique des 10 derniers projets */}
        <section className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-[#F7941D]" /> Vos 10 derniers projets
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2E2E2E] text-slate-400">
                  <th className="py-3 px-4">Fichier</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Crédits</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2E2E]">
                {projects.map((p) => (
                  <tr key={p._id} className="hover:bg-[#1F1F1F] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{p.fileName}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#F7941D]">
                      {p.type}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-green-950/60 border border-green-800 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {p.status || 'Terminé'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">-{p.creditsUsed || 1}</td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Vous n'avez pas encore de projet. Lancez-vous dans le Studio ou l'outil Planche !
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
