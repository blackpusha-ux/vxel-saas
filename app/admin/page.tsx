'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, DollarSign, FolderCheck, ShieldAlert, Plus, Ban, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';

interface UserData {
  _id: string;
  clerkId: string;
  email: string;
  name?: string;
  credits: number;
  isBanned: boolean;
  role: string;
  plan: string;
  createdAt: string;
}

interface ProjectData {
  _id: string;
  clerkId: string;
  userEmail?: string;
  fileName: string;
  type: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
}

export default function AdminPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [projectsList, setProjectsList] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress || '';

  // Security Check: Redirect if not admin
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn || (primaryEmail !== 'contact.tbalbiza@gmail.com' && primaryEmail !== 'contact@vexel.com')) {
        router.push('/');
      }
    }
  }, [isLoaded, isSignedIn, primaryEmail, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resProjects] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/projects'),
      ]);

      const dataUsers = await resUsers.json();
      const dataProjects = await resProjects.json();

      if (dataUsers.success) setUsersList(dataUsers.users || []);
      if (dataProjects.success) setProjectsList(dataProjects.projects || []);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && (primaryEmail === 'contact.tbalbiza@gmail.com' || primaryEmail === 'contact@vexel.com')) {
      fetchData();
    }
  }, [isLoaded, isSignedIn, primaryEmail]);

  const handleAddCredits = async (clerkId: string, amount: number) => {
    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId, amount }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`+${amount} crédits ajoutés.`);
        fetchData();
      } else {
        alert(data.error || 'Erreur lors de l\'ajout');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleBan = async (clerkId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId, isBanned: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Statut banni mis à jour: ${!currentStatus}`);
        fetchData();
      } else {
        alert(data.error || 'Erreur lors de la modification');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (!isLoaded || !isSignedIn || (primaryEmail !== 'contact.tbalbiza@gmail.com' && primaryEmail !== 'contact@vexel.com')) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F7941D]"></div>
      </div>
    );
  }

  // Calculate top stats
  const totalUsers = usersList.length;
  const projectsToday = projectsList.filter((p) => {
    const pDate = new Date(p.createdAt).toDateString();
    const today = new Date().toDateString();
    return pDate === today;
  }).length;
  const estimatedMRR = usersList.reduce((acc, u) => {
    if (u.plan === 'starter') return acc + 29;
    if (u.plan === 'pro') return acc + 59;
    if (u.plan === 'enterprise') return acc + 149;
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> Accueil
          </Link>
          <div className="h-4 w-px bg-[#2E2E2E]" />
          <h1 className="text-lg font-extrabold text-white">
            VXEL <span className="text-[#F7941D]">Admin Back-Office</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            className="p-2 bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] text-slate-300 rounded-lg text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
          </button>
          <LanguageCurrencySelector />
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {actionMessage && (
          <div className="p-3 bg-[#F7941D]/10 border border-[#F7941D] text-[#F7941D] rounded-xl text-xs font-bold">
            ✓ {actionMessage}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F7941D]/10 text-[#F7941D] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">Total Utilisateurs</div>
              <div className="text-2xl font-extrabold text-white font-mono">{totalUsers}</div>
            </div>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">Revenu Mensuel Est. (MRR)</div>
              <div className="text-2xl font-extrabold text-white font-mono">{estimatedMRR} CAD</div>
            </div>
          </div>

          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
              <FolderCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">Projets du jour</div>
              <div className="text-2xl font-extrabold text-white font-mono">{projectsToday}</div>
            </div>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <section className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F7941D]" /> Gestion des Utilisateurs ({usersList.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2E2E2E] text-slate-400">
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Crédits</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2E2E]">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-[#1F1F1F] transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.clerkId}</div>
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold">
                      <span className="bg-[#0A0A0A] border border-[#2E2E2E] px-2 py-1 rounded text-[#F7941D]">
                        {u.plan || 'free'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{u.credits}</td>
                    <td className="py-3 px-4">
                      {u.isBanned ? (
                        <span className="bg-red-950/60 border border-red-800 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          Banni
                        </span>
                      ) : (
                        <span className="bg-green-950/60 border border-green-800 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleAddCredits(u.clerkId, 10)}
                        className="px-2.5 py-1 bg-[#F7941D] text-black font-bold rounded-lg hover:bg-[#FFB25A] transition-all text-[11px] inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> +10 Crédits
                      </button>
                      <button
                        onClick={() => handleToggleBan(u.clerkId, u.isBanned)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition-all ${
                          u.isBanned
                            ? 'bg-green-600 text-white hover:bg-green-500'
                            : 'bg-red-900/60 text-red-300 border border-red-800 hover:bg-red-800'
                        }`}
                      >
                        {u.isBanned ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {u.isBanned ? 'Débannir' : 'Bannir'}
                      </button>
                    </td>
                  </tr>
                ))}
                {usersList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tableau des projets */}
        <section className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-[#F7941D]" /> Historique des Projets ({projectsList.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2E2E2E] text-slate-400">
                  <th className="py-3 px-4">Fichier</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2E2E]">
                {projectsList.map((p) => (
                  <tr key={p._id} className="hover:bg-[#1F1F1F] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{p.fileName}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#F7941D]">{p.type}</td>
                    <td className="py-3 px-4 text-slate-300">{p.userEmail || p.clerkId}</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white rounded-lg text-[11px] font-bold">
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
                {projectsList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      Aucun projet enregistré pour le moment.
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
