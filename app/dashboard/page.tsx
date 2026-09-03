'use client';

import React, { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Layers,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  ShieldCheck,
  History,
  Download,
  Trash2,
  Search,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';

interface UserProject {
  _id: string;
  toolType: string;
  originalFileName: string;
  processedFileName: string;
  originalFileMime?: string;
  processedFileMime?: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [credits, setCredits] = useState<number | null>(null);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('all');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchUserData = async () => {
    try {
      const resCredits = await fetch('/api/credits');
      const dataCredits = await resCredits.json();
      if (dataCredits.success) {
        setCredits(dataCredits.credits);
      }

      // Query secure private user projects endpoint
      const resProjects = await fetch('/api/projects');
      const dataProjects = await resProjects.json();

      if (dataProjects.success && Array.isArray(dataProjects.projects)) {
        setProjects(dataProjects.projects);
      }
    } catch (e) {
      console.error('Erreur chargement dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserData();
    }
  }, [isLoaded, isSignedIn]);

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Supprimer définitivement ce projet ?')) return;

    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (e) {
      console.error('Erreur suppression projet:', e);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.processedFileName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTool = selectedTool === 'all' || p.toolType === selectedTool;
    return matchesSearch && matchesTool;
  });

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F7941D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 border-b border-[#2E2E2E]">
        <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F7941D] rounded-xl flex items-center justify-center text-black font-extrabold text-xs">
            VX
          </div>
          <span className="text-white">VXEL <span className="text-[#F7941D]">DTF Studio Pro</span></span>
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-black uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Prépresse DTF
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
              Bonjour, {user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0]} !
            </h1>
            <p className="text-xs text-slate-400">
              Gérez vos fichiers prêts pour l'impression textile, vos crédits et vos exports.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/dtf-studio"
              className="px-5 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#F7941D]/20"
            >
              <Plus className="w-4 h-4" /> Nouveau Projet Studio
            </Link>
            <Link
              href="/dtf-planche"
              className="px-5 py-2.5 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" /> Outil Planche DTF
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Solde Crédits */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solde de Crédits</span>
              <div className="p-2 bg-[#F7941D]/10 text-[#F7941D] rounded-xl border border-[#F7941D]/20">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-4xl font-black text-white font-mono mb-3">
              {credits !== null ? credits : '...'}
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#F7941D] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Recharger des crédits
            </Link>
          </div>

          {/* Fichiers Traités */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fichiers Traités</span>
              <div className="p-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-4xl font-black text-white font-mono mb-3">
              {projects.length}
            </div>
            <span className="text-xs text-slate-500">Prêts pour l'impression RIP DTF</span>
          </div>

          {/* Workflow Status */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sécurité & Précision</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base font-extrabold text-white mb-2">
              300 DPI · Anti-Halo Pro
            </div>
            <p className="text-xs text-slate-500">
              Traitements protégés et stockés de manière privée.
            </p>
          </div>
        </div>

        {/* Projets Récents & Gestion */}
        <section className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <History className="w-5 h-5 text-[#F7941D]" /> Mes Projets d'Impression DTF
              </h2>
              <p className="text-xs text-slate-400">
                Retrouvez et téléchargez directement tous vos fichiers préparés
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <select
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                className="bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded-xl px-3 py-1.5 text-xs outline-none"
              >
                <option value="all">Tous les outils</option>
                <option value="dtf-studio">Studio DTF</option>
                <option value="vectorizer">Vectoriseur</option>
                <option value="planche">Planche DTF</option>
              </select>
            </div>
          </div>

          {/* Table / List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2E2E2E] text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Fichier</th>
                  <th className="py-3 px-4">Outil</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Crédits</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2E2E]">
                {filteredProjects.map((p) => (
                  <tr key={p._id} className="hover:bg-[#1A1A1A] transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="truncate max-w-[200px]" title={p.processedFileName || p.originalFileName}>
                          {p.processedFileName || p.originalFileName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#0A0A0A] border border-[#2E2E2E] text-[#F7941D]">
                        {p.toolType === 'dtf-studio'
                          ? 'Studio DTF'
                          : p.toolType === 'vectorizer'
                          ? 'Vectoriseur'
                          : 'Planche'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-green-950/60 border border-green-800 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {p.status || 'Ready to Print'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">-{p.creditsUsed || 1}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/projects/${p._id}/download?type=processed`}
                          download
                          className="p-1.5 bg-[#0A0A0A] hover:bg-[#F7941D] text-slate-300 hover:text-black border border-[#2E2E2E] rounded-lg transition-colors"
                          title="Télécharger le fichier traité"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteProject(p._id)}
                          className="p-1.5 bg-[#0A0A0A] hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-[#2E2E2E] hover:border-red-800 rounded-lg transition-colors"
                          title="Supprimer le projet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="max-w-xs mx-auto space-y-3">
                        <p className="text-xs">Aucun projet trouvé.</p>
                        <Link
                          href="/dtf-studio"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7941D] text-black font-extrabold text-xs rounded-xl shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" /> Créer mon premier projet
                        </Link>
                      </div>
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
