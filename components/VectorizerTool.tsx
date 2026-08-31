'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Sliders, Download, Copy, Check, Sparkles, RefreshCw, Layers, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface VectorizerStats {
  colorCount: number;
  durationMs: number;
  width: number;
  height: number;
}

export default function VectorizerTool() {
  const { t } = useTranslation();

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [vectorizedSvg, setVectorizedSvg] = useState<string | null>(null);
  const [stats, setStats] = useState<VectorizerStats | null>(null);

  // States UI
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parameters
  const [noiseFilter, setNoiseFilter] = useState<number>(1);
  const [minShapeSize, setMinShapeSize] = useState<number>(4);
  const [colorCount, setColorCount] = useState<number>(16);
  const [curveSmoothing, setCurveSmoothing] = useState<number>(1.0);

  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker('/workers/vectorizer-worker.js');
      
      workerRef.current.onmessage = (e) => {
        setIsProcessing(false);
        if (e.data.success) {
          setVectorizedSvg(e.data.svg);
          setStats(e.data.stats);
          setStatusMessage('');
        } else {
          setErrorMessage(e.data.error || 'Erreur de vectorisation');
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const processVectorization = useCallback(
    (file: File) => {
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
      setStatusMessage(t('vectorizer.analyzing'));

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      setOriginalPreviewUrl(objectUrl);

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

        setStatusMessage(t('vectorizer.processing'));

        if (workerRef.current) {
          workerRef.current.postMessage({
            imageData,
            width: img.width,
            height: img.height,
            options: {
              noiseFilter,
              minShapeSize,
              colorCount,
              curveSmoothing,
            },
          });
        } else {
          setIsProcessing(false);
          setErrorMessage('Web Worker indisponible');
        }
      };

      img.src = objectUrl;
    },
    [noiseFilter, minShapeSize, colorCount, curveSmoothing, t]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFile(file);
      processVectorization(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setOriginalFile(file);
      processVectorization(file);
    }
  };

  const handleReProcess = () => {
    if (originalFile) {
      processVectorization(originalFile);
    }
  };

  const handleDownloadSvg = () => {
    if (!vectorizedSvg) return;
    const blob = new Blob([vectorizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VXEL_Vectorized_${Date.now()}.svg`;
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
            <Zap className="w-3.5 h-3.5" /> Vectorisation DTF Anti-Bavures Pro
          </div>
          <h2 className="text-2xl font-extrabold text-white">{t('vectorizer.title')}</h2>
          <p className="text-xs text-slate-400 mt-1">{t('vectorizer.sub')}</p>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          <Sliders className="w-4 h-4 text-[#F7941D]" />
          <span>{showAdvanced ? t('vectorizer.hideAdvancedOptionsBtn') : t('vectorizer.advancedOptionsBtn')}</span>
        </button>
      </div>

      {/* Advanced Parameters Drawer */}
      {showAdvanced && (
        <div className="bg-[#161616] border border-[#F7941D]/40 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
          {/* 1. Noise Filter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">{t('vectorizer.noiseFilterLabel')}</span>
              <span className="text-[#F7941D] font-mono">{noiseFilter}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={noiseFilter}
              onChange={(e) => setNoiseFilter(parseInt(e.target.value))}
              className="w-full accent-[#F7941D] cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Élimine les bavures d'encre & contours flous DTF</p>
          </div>

          {/* 2. Min Shape Size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">{t('vectorizer.minShapeSizeLabel')}</span>
              <span className="text-[#F7941D] font-mono">{minShapeSize} px²</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={minShapeSize}
              onChange={(e) => setMinShapeSize(parseInt(e.target.value))}
              className="w-full accent-[#F7941D] cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Filtre les micro-artefacts d'impression</p>
          </div>

          {/* 3. Color Count */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">{t('vectorizer.colorCountLabel')}</span>
              <span className="text-[#F7941D] font-mono">{colorCount}</span>
            </div>
            <input
              type="range"
              min="2"
              max="64"
              step="1"
              value={colorCount}
              onChange={(e) => setColorCount(parseInt(e.target.value))}
              className="w-full accent-[#F7941D] cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Quantification des aplats de couleur</p>
          </div>

          {/* 4. Curve Smoothing */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">{t('vectorizer.curveSmoothingLabel')}</span>
              <span className="text-[#F7941D] font-mono">{curveSmoothing.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={curveSmoothing}
              onChange={(e) => setCurveSmoothing(parseFloat(e.target.value))}
              className="w-full accent-[#F7941D] cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Lissage Bézier des tracés vectoriels</p>
          </div>

          {originalFile && (
            <div className="col-span-full pt-2 flex justify-end">
              <button
                onClick={handleReProcess}
                disabled={isProcessing}
                className="px-4 py-2 bg-[#F7941D] text-black font-extrabold rounded-xl text-xs hover:bg-[#FFB25A] flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Appliquer les nouveaux réglages</span>
              </button>
            </div>
          )}
        </div>
      )}

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
            <h3 className="text-lg font-bold text-white mb-1">{t('vectorizer.dropzoneTitle')}</h3>
            <p className="text-xs text-slate-400">{t('vectorizer.dropzoneSub')}</p>
          </div>
          <label className="inline-block px-6 py-3 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs cursor-pointer shadow-lg shadow-[#F7941D]/20 transition-all">
            Sélectionner un fichier
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      )}

      {/* Main Preview (Avant / Après Grid) */}
      {originalPreviewUrl && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="px-3 py-1.5 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-xs font-bold text-slate-300 rounded-xl cursor-pointer">
                Changer d'image
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
              </label>

              {stats && (
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>🎨 {t('vectorizer.statsColors')} <strong className="text-white">{stats.colorCount}</strong></span>
                  <span>⚡ {t('vectorizer.statsTime')} <strong className="text-[#F7941D]">{stats.durationMs}ms</strong></span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyCode}
                disabled={!vectorizedSvg || isProcessing}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? t('vectorizer.codeCopied') : t('vectorizer.copyCodeBtn')}</span>
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!vectorizedSvg || isProcessing}
                className="flex-1 sm:flex-initial px-5 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#F7941D]/20"
              >
                <Download className="w-4 h-4" />
                <span>{t('vectorizer.downloadSvgBtn')}</span>
              </button>
            </div>
          </div>

          {/* Processing Status Banner */}
          {isProcessing && (
            <div className="bg-[#F7941D]/10 border border-[#F7941D] text-[#F7941D] p-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{statusMessage || t('vectorizer.processing')}</span>
            </div>
          )}

          {/* Grid Avant / Après */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avant (Original) */}
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  📷 {t('vectorizer.before')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">PNG / JPG</span>
              </div>
              <div className="relative min-h-[350px] bg-[#0A0A0A] rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-[#2E2E2E]">
                <img
                  src={originalPreviewUrl}
                  alt="Original Artwork"
                  className="max-h-[350px] max-w-full object-contain"
                />
              </div>
            </div>

            {/* Après (SVG Vectoriel) */}
            <div className="bg-[#161616] border border-[#F7941D]/50 rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
                <span className="text-xs font-extrabold uppercase text-[#F7941D] tracking-wider">
                  ⚡ {t('vectorizer.after')}
                </span>
                <span className="text-[10px] text-green-400 font-mono font-bold">Vectoriel Clean SVG</span>
              </div>

              <div
                className="relative min-h-[350px] rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-[#2E2E2E]"
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
                    className="max-h-[350px] max-w-full flex items-center justify-center [&>svg]:max-h-[350px] [&>svg]:w-auto"
                  />
                ) : (
                  <div className="text-xs text-slate-500 font-mono animate-pulse">
                    En attente du résultat vectoriel...
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
