'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Sliders, Download, Copy, Check, RefreshCw, Zap, AlertCircle, Layers, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ImageToVectorStats {
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
  const [stats, setStats] = useState<ImageToVectorStats | null>(null);

  // Sliders State — valeurs optimisées pour les visuels complexes type DTF
  const [numColors, setNumColors] = useState<number>(20);       // plus de couleurs par défaut
  const [noiseFilter, setNoiseFilter] = useState<number>(3);    // moins agressif
  const [pathPrecision, setPathPrecision] = useState<number>(5); // plus de fidélité
  const [smoothness, setSmoothness] = useState<number>(4);      // lissage courbes (1-8)
  const [minShapeSize, setMinShapeSize] = useState<number>(3);  // taille mini formes px

  // Status UI
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressLabel, setProgressLabel] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker('/workers/vtracer-worker.js');

      workerRef.current.onmessage = async (e) => {
        setIsProcessing(false);
        setProgress(100);
        setProgressLabel('');

        if (e.data.success) {
          setVectorizedSvg(e.data.svg);
          setStats({
            colorCount: e.data.stats.colorCount,
            pathCount: e.data.stats.pathCount,
            durationMs: e.data.stats.durationMs,
            engine: 'VTracer Pro v3',
          });

          // Save project record in MongoDB avec les fichiers en base64
          try {
            const svgBase64 = btoa(unescape(encodeURIComponent(e.data.svg)));

            let originalBase64 = '';
            if (originalFile) {
              await new Promise<void>((resolve) => {
                const tmpImg = new Image();
                const objUrl = URL.createObjectURL(originalFile);
                tmpImg.onload = () => {
                  const c = document.createElement('canvas');
                  c.width = tmpImg.width;
                  c.height = tmpImg.height;
                  const cx = c.getContext('2d');
                  if (cx) { cx.drawImage(tmpImg, 0, 0); originalBase64 = c.toDataURL('image/png'); }
                  URL.revokeObjectURL(objUrl);
                  resolve();
                };
                tmpImg.onerror = () => { URL.revokeObjectURL(objUrl); resolve(); };
                tmpImg.src = objUrl;
              });
            }

            const svgFileName = `VXEL_ImageToVector_${Date.now()}.svg`;
            fetch('/api/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                toolType: 'vectorizer',
                originalFileName: originalFile ? originalFile.name : 'visuel-source.png',
                processedFileName: svgFileName,
                originalFileData: originalBase64,
                processedFileData: svgBase64,
                originalFileMime: 'image/png',
                processedFileMime: 'image/svg+xml',
                fileSize: originalFile ? originalFile.size : 0,
                status: 'completed',
                creditsUsed: 1,
              }),
            }).catch(() => {});
          } catch {
            // Non bloquant
          }
        } else {
          setErrorMessage(e.data.error || 'Erreur lors de la conversion Image to Vector');
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [originalFile]);

