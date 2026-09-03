'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactModal from '@/components/ContactModal';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Sparkles,
  Zap,
  Wand2,
  Download,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  Copy,
  Check,
} from 'lucide-react';

interface GenerationItem {
  id: string;
  prompt: string;
  style: string;
  format: string;
  imageUrl: string;
  createdAt: string;
}

const STYLES = [
  { id: 'realistic', labelKey: 'generate.styles.realistic', promptSuffix: ', highly detailed, realistic apparel graphic design, clean lighting, 8k resolution' },
  { id: 'manga', labelKey: 'generate.styles.manga', promptSuffix: ', modern anime manga illustration style, bold sharp lines, vibrant colors, DTF shirt print design' },
  { id: 'cartoon', labelKey: 'generate.styles.cartoon', promptSuffix: ', dynamic cartoon vector mascot style, bold contours, vivid colors, t-shirt sticker aesthetic' },
  { id: 'vintage', labelKey: 'generate.styles.vintage', promptSuffix: ', vintage retro distressed screen print style, 90s aesthetic, faded grunge texture, apparel design' },
  { id: 'pixelart', labelKey: 'generate.styles.pixelart', promptSuffix: ', crisp 16-bit pixel art style, retro arcade gaming graphic, isolated design' },
];

const FORMATS = [
  { id: '1:1', labelKey: 'generate.formats.square', width: 1024, height: 1024 },
  { id: '16:9', labelKey: 'generate.formats.landscape', width: 1280, height: 720 },
  { id: '9:16', labelKey: 'generate.formats.portrait', width: 720, height: 1280 },
  { id: '4:3', labelKey: 'generate.formats.standard', width: 1024, height: 768 },
];

