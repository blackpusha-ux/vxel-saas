'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Sliders, Download, Copy, Check, RefreshCw, Zap, AlertCircle, Layers, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface VTracerStats {
  colorCount: number;
  pathCount: number;
  durationMs: number;
  engine: string;
}

export default function VectorizerTool() {
  const { t } = useTranslation();

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [vectorizedSvg, setVectorizedSvg] = useState<string | null>(null);
  const [stats, setStats] = useState<VTracerStats | null>(null);

  // Sliders State
  const [numColors, setNumColors] = useState<number>(16);
  const [noiseFilter, setNoiseFilter] = useState<number>(4);
  const [pathPrecision, setPathPrecision] = useState<number>(4);

  // Status UI
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker('/workers/vtracer-worker.js');

      workerRef.current.onmessage = (e) => {
        setIsProcessing(false);
        setProgress(100);

        if (e.data.success) {
          setVectorizedSvg(e.data.svg);
          setStats(e.data.stats);
        } else {
          setErrorMessage(e.data.error || 'Erreur de vectorisation VTracer');
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const runVTracerVectorization = useCallback((file: File, colorsCountVal?: number, noiseVal?: number, precVal?: number) => {
    setErrorMessage(null);

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage(t('vectorizer.errorFileTooLarge'));
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErrorMessage(t('vectorizer.errorInvalidFormat'));
      return;
    }

    setIsProcessing(true);
    setProgress(15);

    const objectUrl = URL.createObjectURL(file);
    setOriginalPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        setErrorMessage('Erreur canvas');
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      setProgress(40);

      if (workerRef.current) {
        workerRef.current.postMessage({
          imageData,
          width: img.width,
          height: img.height,
          options: {
            color_mode: 'color',
            hierarchical: 'stacked',
            mode: 'spline',
            filter_speckle: noiseVal ?? noiseFilter,
            number_of_colors: colorsCountVal ?? numColors,
            path_precision: precVal ?? pathPrecision,
            layer_difference: 16,
            color_precision: 6,
          },
        });
      } else {
        setIsProcessing(false);
        setErrorMessage('Worker VTracer non disponible');
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Impossible de lire la carte d\'image');
    };

    img.src = objectUrl;
  }, [noiseFilter, numColors, pathPrecision, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFile(file);
      runVTracerVectorization(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setOriginalFile(file);
      runVTracerVectorization(file);
    }
  };

  const handleDownloadSvg = () => {
    if (!vectorizedSvg) return;
    const blob = new Blob([vectorizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VXEL_VTracer_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (!vectorizedSvg) return;
    navigator.clipboard.writeText(vectorizedSvg);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Banner Title */}
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-extrabold uppercase mb-2">
            <Zap className="w-3.5 h-3.5" /> Moteur Open-Source VTracer Core
          </div>
          <h2 className="text-2xl font-black text-white">{t('vectorizer.title')}</h2>
          <p className="text-xs text-slate-400 mt-1">{t('vectorizer.sub')}</p>
        </div>

        {originalFile && (
          <button
            onClick={() => runVTracerVectorization(originalFile)}
            disabled={isProcessing}
            className="px-5 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs shadow-lg shadow-[#F7941D]/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Re-Vectoriser avec VTracer</span>
          </button>
        )}
      </div>

      {/* Control Sliders Panel */}
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colors Count Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>{t('vectorizer.colors')}</span>
            <span className="text-[#F7941D] font-mono">{numColors}</span>
          </div>
          <input
            type="range"
            min="2"
            max="32"
            value={numColors}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setNumColors(val);
              if (originalFile) runVTracerVectorization(originalFile, val, noiseFilter, pathPrecision);
            }}
            className="w-full accent-[#F7941D]"
          />
        </div>

        {/* Noise Filter Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>{t('vectorizer.noiseFilter')}</span>
            <span className="text-[#F7941D] font-mono">{noiseFilter} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={noiseFilter}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setNoiseFilter(val);
              if (originalFile) runVTracerVectorization(originalFile, numColors, val, pathPrecision);
            }}
            className="w-full accent-[#F7941D]"
          />
        </div>

        {/* Curve Precision Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>{t('vectorizer.precision')}</span>
            <span className="text-[#F7941D] font-mono">{pathPrecision} / 8</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={pathPrecision}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setPathPrecision(val);
              if (originalFile) runVTracerVectorization(originalFile, numColors, noiseFilter, val);
            }}
            className="w-full accent-[#F7941D]"
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 p-4 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      {!originalPreviewUrl && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#F7941D]/50 hover:border-[#F7941D] bg-[#161616] hover:bg-[#1A1A1A] rounded-3xl p-12 text-center transition-all cursor-pointer space-y-4"
        >
          <div className="w-16 h-16 bg-[#F7941D]/10 text-[#F7941D] rounded-2xl flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{t('vectorizer.dropzone')}</h3>
            <p className="text-xs text-slate-400">{t('vectorizer.dropzoneSub')}</p>
          </div>
          <label className="inline-block px-6 py-3 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs cursor-pointer shadow-lg shadow-[#F7941D]/20 transition-all">
            Sélectionner un fichier
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      )}

      {/* Processing Status Banner */}
      {isProcessing && (
        <div className="bg-[#161616] border border-[#F7941D]/50 p-6 rounded-2xl space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-[#F7941D]">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> {t('vectorizer.processing')}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-[#0A0A0A] h-2.5 rounded-full overflow-hidden border border-[#2E2E2E]">
            <div className="bg-[#F7941D] h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Main Preview (Avant / Après Grid) */}
      {originalPreviewUrl && !isProcessing && (
        <div className="space-y-6">
          {/* Actions Bar & Stats */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="px-3 py-1.5 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-xs font-bold text-slate-300 rounded-xl cursor-pointer">
                Changer d'image
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
              </label>

              {stats && (
                <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                  <span>⚡ Moteur : <strong className="text-[#F7941D]">{stats.engine}</strong></span>
                  <span>🎨 Couleurs : <strong className="text-white">{stats.colorCount}</strong></span>
                  <span>📏 Tracés Bézier : <strong className="text-[#F7941D]">{stats.pathCount.toLocaleString()}</strong></span>
                  <span>⏱️ Temps : <strong className="text-white">{stats.durationMs}ms</strong></span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyCode}
                disabled={!vectorizedSvg}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? t('vectorizer.codeCopied') : t('vectorizer.copyCode')}</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!vectorizedSvg}
                className="flex-1 sm:flex-initial px-5 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#F7941D]/20"
              >
                <Download className="w-4 h-4" />
                <span>{t('vectorizer.download')}</span>
              </button>
            </div>
          </div>

          {/* Grid Avant / Après */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avant (Original) */}
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  📷 {t('vectorizer.before')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">PNG / JPG / WEBP</span>
              </div>
              <div className="relative min-h-[380px] bg-[#0A0A0A] rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-[#2E2E2E]">
                <img
                  src={originalPreviewUrl}
                  alt="Original Artwork"
                  className="max-h-[380px] max-w-full object-contain"
                />
              </div>
            </div>

            {/* Après (SVG VTracer HD) */}
            <div className="bg-[#161616] border border-[#F7941D]/50 rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
                <span className="text-xs font-extrabold uppercase text-[#F7941D] tracking-wider">
                  ⚡ {t('vectorizer.after')}
                </span>
                <span className="text-[10px] text-green-400 font-mono font-bold">VTracer Core Multicolore</span>
              </div>

              <div
                className="relative min-h-[380px] rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-[#2E2E2E]"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  backgroundColor: '#111',
                }}
              >
                {vectorizedSvg ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: vectorizedSvg }}
                    className="max-h-[380px] max-w-full flex items-center justify-center [&>svg]:max-h-[380px] [&>svg]:w-auto [&>svg]:h-auto"
                  />
                ) : (
                  <div className="text-xs text-slate-500 font-mono animate-pulse">
                    Vectorisation VTracer en cours...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
