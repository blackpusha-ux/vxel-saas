'use client';

import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, AlertCircle, Loader2, User, MessageSquare, BookOpen } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStatus = 'idle' | 'sending' | 'success' | 'error' | 'rate_limited';

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    if (status !== 'sending') {
      onClose();
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    // Client-side validation
    if (name.trim().length < 2) {
      setErrorMessage('Votre nom doit contenir au moins 2 caractères.');
      setStatus('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Adresse email invalide.');
      setStatus('error');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMessage('Votre message doit faire au moins 10 caractères.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setStatus('rate_limited');
        setErrorMessage(data.error || 'Trop de messages envoyés. Réessayez dans 10 minutes.');
        return;
      }

      if (!res.ok || !data.success) {
        setStatus('error');
        setErrorMessage(data.error || 'Une erreur est survenue. Veuillez réessayer.');
        return;
      }

      setStatus('success');
      // Auto-close after 4s
      setTimeout(handleClose, 4000);
    } catch {
      setStatus('error');
      setErrorMessage('Impossible de joindre le serveur. Vérifiez votre connexion.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl relative flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#2E2E2E] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#F7941D]/15 border border-[#F7941D]/30 rounded-xl flex items-center justify-center">
              <Mail className="w-4.5 h-4.5 text-[#F7941D]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-none">Contactez l'Équipe VXEL</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Réponse sous 24h ouvrées</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={status === 'sending'}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#222] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[75vh] sm:max-h-none px-6 py-5">

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-950/60 border border-green-700/50 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">Message envoyé ! 🎉</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Nous avons bien reçu votre demande.<br />
                  Un email de confirmation vous a été envoyé.<br />
                  Notre équipe vous répondra sous <span className="text-[#F7941D] font-bold">24h ouvrées</span>.
                </p>
              </div>
            </div>
          )}

          {/* RATE LIMITED STATE */}
          {status === 'rate_limited' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-yellow-950/60 border border-yellow-700/40 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7 text-yellow-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Limite atteinte</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{errorMessage}</p>
              </div>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-[#222] text-slate-300 text-xs font-bold rounded-xl hover:bg-[#2E2E2E] transition-colors"
              >
                Fermer
              </button>
            </div>
          )}

          {/* FORM STATE */}
          {(status === 'idle' || status === 'sending' || status === 'error') && (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Error banner */}
              {status === 'error' && errorMessage && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 bg-red-950/50 border border-red-800/50 rounded-xl text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">
                  Votre Nom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (status === 'error') setStatus('idle'); }}
                    placeholder="Jean Dupont"
                    maxLength={100}
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">
                  Votre Email Pro *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                    placeholder="contact@votre-atelier.fr"
                    maxLength={254}
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">
                  Sujet (optionnel)
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Question technique, partenariat, facturation..."
                    maxLength={200}
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 mb-1 uppercase tracking-wider">
                  Votre Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); if (status === 'error') setStatus('idle'); }}
                    placeholder="Posez-nous vos questions sur les formats DTF, le Studio, les planches d'impression..."
                    maxLength={2000}
                    className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none resize-none transition-colors"
                  />
                </div>
                <p className="text-right text-[10px] text-slate-600 mt-1">{message.length}/2000</p>
              </div>

              {/* Privacy notice */}
              <p className="text-[10px] text-slate-600 leading-relaxed">
                🔒 Votre adresse email ne sera jamais affichée publiquement. Nous utilisons Resend pour un envoi sécurisé conforme RGPD.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3 bg-[#F7941D] hover:bg-[#FFB25A] disabled:opacity-60 disabled:cursor-not-allowed text-black font-extrabold rounded-xl text-xs shadow-lg shadow-[#F7941D]/20 flex items-center justify-center gap-2 transition-colors"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer le Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