// Filtre médian 3x3 pour éliminer le bruit et les artefacts de compression sans flouter les contours
function applyMedianFilter(imageData: ImageData): ImageData {
  const { data, width: w, height: h } = imageData;
  const copy = new Uint8ClampedArray(data);
  const rBuf: number[] = new Array(9);
  const gBuf: number[] = new Array(9);
  const bBuf: number[] = new Array(9);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      if (copy[idx + 3] < 20) continue; // transparent

      let k = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * w + (x + dx)) * 4;
          rBuf[k] = copy[nIdx];
          gBuf[k] = copy[nIdx + 1];
          bBuf[k] = copy[nIdx + 2];
          k++;
        }
      }

      rBuf.sort((a, b) => a - b);
      gBuf.sort((a, b) => a - b);
      bBuf.sort((a, b) => a - b);

      data[idx] = rBuf[4];
      data[idx + 1] = gBuf[4];
      data[idx + 2] = bBuf[4];
    }
  }
  return imageData;
}

  const runVectorization = useCallback((
    file: File,
    colorsCountVal?: number,
    noiseVal?: number,
    precVal?: number,
    smoothVal?: number,
    minSizeVal?: number,
  ) => {
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
    setProgress(10);
    setProgressLabel('Chargement image...');

    const objectUrl = URL.createObjectURL(file);
    setOriginalPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      // 1. Upscaling automatique : 4x si image < 2000px, sinon 2x
      const maxDim = Math.max(img.width, img.height);
      const scale = maxDim < 2000 ? 4 : 2;
      const targetW = img.width * scale;
      const targetH = img.height * scale;

      let canvas: HTMLCanvasElement | null = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      let ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        setErrorMessage('Erreur canvas');
        return;
      }

      // Rendu haute fidélité (Lanczos / Bicubic lissé)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);
      let imageData: ImageData | null = ctx.getImageData(0, 0, targetW, targetH);

      // 2. Filtre médian 3x3 pour éliminer le bruit avant vectorisation
      setProgress(25);
      setProgressLabel('Filtrage du bruit (filtre médian)...');
      applyMedianFilter(imageData);

      setProgress(40);
      setProgressLabel('Analyse des couleurs...');

      if (workerRef.current) {
        // 3. Paramètres Potrace / VTracer optimisés : turdsize=100, pathomit=8, alphamax=1.0
        workerRef.current.postMessage({
          imageData,
          width: targetW,
          height: targetH,
          options: {
            color_mode: 'color',
            hierarchical: 'stacked',
            mode: 'spline',
            filter_speckle: noiseVal ?? noiseFilter,
            number_of_colors: colorsCountVal ?? numColors,
            path_precision: precVal ?? pathPrecision,
            smoothness: smoothVal ?? smoothness,
            min_shape_size: minSizeVal ?? minShapeSize,
            turdsize: 100,
            pathomit: 8,
            alphamax: 1.0,
            layer_difference: 16,
            color_precision: 6,
          },
        });
        setProgress(60);
        setProgressLabel('Vectorisation en cours...');
      } else {
        setIsProcessing(false);
        setErrorMessage('Module de conversion indisponible');
      }

      // 4. Libération mémoire après chaque étape
      imageData = null;
      ctx = null;
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
        canvas = null;
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      setErrorMessage("Impossible de lire l'image");
    };

    img.src = objectUrl;
  }, [noiseFilter, numColors, pathPrecision, smoothness, minShapeSize, t]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFile(file);
      runVectorization(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setOriginalFile(file);
      runVectorization(file);
    }
  };

  const handleDownloadSvg = () => {
    if (!vectorizedSvg) return;
    const blob = new Blob([vectorizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VXEL_ImageToVector_${Date.now()}.svg`;
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
            <Zap className="w-3.5 h-3.5" /> Moteur de Conversion Vectorielle HD
          </div>
          <h2 className="text-2xl font-black text-white">{t('vectorizer.title')}</h2>
          <p className="text-xs text-slate-400 mt-1">{t('vectorizer.sub')}</p>
        </div>

        {originalFile && (
          <button
            onClick={() => runVectorization(originalFile)}
            disabled={isProcessing}
            className="px-5 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold rounded-xl text-xs shadow-lg shadow-[#F7941D]/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Re-Convertir l'image</span>
          </button>
        )}
      </div>

      {/* Control Sliders Panel — 5 contrôles */}
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
        {/* Couleurs */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>{t('vectorizer.colors')}</span>
            <span className="text-[#F7941D] font-mono">{numColors}</span>
          </div>
          <input
            type="range" min="4" max="32" value={numColors}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setNumColors(val);
              if (originalFile) runVectorization(originalFile, val, noiseFilter, pathPrecision, smoothness, minShapeSize);
            }}
            className="w-full accent-[#F7941D]"
          />
          <p className="text-[10px] text-slate-500">Palettes couleurs détectées</p>
        </div>

        {/* Filtre bruit */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>{t('vectorizer.noiseFilter')}</span>
            <span className="text-[#F7941D] font-mono">{noiseFilter} px</span>
          </div>
          <input
            type="range" min="0" max="10" value={noiseFilter}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setNoiseFilter(val);
              if (originalFile) runVectorization(originalFile, numColors, val, pathPrecision, smoothness, minShapeSize);
            }}
            className="w-full accent-[#F7941D]"
          />
          <p className="text-[10px] text-slate-500">Suppression artefacts JPEG</p>
        </div>

        {/* Précision */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>{t('vectorizer.precision')}</span>
            <span className="text-[#F7941D] font-mono">{pathPrecision}/8</span>
          </div>
          <input
            type="range" min="1" max="8" value={pathPrecision}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setPathPrecision(val);
              if (originalFile) runVectorization(originalFile, numColors, noiseFilter, val, smoothness, minShapeSize);
            }}
            className="w-full accent-[#F7941D]"
          />
          <p className="text-[10px] text-slate-500">Fidélité des courbes Bézier</p>
        </div>

        {/* Lissage */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>✨ Lissage</span>
            <span className="text-[#F7941D] font-mono">{smoothness}/8</span>
          </div>
          <input
            type="range" min="1" max="8" value={smoothness}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSmoothness(val);
              if (originalFile) runVectorization(originalFile, numColors, noiseFilter, pathPrecision, val, minShapeSize);
            }}
            className="w-full accent-[#F7941D]"
          />
          <p className="text-[10px] text-slate-500">Tension des courbes Catmull-Rom</p>
        </div>

        {/* Taille min. */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>🔲 Min. forme</span>
            <span className="text-[#F7941D] font-mono">{minShapeSize} px</span>
          </div>
          <input
            type="range" min="1" max="10" value={minShapeSize}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setMinShapeSize(val);
              if (originalFile) runVectorization(originalFile, numColors, noiseFilter, pathPrecision, smoothness, val);
            }}
            className="w-full accent-[#F7941D]"
          />
          <p className="text-[10px] text-slate-500">Ignore les détails trop petits</p>
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
        <div className="bg-[#161616] border border-[#F7941D]/50 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#F7941D]">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {progressLabel || t('vectorizer.processing')}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-[#0A0A0A] h-2 rounded-full overflow-hidden border border-[#2E2E2E]">
            <div className="bg-[#F7941D] h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Pipeline : débruitage → quantisation K-Means++ → marching squares → Douglas-Peucker → courbes Bézier
          </p>
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

            {/* Après (SVG Image to Vector HD) */}
            <div className="bg-[#161616] border border-[#F7941D]/50 rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
                <span className="text-xs font-extrabold uppercase text-[#F7941D] tracking-wider">
                  ⚡ {t('vectorizer.after')}
                </span>
                <span className="text-[10px] text-green-400 font-mono font-bold">Image to Vector HD</span>
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
                    Conversion Image to Vector en cours...
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