export default function GeneratePage() {
  const { t } = useTranslation();
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Form states
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cartoon');
  const [format, setFormat] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Local history
  const [history, setHistory] = useState<GenerationItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vxel_generated_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading generation history:', e);
    }
  }, []);

  // Save item to history
  const saveToHistory = (item: GenerationItem) => {
    const updated = [item, ...history.filter((h) => h.imageUrl !== item.imageUrl)].slice(0, 10);
    setHistory(updated);
    try {
      localStorage.setItem('vxel_generated_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving generation history:', e);
    }
  };

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);

    const selectedFormat = FORMATS.find((f) => f.id === format) || FORMATS[0];
    const selectedStyle = STYLES.find((s) => s.id === style) || STYLES[0];

    // Build the enhanced prompt for DTF apparel creation
    const fullPrompt = `${prompt.trim()}${selectedStyle.promptSuffix}, white isolated background, ready for DTF printing`;
    const encodedPrompt = encodeURIComponent(fullPrompt);
    const randomSeed = Math.floor(Math.random() * 1000000);

    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${selectedFormat.width}&height=${selectedFormat.height}&model=flux&nologo=true&seed=${randomSeed}`;

    // Preload image before displaying
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setCurrentImage(url);
      setIsGenerating(false);

      const newItem: GenerationItem = {
        id: `${Date.now()}`,
        prompt: prompt.trim(),
        style,
        format,
        imageUrl: url,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveToHistory(newItem);
    };

    img.onerror = () => {
      setIsGenerating(false);
      // Fallback display direct URL
      setCurrentImage(url);
    };

    img.src = url;
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    try {
      const res = await fetch(currentImage);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `VXEL_AI_Design_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback direct link
      window.open(currentImage, '_blank');
    }
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-100 flex flex-col font-sans selection:bg-[#F7941D] selection:text-black">
      {/* Header */}
      <Header onOpenContact={() => setIsContactOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 space-y-10 w-full">
        {/* Top Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161616] border border-[#F7941D]/40 text-xs font-bold text-[#F7941D] shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" />
            <span>Flux IA 100% Gratuit & Illimité</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t('generate.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {t('generate.subtitle')}
          </p>
        </div>

        {/* Conversion CTA Banner */}
        <div className="bg-gradient-to-r from-[#161616] via-[#1E1710] to-[#161616] border border-[#F7941D]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-[#F7941D]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F7941D]/10 border border-[#F7941D]/30 flex items-center justify-center text-[#F7941D] shrink-0">
              <Zap className="w-5 h-5 fill-[#F7941D]" />
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-bold">
              {t('generate.ctaBanner')}
            </p>
          </div>
          <Link
            href="/pricing"
            className="px-5 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black text-xs font-extrabold rounded-xl transition-all shadow-md shadow-[#F7941D]/20 shrink-0 flex items-center gap-2"
          >
            <span>{t('generate.ctaButton')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Generator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-5 bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
            {/* Prompt Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <label htmlFor="prompt">{t('generate.promptLabel')}</label>
                {prompt && (
                  <button
                    onClick={handleCopyPrompt}
                    className="text-slate-500 hover:text-[#F7941D] flex items-center gap-1 text-[11px] transition-colors"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? 'Copié' : 'Copier'}</span>
                  </button>
                )}
              </div>
              <textarea
                id="prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('generate.prompt')}
                className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] focus:ring-1 focus:ring-[#F7941D] rounded-2xl p-4 text-xs text-white placeholder-slate-500 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Quick Inspiration Tags */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400">💡 Idées rapides :</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Tigre cybernétique néon pour t-shirt',
                  'Crâne viking avec haches vintage',
                  'Astronaute jouant de la guitare',
                  'Chat samouraï japonais streetwear',
                ].map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(tag)}
                    className="px-2.5 py-1 bg-[#0A0A0A] hover:bg-[#222] border border-[#2E2E2E] hover:border-[#F7941D] text-slate-300 hover:text-white rounded-lg text-[10px] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Selects: Style & Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#F7941D]" />
                  <span>{t('generate.style')}</span>
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  {STYLES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {t(s.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#F7941D]" />
                  <span>{t('generate.format')}</span>
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2E2E2E] focus:border-[#F7941D] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  {FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {t(f.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-[#F7941D] hover:bg-[#FFB25A] disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-sm rounded-2xl transition-all shadow-xl shadow-[#F7941D]/20 flex items-center justify-center gap-2 group"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>{t('generate.loading')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black group-hover:scale-110 transition-transform" />
                  <span>{t('generate.button')}</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden shadow-xl">
              {/* Checkerboard Background when image is loaded */}
              <div
                className="w-full h-full min-h-[380px] rounded-2xl flex items-center justify-center p-4 border border-[#2E2E2E] relative overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #1c1c1c 25%, transparent 25%), linear-gradient(-45deg, #1c1c1c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c1c 75%), linear-gradient(-45deg, transparent 75%, #1c1c1c 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  backgroundColor: '#0F0F0F',
                }}
              >
                {isGenerating ? (
                  <div className="text-center space-y-4 animate-pulse">
                    <div className="w-16 h-16 rounded-2xl bg-[#F7941D]/10 border border-[#F7941D]/30 flex items-center justify-center mx-auto text-[#F7941D]">
                      <Sparkles className="w-8 h-8 animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">Génération de votre visuel textile en cours...</p>
                      <p className="text-xs text-slate-400">Modèle Flux IA HD sans filigrane</p>
                    </div>
                  </div>
                ) : currentImage ? (
                  <img
                    src={currentImage}
                    alt={prompt}
                    className="max-h-[420px] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
                  />
                ) : (
                  <div className="text-center space-y-3 p-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#2E2E2E] flex items-center justify-center mx-auto text-slate-500">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-300">Votre création apparaîtra ici</p>
                      <p className="text-xs text-slate-500">Saisissez un prompt à gauche et cliquez sur Générer</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons for Current Image */}
              {currentImage && !isGenerating && (
                <div className="w-full pt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/vectoriseur`}
                      className="px-4 py-2.5 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-[#F7941D] hover:bg-[#F7941D]/10 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{t('generate.actions.vectorize')}</span>
                    </Link>

                    <Link
                      href={`/dtf-studio`}
                      className="px-4 py-2.5 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white hover:bg-[#222] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-[#F7941D]" />
                      <span>{t('generate.actions.studio')}</span>
                    </Link>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="px-5 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl transition-all shadow-md shadow-[#F7941D]/20 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('generate.actions.download')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Local History Section */}
        {history.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-[#2E2E2E]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F7941D]" />
                <span>{t('generate.history')}</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">{history.length} / 10 sauvegardes</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentImage(item.imageUrl);
                    setPrompt(item.prompt);
                    setStyle(item.style);
                    setFormat(item.format);
                  }}
                  className="group bg-[#161616] border border-[#2E2E2E] hover:border-[#F7941D] rounded-2xl p-2.5 cursor-pointer transition-all space-y-2"
                >
                  <div className="aspect-square bg-[#0A0A0A] rounded-xl overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-200 truncate">{item.prompt}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="uppercase text-[#F7941D] font-mono">{item.style}</span>
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenContact={() => setIsContactOpen(true)} />

      {/* Contact Modal */}
      {isContactOpen && <ContactModal onClose={() => setIsContactOpen(false)} />}
    </div>
  );
}
