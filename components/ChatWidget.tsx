'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Bonjour ! Je suis l\'assistant virtuel officiel de VXEL DTF Studio Pro. Comment puis-je vous aider aujourd\'hui avec vos détourages, vectorisations ou planches DTF ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'Désolé, une erreur est survenue lors de la communication.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl shadow-2xl w-[90vw] sm:w-[380px] h-[520px] flex flex-col overflow-hidden mb-4 animate-fade-in">
          {/* Header */}
          <div className="bg-[#0F0F0F] border-b border-[#2E2E2E] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#F7941D] flex items-center justify-center text-black font-black text-xs shadow-md shadow-[#F7941D]/30">
                VX
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-white text-xs">VXEL Assistant IA</h3>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400">Llama 3.3 70B • Support DTF Pro</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#222] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-[#F7941D]/10 border border-[#F7941D]/30 flex items-center justify-center text-[#F7941D] shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#F7941D] text-black font-medium rounded-br-none shadow-md shadow-[#F7941D]/10'
                      : 'bg-[#0A0A0A] border border-[#2E2E2E] text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.content}
                </div>

                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs pl-2">
                <div className="w-6 h-6 rounded-lg bg-[#F7941D]/10 border border-[#F7941D]/30 flex items-center justify-center text-[#F7941D] shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#0A0A0A] border border-[#2E2E2E] px-3 py-2 rounded-2xl flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions if few messages */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-3 py-2 border-t border-[#2E2E2E] bg-[#0E0E0E] flex flex-wrap gap-1.5">
              {[
                'Combien coûte 1 action ?',
                'Comment vectoriser un logo ?',
                'Quels formats RIP DTF ?',
              ].map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSend(suggestion)}
                  className="px-2.5 py-1 bg-[#161616] hover:bg-[#222] border border-[#2E2E2E] hover:border-[#F7941D] text-[10px] text-slate-300 rounded-lg transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-[#0F0F0F] border-t border-[#2E2E2E] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question sur VXEL DTF..."
              disabled={isLoading}
              className="flex-1 bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-[#F7941D] hover:bg-[#FFB25A] disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-xl transition-all shadow-md shadow-[#F7941D]/20 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold flex items-center justify-center shadow-2xl shadow-[#F7941D]/40 transition-all hover:scale-105 active:scale-95 group relative"
        aria-label="Assistant IA VXEL"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 fill-black" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full border-2 border-black flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-[#F7941D]" />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
