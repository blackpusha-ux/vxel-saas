'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactModal from '@/components/ContactModal';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ShieldAlert,
  Users,
  FolderKanban,
  BarChart3,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Zap,
  ArrowLeft,
  FileSpreadsheet,
} from 'lucide-react';

const ADMIN_EMAIL = 'contact.tbalbiza@gmail.com';

interface UserRecord {
  _id: string;
  clerkId: string;
  email: string;
  credits: number;
  isBanned?: boolean;
  createdAt?: string;
}

interface ProjectRecord {
  _id: string;
  clerkId: string;
  userEmail: string;
  toolType: 'dtf-studio' | 'vectorizer' | 'planche';
  originalFileName?: string;
  originalFileUrl?: string;
  processedFileName?: string;
  processedFileUrl?: string;
  fileSize?: number;
  status: 'completed' | 'failed' | 'processing';
  creditsUsed: number;
  createdAt: string;
}

export default function AdminPage() {
  const { t } = useTranslation();
  const { user, isLoaded, isSignedIn } = useUser();

  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'stats'>('users');
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [toolFilter, setToolFilter] = useState<string>('all');

  // Data states
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Custom Credit Inputs state per user clerkId
  const [creditInputValues, setCreditInputValues] = useState<Record<string, number>>({});

  // Toast / Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal Preview Image
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Safe inspection of connected email via Clerk
  const userEmail = isLoaded ? (user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || '') : '';

  useEffect(() => {
    if (isLoaded && user) {
      console.log('User email connecté (Admin Check) :', userEmail);
    }
  }, [isLoaded, user, userEmail]);

  const isAdmin = isLoaded && isSignedIn && !!userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs :', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      let url = '/api/admin/projects?limit=100';
      if (toolFilter !== 'all') url += `&toolType=${toolFilter}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Erreur chargement projets :', err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [toolFilter, searchTerm]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchProjects();
    }
  }, [isAdmin, fetchUsers, fetchProjects]);

  // Flexible Credit Actions
  const handleUpdateCredits = async (userRecord: UserRecord, type: 'add' | 'exact' | 'quick100') => {
    const val = type === 'quick100' ? 100 : creditInputValues[userRecord.clerkId] ?? 10;
    const payload =
      type === 'exact'
        ? { clerkId: userRecord.clerkId, creditsExact: val }
        : { clerkId: userRecord.clerkId, creditsToAdd: val };

    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const msg =
          type === 'exact'
            ? `✅ Solde défini à ${data.credits} crédits pour ${userRecord.email}`
            : `✅ ${val} crédits ajoutés à ${userRecord.email}`;
        showToast(msg);
        fetchUsers();
      } else {
        showToast(data.error || 'Erreur lors de la mise à jour des crédits', 'error');
      }
    } catch (err) {
      showToast('Erreur communication serveur', 'error');
    }
  };

  // Ban / Unban User
  const handleToggleBan = async (clerkId: string, currentBanState?: boolean) => {
    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId, ban: !currentBanState }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(currentBanState ? 'Utilisateur débanni !' : 'Utilisateur banni !');
        fetchUsers();
      }
    } catch (err) {
      showToast('Erreur serveur', 'error');
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce travail ?')) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Travail supprimé avec succès !');
        fetchProjects();
      } else {
        showToast(data.error || 'Erreur lors de la suppression', 'error');
      }
    } catch (err) {
      showToast('Erreur serveur', 'error');
    }
  };

  // Download File via Admin API
  const handleDownloadProjectFile = async (projectId: string, type: 'original' | 'processed') => {
    try {
      const res = await fetch(`/api/admin/projects/${projectId}/download?type=${type}`);
      const data = await res.json();
      if (data.success && data.downloadUrl) {
        const a = document.createElement('a');
        a.href = data.downloadUrl;
        a.download = data.fileName || 'export-vxel.png';
        a.click();
      } else {
        showToast(data.error || 'Fichier non téléchargeable directement', 'error');
      }
    } catch (err) {
      showToast('Erreur téléchargement', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'users') {
      csvContent += 'ID,ClerkID,Email,Credits,Banned,Date\n';
      users.forEach((u) => {
        csvContent += `"${u._id}","${u.clerkId}","${u.email}",${u.credits},${u.isBanned || false},"${u.createdAt || ''}"\n`;
      });
    } else {
      csvContent += 'ID,ClerkID,Email,ToolType,OriginalFile,ProcessedFile,Status,CreditsUsed,Date\n';
      projects.forEach((p) => {
        csvContent += `"${p._id}","${p.clerkId}","${p.userEmail}","${p.toolType}","${p.originalFileName || ''}","${p.processedFileName || ''}","${p.status}",${p.creditsUsed},"${p.createdAt}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VXEL_Admin_Export_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#F7941D]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-xs font-bold font-mono">Vérification des droits d'accès administrateur...</span>
        </div>
      </div>
    );
  }

  // 2. Access Denied (Non Admin)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col justify-between">
        <Header onOpenContact={() => setIsContactOpen(true)} />

        <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex items-center justify-center">
          <div className="bg-[#161616] border border-red-800/80 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 bg-red-950/80 text-red-500 rounded-2xl border border-red-700/60 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">{t('adminPage.accessDenied')}</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('adminPage.accessDeniedMsg')}
              </p>
              <div className="p-3 bg-[#0A0A0A] rounded-xl border border-[#2E2E2E] text-[11px] font-mono text-slate-300 mt-2">
                Compte actuel : <span className="text-[#F7941D]">{userEmail || 'Non connecté'}</span>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs shadow-lg shadow-[#F7941D]/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('adminPage.backHome')}</span>
            </Link>
          </div>
        </main>

        <Footer onOpenContact={() => setIsContactOpen(true)} />
      </div>
    );
  }

  // Calculate statistics
  const totalUsersCount = users.length;
  const totalCreditsDistributed = users.reduce((acc, u) => acc + (u.credits || 0), 0);
  const projectsTodayCount = projects.filter((p) => {
    const d = new Date(p.createdAt);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col font-sans selection:bg-[#F7941D] selection:text-black">
      <Header onOpenContact={() => setIsContactOpen(true)} />

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-extrabold shadow-2xl flex items-center gap-2 ${
            notification.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-300'
              : 'bg-[#161616] border-[#F7941D] text-[#F7941D]'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Admin Header Banner */}
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-extrabold uppercase mb-2">
              <Zap className="w-3.5 h-3.5" /> Back-Office Administrateur B2B
            </div>
            <h1 className="text-2xl font-black text-white">{t('adminPage.title')}</h1>
            <p className="text-xs text-slate-400 mt-1">Connecté en tant que : <strong className="text-[#F7941D]">{userEmail}</strong></p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#F7941D]" />
              <span>{t('adminPage.exportCSV')}</span>
            </button>
          </div>
        </div>

        {/* 3 Tabs Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2E2E2E] pb-4">
          <div className="flex items-center gap-2 bg-[#161616] border border-[#2E2E2E] p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-[#F7941D] text-black shadow-lg shadow-[#F7941D]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('adminPage.tabs.users')} ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'bg-[#F7941D] text-black shadow-lg shadow-[#F7941D]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>{t('adminPage.tabs.projects')} ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'stats'
                  ? 'bg-[#F7941D] text-black shadow-lg shadow-[#F7941D]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('adminPage.tabs.stats')}</span>
            </button>
          </div>

          {/* Search & Tool Filters */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('adminPage.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#161616] border border-[#2E2E2E] text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#F7941D]"
              />
            </div>

            {activeTab === 'projects' && (
              <select
                value={toolFilter}
                onChange={(e) => setToolFilter(e.target.value)}
                className="bg-[#161616] border border-[#2E2E2E] text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#F7941D] font-bold"
              >
                <option value="all">Tous les outils</option>
                <option value="dtf-studio">Studio DTF</option>
                <option value="vectorizer">Image to Vector</option>
                <option value="planche">Outil Planche</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: UTILISATEURS */}
        {activeTab === 'users' && (
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F7941D]" /> {t('adminPage.users.title')}
              </h2>
              <button onClick={fetchUsers} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#222]">
                <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2E2E2E] text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-3 px-4">Utilisateur / Email</th>
                    <th className="py-3 px-4">Clerk ID</th>
                    <th className="py-3 px-4">Solde Actuel</th>
                    <th className="py-3 px-4">Gestion Flexible des Crédits</th>
                    <th className="py-3 px-4 text-right">Actions Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2E2E]/60">
                  {users
                    .filter((u) => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.clerkId.includes(searchTerm))
                    .map((u) => {
                      const inputVal = creditInputValues[u.clerkId] ?? 10;

                      return (
                        <tr key={u._id} className="hover:bg-[#1C1C1C] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">
                            {u.email}
                            {u.isBanned && (
                              <span className="ml-2 px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded-full text-[9px]">
                                Banni
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{u.clerkId}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-3 py-1 bg-[#0A0A0A] border border-[#F7941D] text-[#F7941D] font-extrabold rounded-full">
                              {u.credits} crédits
                            </span>
                          </td>
                          {/* Système Flexible */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                defaultValue="10"
                                value={inputVal}
                                onChange={(e) =>
                                  setCreditInputValues((prev) => ({
                                    ...prev,
                                    [u.clerkId]: parseInt(e.target.value) || 0,
                                  }))
                                }
                                className="w-20 bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded-xl px-2.5 py-1.5 text-xs font-mono outline-none focus:border-[#F7941D]"
                              />

                              <button
                                onClick={() => handleUpdateCredits(u, 'add')}
                                className="px-3 py-1.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-[#F7941D]/20 transition-transform active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t('adminPage.users.addCredits')}</span>
                              </button>

                              <button
                                onClick={() => handleUpdateCredits(u, 'quick100')}
                                title="Ajouter rapidement +100 crédits"
                                className="px-2.5 py-1.5 bg-[#2A1A05] border border-[#F7941D]/60 hover:bg-[#F7941D] hover:text-black text-[#F7941D] font-extrabold rounded-xl text-xs transition-all"
                              >
                                +100
                              </button>

                              <button
                                onClick={() => handleUpdateCredits(u, 'exact')}
                                className="px-3 py-1.5 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>{t('adminPage.users.setCredits')}</span>
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleToggleBan(u.clerkId, u.isBanned)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                u.isBanned
                                  ? 'bg-green-950/80 border-green-700 text-green-300 hover:bg-green-900'
                                  : 'bg-red-950/80 border-red-800 text-red-300 hover:bg-red-900'
                              }`}
                            >
                              {u.isBanned ? t('adminPage.users.unban') : t('adminPage.users.ban')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: TRAVAUX RÉCENTS */}
        {activeTab === 'projects' && (
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#F7941D]" /> {t('adminPage.projects.title')}
              </h2>
              <button onClick={fetchProjects} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#222]">
                <RefreshCw className={`w-4 h-4 ${isLoadingProjects ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2E2E2E] text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-3 px-4">{t('adminPage.projects.colDate')}</th>
                    <th className="py-3 px-4">{t('adminPage.projects.colUser')}</th>
                    <th className="py-3 px-4">{t('adminPage.projects.colTool')}</th>
                    <th className="py-3 px-4">{t('adminPage.projects.colOriginal')}</th>
                    <th className="py-3 px-4">{t('adminPage.projects.colProcessed')}</th>
                    <th className="py-3 px-4">{t('adminPage.projects.colStatus')}</th>
                    <th className="py-3 px-4 text-right">{t('adminPage.projects.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2E2E]/60">
                  {projects.map((p) => (
                    <tr key={p._id} className="hover:bg-[#1C1C1C] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{p.userEmail}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-[#0A0A0A] border border-[#F7941D]/50 text-[#F7941D] font-extrabold rounded-lg uppercase text-[10px]">
                          {p.toolType}
                        </span>
                      </td>

                      {/* Original File Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {p.originalFileUrl ? (
                            <img
                              src={p.originalFileUrl}
                              alt="Original"
                              onClick={() => setPreviewImageUrl(p.originalFileUrl!)}
                              className="w-9 h-9 object-cover rounded-lg border border-[#2E2E2E] cursor-pointer hover:scale-110 transition-transform"
                            />
                          ) : (
                            <span className="text-slate-500 font-mono">No Preview</span>
                          )}
                          <span className="truncate max-w-[120px] text-slate-300">{p.originalFileName || 'visuel.png'}</span>
                        </div>
                      </td>

                      {/* Processed File Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {p.processedFileUrl ? (
                            <img
                              src={p.processedFileUrl}
                              alt="Processed"
                              onClick={() => setPreviewImageUrl(p.processedFileUrl!)}
                              className="w-9 h-9 object-cover rounded-lg border border-[#F7941D]/60 cursor-pointer hover:scale-110 transition-transform bg-[#0A0A0A]"
                            />
                          ) : (
                            <span className="text-slate-500 font-mono">No Export</span>
                          )}
                          <span className="truncate max-w-[120px] text-slate-300">{p.processedFileName || 'export.png'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit ${
                            p.status === 'completed'
                              ? 'bg-green-950 text-green-400 border border-green-800'
                              : p.status === 'failed'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {p.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {p.status === 'failed' && <XCircle className="w-3 h-3" />}
                          {p.status === 'processing' && <Clock className="w-3 h-3 animate-spin" />}
                          <span>{p.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadProjectFile(p._id, 'processed')}
                            title="Télécharger l'export"
                            className="p-2 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-[#F7941D] rounded-xl transition-all"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProject(p._id)}
                            title="Supprimer ce travail"
                            className="p-2 bg-red-950/60 border border-red-800/80 text-red-400 hover:bg-red-900 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STATISTIQUES */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat 1: Total Users */}
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">{t('adminPage.stats.totalUsers')}</span>
                  <div className="w-10 h-10 bg-[#F7941D]/10 text-[#F7941D] rounded-xl flex items-center justify-center border border-[#F7941D]/30">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl font-black text-white">{totalUsersCount}</div>
                <p className="text-[11px] text-slate-500">Utilisateurs enregistrés dans le système</p>
              </div>

              {/* Stat 2: Total Credits Sold/Distributed */}
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">{t('adminPage.stats.creditsSold')}</span>
                  <div className="w-10 h-10 bg-[#F7941D]/10 text-[#F7941D] rounded-xl flex items-center justify-center border border-[#F7941D]/30">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl font-black text-[#F7941D]">{totalCreditsDistributed}</div>
                <p className="text-[11px] text-slate-500">Crédits totaux actuellement en circulation</p>
              </div>

              {/* Stat 3: Processing Count Today */}
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">{t('adminPage.stats.projectsToday')}</span>
                  <div className="w-10 h-10 bg-[#F7941D]/10 text-[#F7941D] rounded-xl flex items-center justify-center border border-[#F7941D]/30">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-4xl font-black text-white">{projectsTodayCount}</div>
                <p className="text-[11px] text-slate-500">Traitements de visuels exécutés aujourd'hui</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#F7941D] rounded-3xl max-w-3xl w-full p-4 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
              <span className="text-xs font-bold text-[#F7941D]">Aperçu Haute Définition</span>
              <button onClick={() => setPreviewImageUrl(null)} className="text-slate-400 hover:text-white">
                ✖
              </button>
            </div>
            <div className="min-h-[400px] bg-[#0A0A0A] rounded-2xl flex items-center justify-center p-4 border border-[#2E2E2E]">
              <img src={previewImageUrl} alt="Preview" className="max-h-[500px] max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}

      <Footer onOpenContact={() => setIsContactOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
