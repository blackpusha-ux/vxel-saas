'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, User, MessageSquare, BookOpen, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from '@/hooks/useTranslation';

type FormStatus = 'idle' | 'sending' | 'success' | 'error' | 'rate_limited';

export default function ContactPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    if (name.trim().length < 2) {
      setErrorMessage(t('contact.nameLabel') + ' (min 2)');
      setStatus('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(t('contact.emailLabel') + ' invalide');
      setStatus('error');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMessage(t('contact.messageLabel') + ' (min 10)');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setStatus('rate_limited');
        setErrorMessage(data.error || t('contact.rateLimitTitle'));
        return;
      }

      if (!res.ok || !data.success) {
        setStatus('error');
        setErrorMessage(data.error || 'Erreur lors de l\'envoi');
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setStatus('error');
      setErrorMessage('Connexion impossible au serveur.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col font-sans selection:bg-[#F7941D] selection:text-black">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-8">
        {/* Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#F7941D]/30 text-xs font-bold text-[#F7941D]">
            <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" />
            <span>Support & Partenariats Pro</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('contact.title')}
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            {t('contact.subtitle')} — Ateliers textile, imprimeurs DTF et demandes personnalisées.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 bg-[#F7941D]/10 text-[#F7941D] rounded-xl flex items-center justify-center border border-[#F7941D]/20">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white">Réponse Express</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Notre équipe technique dédiée répond à toutes vos questions sous 24h ouvrées.
              </p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 bg-[#F7941D]/10 text-[#F7941D] rounded-xl flex items-center justify-center border border-[#F7941D]/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white">Confidentialité RGPD</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vos échanges et coordonnées restent 100% privés et ne sont jamais cédés à des tiers.
              </p>
            </div>

            <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 bg-[#F7941D]/10 text-[#F7941D] rounded-xl flex items-center justify-center border border-[#F7941D]/20">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-extrabold text-white">Support Dédié</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Questions sur le Studio, l'outil Planche DTF ou les formats d'export RIP.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 sm:p-8 relative">
            {status === 'success' ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-green-950/60 border border-green-700/50 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">{t('contact.successTitle')}</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                    {t('contact.successDesc')} Un email d'accusé de réception vous a été envoyé.
                  </p>
                </div>
                <button
                  onClick={() => setStatus('idle')}
                  className="px-5 py-2.5 bg-[#222] hover:bg-[#2E2E2E] text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : status === 'rate_limited' ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-950/60 border border-yellow-700/50 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">{t('contact.rateLimitTitle')}</h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {status === 'error' && errorMessage && (
                  <div className="flex items-start gap-2.5 px-4 py-3 bg-red-950/50 border border-red-800/50 rounded-xl text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">
                      {t('contact.nameLabel')} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => { setName(e.target.value); if (status === 'error') setStatus('idle'); }}
                        placeholder={t('contact.namePlaceholder')}
                        maxLength={100}
                        className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">
                      {t('contact.emailLabel')} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                        placeholder={t('contact.emailPlaceholder')}
                        maxLength={254}
                        className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">
                    {t('contact.subjectLabel')}
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t('contact.subjectPlaceholder')}
                      maxLength={200}
                      className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">
                    {t('contact.messageLabel')} *
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); if (status === 'error') setStatus('idle'); }}
                      placeholder={t('contact.messagePlaceholder')}
                      maxLength={2000}
                      className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none resize-none transition-colors"
                    />
                  </div>
                  <p className="text-right text-[10px] text-slate-600 mt-1">{message.length}/2000</p>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {t('contact.privacy')}
                </p>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-3 bg-[#F7941D] hover:bg-[#FFB25A] disabled:opacity-60 disabled:cursor-not-allowed text-black font-extrabold rounded-xl text-xs shadow-lg shadow-[#F7941D]/20 flex items-center justify-center gap-2 transition-colors"
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('contact.sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t('contact.sendBtn')}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
