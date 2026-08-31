'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Sliders, Download, Copy, Check, Sparkles, RefreshCw, Zap, AlertTriangle, AlertCircle, Server, Image as ImageIcon, Trash2, Wand2, Layers, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export const DTF_VECTORIZER_PROMPT =
  "Vectorise cette image en SVG haute qualité pour impression DTF professionnelle avec suppression automatique du fond pour obtenir un fond 100% transparent mode vectorisation couleur complète avec hiérarchie cutout en couches superposées conserver toutes les couleurs distinctes et la palette fidèle à l'originale sans dithering précision des courbes de Bézier élevée pour des contours nets et lisses réduction du bruit et suppression des artefacts pixels parasites préserver tous les détails importants optimiser les paths pour un fichier léger mais détaillé qualité équivalente 300 DPI minimum contours vectoriels propres sans pixelisation aplats de couleurs vives pour style cartoon et dégradés convertis en zones discrètes pour style réaliste résultat final SVG vectoriel scalable à l'infini avec fond transparent prêt pour impression DTF textile professionnelle";

interface VectorizerStats {
  colors_count?: number;
  total_paths?: number;
  durationMs: number;
  engine?: string;
  width?: number;
  height?: number;
}

interface SavedProject {
  id: string;
  name: string;
  svg: string;
  pngBase64?: string;
  previewUrl: string;
  date: string;
  stats?: VectorizerStats;
}

