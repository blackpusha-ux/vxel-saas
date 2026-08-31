'use client';

import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#F7941D]" />
            <h3 className="text-lg font-extrabold text-white">Contactez l'Équipe VXEL</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#222]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Message Envoyé !</h4>
            <p className="text-xs text-slate-400">Nous vous répondrons sous 24h ouvrées.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Votre Email Pro</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@votre-atelier.fr"
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#F7941D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Votre Message / Demande</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Posez-nous vos questions techniques ou demandes sur les formats DTF..."
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#F7941D] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs shadow-lg shadow-[#F7941D]/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Envoyer le Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