export default function VectorizerTool() {
  const { t } = useTranslation();

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [vectorizedSvg, setVectorizedSvg] = useState<string | null>(null);
  const [transparentPngBase64, setTransparentPngBase64] = useState<string | null>(null);
  const [stats, setStats] = useState<VectorizerStats | null>(null);

  // VTracer Advanced Controls State
  const [colorMode, setColorMode] = useState<'color' | 'binary'>('color');
  const [hierarchical, setHierarchical] = useState<'cutout' | 'stacked'>('cutout');
  const [filterSpeckle, setFilterSpeckle] = useState<number>(5);
  const [cornerThreshold, setCornerThreshold] = useState<number>(0.6);
  const [lengthThreshold, setLengthThreshold] = useState<number>(4.0);
  const [maxIterations, setMaxIterations] = useState<number>(10);
  const [colorPrecision, setColorPrecision] = useState<number>(8);
  const [pathPrecision, setPathPrecision] = useState<number>(8);
  const [layerDifference, setLayerDifference] = useState<number>(16);
  const [autoRemoveBg, setAutoRemoveBg] = useState<boolean>(true);
  const [customPrompt, setCustomPrompt] = useState<string>(DTF_VECTORIZER_PROMPT);

  // States UI
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLowRes, setIsLowRes] = useState(false);
  const [history, setHistory] = useState<SavedProject[]>([]);

  const workerRef = useRef<Worker | null>(null);

  // Load History from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vxel_vector_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load history');
    }
  }, []);

  // Initialize Web Worker Fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker('/workers/vectorizer-worker.js');

      workerRef.current.onmessage = (e) => {
        setIsProcessing(false);
        setProgress(100);
        if (e.data.success) {
          setVectorizedSvg(e.data.svg);
          setStats({
            colors_count: e.data.stats.colorCount,
            total_paths: e.data.stats.pathCount,
            durationMs: e.data.stats.durationMs,
            engine: 'Client Web Worker (Fallback)',
          });
          setStatusMessage('');
        } else {
          setErrorMessage(e.data.error || 'Erreur lors de la vectorisation');
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const fallbackToLocalWorker = useCallback((file: File) => {
    setStatusMessage('Execution de secours Web Worker...');
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

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

      if (workerRef.current) {
        workerRef.current.postMessage({
          imageData,
          width: img.width,
          height: img.height,
          options: {
            noiseFilter: Math.round(filterSpeckle / 2),
            minShapeSize: filterSpeckle * 10,
            colorCount: Math.pow(2, Math.min(5, colorPrecision - 3)) * 4,
            curveSmoothing: cornerThreshold * 2,
            scale: pathPrecision >= 7 ? 2 : 1,
          },
        });
      } else {
        setIsProcessing(false);
        setErrorMessage('Vectoriseur indisponible');
      }
    };

    img.src = objectUrl;
  }, [filterSpeckle, colorPrecision, cornerThreshold, pathPrecision]);

  const processVectorization = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setIsLowRes(false);

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
      setStatusMessage('Analyse de l\'image & pré-traitement IA rembg...');

      const objectUrl = URL.createObjectURL(file);
      setOriginalPreviewUrl(objectUrl);

      const img = new Image();
      img.onload = () => {
        if (img.width < 500 || img.height < 500) {
          setIsLowRes(true);
        }
      };
      img.src = objectUrl;

      // Simulate progress bar
      const timer = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 300);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append(
          'options',
          JSON.stringify({
            color_mode: colorMode,
            hierarchical,
            filter_speckle: filterSpeckle,
            corner_threshold: cornerThreshold,
            length_threshold: lengthThreshold,
            max_iterations: maxIterations,
            color_precision: colorPrecision,
            path_precision: pathPrecision,
            layer_difference: layerDifference,
            auto_remove_bg: autoRemoveBg,
            prompt: customPrompt,
          })
        );

        setStatusMessage('Génération des tracés Bézier VTracer 300 DPI...');

        const res = await fetch('/api/vectorize', {
          method: 'POST',
          body: formData,
        });

        clearInterval(timer);
        setProgress(95);

        const data = await res.json();

        if (data.success && data.svg) {
          setIsProcessing(false);
          setProgress(100);
          setVectorizedSvg(data.svg);
          setTransparentPngBase64(data.pngBase64 || null);
          setStats(data.stats);
          setStatusMessage('');

          // Save to local project history
          const newProj: SavedProject = {
            id: `proj_${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            svg: data.svg,
            pngBase64: data.pngBase64,
            previewUrl: objectUrl,
            date: new Date().toLocaleDateString(),
            stats: data.stats,
          };

          setHistory((prev) => {
            const updated = [newProj, ...prev.slice(0, 9)];
            localStorage.setItem('vxel_vector_history', JSON.stringify(updated));
            return updated;
          });
        } else {
          console.warn('Server vectorization error, fallback to worker:', data.error);
          fallbackToLocalWorker(file);
        }
      } catch (err) {
        clearInterval(timer);
        console.warn('Server call failed, fallback to worker:', err);
        fallbackToLocalWorker(file);
      }
    },
    [
      colorMode,
      hierarchical,
      filterSpeckle,
      cornerThreshold,
      lengthThreshold,
      maxIterations,
      colorPrecision,
      pathPrecision,
      layerDifference,
      autoRemoveBg,
      customPrompt,
      fallbackToLocalWorker,
      t,
    ]
  );

  const applyDtfPreset = () => {
    setColorMode('color');
    setHierarchical('cutout');
    setFilterSpeckle(5);
    setCornerThreshold(0.6);
    setLengthThreshold(4.0);
    setMaxIterations(10);
    setColorPrecision(8);
    setPathPrecision(8);
    setLayerDifference(16);
    setAutoRemoveBg(true);
    setCustomPrompt(DTF_VECTORIZER_PROMPT);

    if (originalFile) {
      setTimeout(() => processVectorization(originalFile), 100);
    }
  };

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

  const handleDownloadSvg = () => {
    if (!vectorizedSvg) return;
    const blob = new Blob([vectorizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VXEL_DTF_Vector_${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!transparentPngBase64) return;
    const a = document.createElement('a');
    a.href = transparentPngBase64;
    a.download = `VXEL_DTF_Transparent_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCode = () => {
    if (!vectorizedSvg) return;
    navigator.clipboard.writeText(vectorizedSvg);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('vxel_vector_history', JSON.stringify(updated));
      return updated;
    });
  };

  const loadHistoryItem = (item: SavedProject) => {
    setOriginalPreviewUrl(item.previewUrl);
    setVectorizedSvg(item.svg);
    setTransparentPngBase64(item.pngBase64 || null);
    if (item.stats) setStats(item.stats);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Banner Title & Main Actions */}
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-xs font-extrabold uppercase mb-2">
            <Zap className="w-3.5 h-3.5" /> Moteur VTracer & Potrace IA 300 DPI
          </div>
          <h2 className="text-2xl font-black text-white">{t('vectorizer.title')}</h2>
          <p className="text-xs text-slate-400 mt-1">{t('vectorizer.sub')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAutoRemoveBg(!autoRemoveBg)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              autoRemoveBg
                ? 'bg-green-950/60 border-green-500 text-green-300'
                : 'bg-[#0A0A0A] border-[#2E2E2E] text-slate-400'
            }`}
          >
            <Wand2 className="w-4 h-4 text-[#F7941D]" />
            <span>Fond AI Transparent {autoRemoveBg ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={applyDtfPreset}
            className="px-4 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs shadow-lg shadow-[#F7941D]/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{t('vectorizer.dtfPresetBtn')}</span>
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2.5 bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-[#F7941D]" />
            <span>{showAdvanced ? t('vectorizer.hideAdvancedOptionsBtn') : t('vectorizer.advancedOptionsBtn')}</span>
          </button>
        </div>
      </div>

      {/* Advanced VTracer Configuration Drawer */}
      {showAdvanced && (
        <div className="bg-[#161616] border border-[#F7941D]/40 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
            <h3 className="text-sm font-extrabold text-[#F7941D] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Configuration Moteur VTracer & Bézier DTF
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Precision: 300 DPI Vector</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Color Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Mode Couleur (color_mode)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setColorMode('color')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    colorMode === 'color' ? 'bg-[#F7941D] text-black border-[#F7941D]' : 'bg-[#0A0A0A] border-[#2E2E2E]'
                  }`}
                >
                  Couleur Complète
                </button>
                <button
                  onClick={() => setColorMode('binary')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    colorMode === 'binary' ? 'bg-[#F7941D] text-black border-[#F7941D]' : 'bg-[#0A0A0A] border-[#2E2E2E]'
                  }`}
                >
                  Binaire N&B
                </button>
              </div>
            </div>

            {/* Hierarchical Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Hiérarchie Couches (hierarchical)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setHierarchical('cutout')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    hierarchical === 'cutout' ? 'bg-[#F7941D] text-black border-[#F7941D]' : 'bg-[#0A0A0A] border-[#2E2E2E]'
                  }`}
                >
                  Découpe (Cutout)
                </button>
                <button
                  onClick={() => setHierarchical('stacked')}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    hierarchical === 'stacked' ? 'bg-[#F7941D] text-black border-[#F7941D]' : 'bg-[#0A0A0A] border-[#2E2E2E]'
                  }`}
                >
                  Superposé (Stacked)
                </button>
              </div>
            </div>

            {/* Filter Speckle */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Filtre Speckle (filter_speckle)</span>
                <span className="text-[#F7941D] font-mono">{filterSpeckle} px²</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={filterSpeckle}
                onChange={(e) => setFilterSpeckle(parseInt(e.target.value))}
                className="w-full accent-[#F7941D] cursor-pointer"
              />
            </div>

            {/* Corner Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Seuil Angles (corner_threshold)</span>
                <span className="text-[#F7941D] font-mono">{cornerThreshold.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={cornerThreshold}
                onChange={(e) => setCornerThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#F7941D] cursor-pointer"
              />
            </div>

            {/* Length Threshold */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Seuil Longueur (length_threshold)</span>
                <span className="text-[#F7941D] font-mono">{lengthThreshold.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={lengthThreshold}
                onChange={(e) => setLengthThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#F7941D] cursor-pointer"
              />
            </div>

            {/* Max Iterations */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Max Itérations (max_iterations)</span>
                <span className="text-[#F7941D] font-mono">{maxIterations}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={maxIterations}
                onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                className="w-full accent-[#F7941D] cursor-pointer"
              />
            </div>

            {/* Color Precision */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Précision Couleurs (color_precision)</span>
                <span className="text-[#F7941D] font-mono">{colorPrecision}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={colorPrecision}
                onChange={(e) => setColorPrecision(parseInt(e.target.value))}
                className="w-full accent-[#F7941D] cursor-pointer"
              />
            </div>

            {/* Path Precision */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Précision Tracés (path_precision)</span>
                <span className="text-[#F7941D] font-mono">{pathPrecision}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={pathPrecision}
                onChange={(e) => setPathPrecision(parseInt(e.target.value))}
                className="w-full accent-[#F7941D] cursor-pointer"
              />
            </div>

            {/* Layer Difference */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Différence Couches (layer_difference)</span>
                <span className="text-[#F7941D] font-mono">{layerDifference}</span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                step="2"
                value={layerDifference}
                onChange={(e) => setLayerDifference(parseInt(e.target.value))}
                className="w-full accent-[#F7941D] cursor-pointer"
              />
            </div>
          </div>

          {/* Embedded Prompt Box */}
          <div className="space-y-2 pt-3 border-t border-[#2E2E2E]">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" /> Prompt de Vectorisation Intégré DTF :
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2E2E2E] text-slate-300 rounded-xl p-3 text-xs font-mono focus:border-[#F7941D] outline-none"
            />
          </div>

          {originalFile && (
            <div className="flex justify-end">
              <button
                onClick={() => processVectorization(originalFile)}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#F7941D]/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Exécuter Vectorisation avec Prompt DTF</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Warning Resolution */}
      {isLowRes && (
        <div className="bg-amber-950/60 border border-amber-600/60 text-amber-200 p-4 rounded-2xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>{t('vectorizer.lowResWarning')}</span>
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

      {/* Processing Status Banner with Progress Bar */}
      {isProcessing && (
        <div className="bg-[#161616] border border-[#F7941D]/50 p-6 rounded-2xl space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-[#F7941D]">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> {statusMessage || 'Traitement en cours...'}
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
                  {stats.colors_count && <span>🎨 Couleurs: <strong className="text-white">{stats.colors_count}</strong></span>}
                  {stats.total_paths && <span>📏 Tracés Bézier: <strong className="text-[#F7941D]">{stats.total_paths.toLocaleString()}</strong></span>}
                  <span>⏱️ Temps: <strong className="text-white">{stats.durationMs}ms</strong></span>
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
                <span>{copiedCode ? t('vectorizer.codeCopied') : t('vectorizer.copyCodeBtn')}</span>
              </button>

              {transparentPngBase64 && (
                <button
                  onClick={handleDownloadPng}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#161616] border border-[#F7941D]/60 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-[#222]"
                >
                  <ImageIcon className="w-4 h-4 text-[#F7941D]" />
                  <span>PNG Transparent HD</span>
                </button>
              )}

              <button
                onClick={handleDownloadSvg}
                disabled={!vectorizedSvg}
                className="flex-1 sm:flex-initial px-5 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#F7941D]/20"
              >
                <Download className="w-4 h-4" />
                <span>{t('vectorizer.downloadSvgBtn')}</span>
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

            {/* Après (SVG Vectoriel VTracer HD) */}
            <div className="bg-[#161616] border border-[#F7941D]/50 rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
                <span className="text-xs font-extrabold uppercase text-[#F7941D] tracking-wider">
                  ⚡ {t('vectorizer.after')}
                </span>
                <span className="text-[10px] text-green-400 font-mono font-bold">VTracer Vector 300 DPI</span>
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
                    Génération des tracés vectoriels VTracer...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History of Saved Vectorizations */}
      {history.length > 0 && (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#F7941D]" /> Historique des Projets Vectorisés ({history.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => loadHistoryItem(item)}
                className="bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] rounded-2xl p-3 cursor-pointer group transition-all relative flex flex-col justify-between"
              >
                <div className="w-full h-24 bg-[#111] rounded-xl flex items-center justify-center overflow-hidden mb-2 relative">
                  <div
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                    className="max-h-20 max-w-full [&>svg]:max-h-20 [&>svg]:w-auto"
                  />
                  <button
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="absolute top-1 right-1 p-1 bg-red-950/80 text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                  <span className="text-[10px] text-slate-500">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
