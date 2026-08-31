'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UserButton, SignInButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';

interface FabricSwatch {
  name: string;
  color: string;
}

const FABRIC_SWATCHES: FabricSwatch[] = [
  { name: 'Noir', color: '#000000' },
  { name: 'Blanc', color: '#ffffff' },
  { name: 'Gris', color: '#6b7280' },
  { name: 'Marine', color: '#1e3a8a' },
  { name: 'Royal', color: '#1d4ed8' },
  { name: 'Rouge', color: '#dc2626' },
  { name: 'Rose', color: '#be185d' },
  { name: 'Olive', color: '#556b2f' },
  { name: 'Marron', color: '#7c2d12' },
  { name: 'Orange VXEL', color: '#F7941D' },
  { name: 'Orange', color: '#ea580c' },
  { name: 'Vert', color: '#65a30d' },
  { name: 'Turquoise', color: '#0891b2' },
  { name: 'Violet', color: '#7c3aed' },
  { name: 'Anthracite', color: '#0f172a' },
  { name: 'Écru', color: '#f5f5dc' },
];

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function colorDistManhattan(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

function median(arr: number[]) {
  const s = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export default function DTFStudioPage() {
  const { t } = useTranslation();
  const { isSignedIn, isLoaded } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);

  // States UI
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'warn' | 'error' | 'success' } | null>(null);
  const [showPackModal, setShowPackModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Image source & canvas
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [clickedBgColor, setClickedBgColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [awaitingClickColor, setAwaitingClickColor] = useState(false);
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);

  // Settings
  const [bgView, setBgView] = useState<'fabric' | 'checker' | 'black' | 'white'>('fabric');
  const [fabricColor, setFabricColorState] = useState('#000000');
  const [fabricName, setFabricName] = useState('Noir');
  const [enableFabricOpt, setEnableFabricOpt] = useState(false);

  // Controls
  const [bgRemovalMode, setBgRemovalMode] = useState<'auto' | 'picker' | 'click' | 'none'>('auto');
  const [customBgColor, setCustomBgColor] = useState('#000000');
  const [bgTolerance, setBgTolerance] = useState(30);

  const [erodePixels, setErodePixels] = useState(0);
  const [lumaMode, setLumaMode] = useState<'off' | 'soft' | 'dark' | 'light' | 'auto'>('off');
  const [lumaT, setLumaT] = useState(40);
  const [lumaS, setLumaS] = useState(60);

  const [enableFillHoles, setEnableFillHoles] = useState(true);
  const [fillHolesSize, setFillHolesSize] = useState(14);
  const [enableDefringe, setEnableDefringe] = useState(true);
  const [defringePx, setDefringePx] = useState(2);

  const [enableBoost, setEnableBoost] = useState(true);
  const [boostSat, setBoostSat] = useState(135);
  const [boostCon, setBoostCon] = useState(118);

  const [enableHalftone, setEnableHalftone] = useState(false);
  const [dotSize, setDotSize] = useState(6);
  const [enableGrunge, setEnableGrunge] = useState(false);
  const [grungeIntensity, setGrungeIntensity] = useState(30);

  const [scaleFactor, setScaleFactor] = useState(2);
  const [enableCrop, setEnableCrop] = useState(true);
  const [fitMode, setFitMode] = useState<'tight' | 'frame'>('tight');
  const [targetWidthCm, setTargetWidthCm] = useState(29);
  const [targetHeightCm, setTargetHeightCm] = useState(34);

  // Stats
  const [dimensionText, setDimensionText] = useState('—');
  const [perfText, setPerfText] = useState('');
  const [debugText, setDebugText] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Toast Helper
  const showToast = useCallback((msg: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  // Fetch Credits
  const fetchCredits = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch('/api/credits');
      const data = await res.json();
      if (data.success && typeof data.credits === 'number') {
        setCredits(data.credits);
      }
    } catch (e) {
      console.error('Erreur chargement crédits:', e);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Set Fabric Color
  const handleSetFabricColor = (hex: string, name?: string) => {
    setFabricColorState(hex);
    const rgb = hexToRgb(hex);
    const lum = luminance(rgb.r, rgb.g, rgb.b);
    const match = FABRIC_SWATCHES.find((s) => s.color.toLowerCase() === hex.toLowerCase());
    setFabricName(name || (match ? match.name : 'Perso'));

    if (enableFabricOpt && lumaMode === 'auto') {
      if (lum > 200) setLumaMode('light');
      else setLumaMode('off');
      showToast('⚙️ Auto : Luma ajusté', 'warn');
    }
  };

  // Traitement d'image principal
  const processImage = useCallback(() => {
    if (!originalImage) return;

    setIsProcessing(true);

    setTimeout(() => {
      const t0 = performance.now();
      const scale = scaleFactor;
      const targetW = originalImage.width * scale;
      const targetH = originalImage.height * scale;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetW;
      tempCanvas.height = targetH;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCtx.imageSmoothingEnabled = scale > 1;
      tempCtx.imageSmoothingQuality = 'high';
      tempCtx.drawImage(originalImage, 0, 0, targetW, targetH);

      const imgData = tempCtx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      const initialOpaque = countOpaque(data);

      let refR = 0,
        refG = 0,
        refB = 0;
      if (bgRemovalMode === 'auto') {
        const samples: [number, number, number][] = [];
        const ss = 4;
        const corners = [
          [0, 0],
          [targetW - ss, 0],
          [0, targetH - ss],
          [targetW - ss, targetH - ss],
        ];
        for (const [cx, cy] of corners) {
          for (let dy = 0; dy < ss; dy++) {
            for (let dx = 0; dx < ss; dx++) {
              const idx = ((cy + dy) * targetW + (cx + dx)) * 4;
              samples.push([data[idx], data[idx + 1], data[idx + 2]]);
            }
          }
        }
        refR = median(samples.map((s) => s[0]));
        refG = median(samples.map((s) => s[1]));
        refB = median(samples.map((s) => s[2]));
      } else if (bgRemovalMode === 'picker') {
        const rgb = hexToRgb(customBgColor);
        refR = rgb.r;
        refG = rgb.g;
        refB = rgb.b;
      } else if (bgRemovalMode === 'click') {
        if (clickedBgColor) {
          refR = clickedBgColor.r;
          refG = clickedBgColor.g;
          refB = clickedBgColor.b;
        } else {
          refR = data[0];
          refG = data[1];
          refB = data[2];
        }
      }

      let removedCount = 0;
      if (bgRemovalMode !== 'none') {
        removedCount = safeBackgroundRemoval(data, targetW, targetH, refR, refG, refB, bgTolerance);
      }

      const erodeRadius = erodePixels * scale;
      if (erodeRadius > 0) applyErosion(data, targetW, targetH, erodeRadius);

      if (enableFillHoles) fillSmallHoles(data, targetW, targetH, fillHolesSize);
      if (enableDefringe) defringeIsolated(data, targetW, targetH, defringePx);

      applyAdaptiveLumaKey(data, targetW, targetH, lumaMode, lumaT, lumaS, fabricColor);

      if (enableGrunge) applyGrunge(data, targetW, targetH, grungeIntensity / 100);
      if (enableHalftone) applyHalftone(data, targetW, targetH, dotSize * scale);

      if (enableBoost) boostColors(data, targetW, targetH, boostSat / 100, boostCon / 100);

      tempCtx.putImageData(imgData, 0, 0);

      let cropBox = null;
      if (enableCrop) cropBox = findBoundingBox(data, targetW, targetH);
      let finalCanvas = tempCanvas;

      if (cropBox) {
        const cd = tempCtx.getImageData(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
        finalCanvas = document.createElement('canvas');
        finalCanvas.width = cropBox.w;
        finalCanvas.height = cropBox.h;
        finalCanvas.getContext('2d')?.putImageData(cd, 0, 0);
      }

      let outputCanvas = finalCanvas;
      if (enableCrop) {
        const tW_px = Math.round(targetWidthCm * (300 / 2.54));
        const tH_px = Math.round(targetHeightCm * (300 / 2.54));
        const ratio = Math.min(tW_px / finalCanvas.width, tH_px / finalCanvas.height);

        if (fitMode === 'tight') {
          const outW = Math.max(1, Math.round(finalCanvas.width * ratio));
          const outH = Math.max(1, Math.round(finalCanvas.height * ratio));
          const out = document.createElement('canvas');
          out.width = outW;
          out.height = outH;
          const o = out.getContext('2d');
          if (o) {
            o.imageSmoothingEnabled = true;
            o.imageSmoothingQuality = 'high';
            o.drawImage(finalCanvas, 0, 0, outW, outH);
          }
          outputCanvas = out;
        } else {
          const out = document.createElement('canvas');
          out.width = tW_px;
          out.height = tH_px;
          const o = out.getContext('2d');
          if (o) {
            o.imageSmoothingEnabled = true;
            o.imageSmoothingQuality = 'high';
            const sx = (tW_px - finalCanvas.width * ratio) / 2;
            const sy = (tH_px - finalCanvas.height * ratio) / 2;
            o.drawImage(finalCanvas, 0, 0, finalCanvas.width, finalCanvas.height, sx, sy, finalCanvas.width * ratio, finalCanvas.height * ratio);
          }
          outputCanvas = out;
        }
      }

      if (canvasRef.current) {
        canvasRef.current.width = outputCanvas.width;
        canvasRef.current.height = outputCanvas.height;
        const mc = canvasRef.current.getContext('2d');
        if (mc) {
          mc.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
          mc.drawImage(outputCanvas, 0, 0);
        }
      }

      setProcessedCanvas(outputCanvas);

      const realW = (outputCanvas.width / 300) * 2.54;
      const realH = (outputCanvas.height / 300) * 2.54;
      setDimensionText(`📐 ${realW.toFixed(1)}×${realH.toFixed(1)}cm · ${outputCanvas.width}×${outputCanvas.height}px`);
      setPerfText(`⚡ ${(performance.now() - t0).toFixed(0)}ms`);

      if (bgRemovalMode !== 'none') {
        setDebugText(`Fond rgb(${refR.toFixed(0)},${refG.toFixed(0)},${refB.toFixed(0)}) · Suppr: ${removedCount.toLocaleString()}/${initialOpaque.toLocaleString()}`);
      } else {
        setDebugText('');
      }

      setIsProcessing(false);
    }, 50);
  }, [
    originalImage,
    scaleFactor,
    bgRemovalMode,
    customBgColor,
    clickedBgColor,
    bgTolerance,
    erodePixels,
    enableFillHoles,
    fillHolesSize,
    enableDefringe,
    defringePx,
    lumaMode,
    lumaT,
    lumaS,
    fabricColor,
    enableGrunge,
    grungeIntensity,
    enableHalftone,
    dotSize,
    enableBoost,
    boostSat,
    boostCon,
    enableCrop,
    targetWidthCm,
    targetHeightCm,
    fitMode,
  ]);

  // Re-run image process on parameters change
  useEffect(() => {
    if (originalImage && !awaitingClickColor) {
      processImage();
    }
  }, [processImage, originalImage, awaitingClickColor]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setClickedBgColor(null);
        setAwaitingClickColor(false);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Canvas Click Pipette
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (bgRemovalMode !== 'click' || !originalImage || !awaitingClickColor || !canvasRef.current) return;
    const canvasEl = canvasRef.current;
    const rect = canvasEl.getBoundingClientRect();
    const sx = canvasEl.width / rect.width;
    const sy = canvasEl.height / rect.height;
    const x = Math.min(canvasEl.width - 1, Math.max(0, Math.floor((e.clientX - rect.left) * sx)));
    const y = Math.min(canvasEl.width - 1, Math.max(0, Math.floor((e.clientY - rect.top) * sy)));
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    const p = ctx.getImageData(x, y, 1, 1).data;
    if (p[3] < 10) {
      showToast('⚠️ Zone transparente', 'warn');
      return;
    }
    setClickedBgColor({ r: p[0], g: p[1], b: p[2] });
    setAwaitingClickColor(false);
    showToast(`🎯 rgb(${p[0]},${p[1]},${p[2]})`, 'success');
  };

  // Credit Consumption & Download
  const handleDownload = async (type: 'color' | 'white') => {
    if (!processedCanvas) return;
    if (!isSignedIn) {
      showToast("Connecte-toi pour télécharger !", "error");
      return;
    }

    try {
      const res = await fetch('/api/consume-credit', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Crédits insuffisants !', 'error');
        setShowPackModal(true);
        return;
      }

      setCredits(data.creditsRemaining);
      showToast('1 crédit utilisé', 'success');

      if (type === 'color') {
        const link = document.createElement('a');
        link.download = `vxel-couleur-${targetWidthCm}x${targetHeightCm}cm.png`;
        link.href = processedCanvas.toDataURL('image/png');
        link.click();
        showToast('📥 PNG couleur téléchargé', 'success');
      } else {
        const w = processedCanvas.width;
        const h = processedCanvas.height;
        const tmp = document.createElement('canvas');
        tmp.width = w;
        tmp.height = h;
        const tmpCtx = tmp.getContext('2d');
        if (!tmpCtx) return;

        tmpCtx.drawImage(processedCanvas, 0, 0);
        const srcData = tmpCtx.getImageData(0, 0, w, h).data;
        const whiteData = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
        const dst = whiteData.data;

        for (let i = 0; i < srcData.length; i += 4) {
          if (srcData[i + 3] > 20) {
            dst[i] = 255;
            dst[i + 1] = 255;
            dst[i + 2] = 255;
            dst[i + 3] = 255;
          }
        }

        const expand = 3;
        const mask = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) mask[i] = dst[i * 4 + 3] > 0 ? 1 : 0;

        for (let pass = 0; pass < expand; pass++) {
          const nm = new Uint8Array(mask);
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const i = y * w + x;
              if (mask[i]) continue;
              if (
                (x > 0 && mask[i - 1]) ||
                (x < w - 1 && mask[i + 1]) ||
                (y > 0 && mask[i - w]) ||
                (y < h - 1 && mask[i + w])
              ) {
                nm[i] = 1;
              }
            }
          }
          mask.set(nm);
        }

        for (let i = 0; i < w * h; i++) {
          if (mask[i]) {
            dst[i * 4] = 255;
            dst[i * 4 + 1] = 255;
            dst[i * 4 + 2] = 255;
            dst[i * 4 + 3] = 255;
          } else {
            dst[i * 4 + 3] = 0;
          }
        }

        const wc = document.createElement('canvas');
        wc.width = w;
        wc.height = h;
        wc.getContext('2d')?.putImageData(whiteData, 0, 0);

        const link = document.createElement('a');
        link.download = `vxel-white-base-${targetWidthCm}x${targetHeightCm}cm.png`;
        link.href = wc.toDataURL('image/png');
        link.click();
        showToast('⚪ White Base téléchargée', 'success');
      }
    } catch (e) {
      console.error('Erreur consommation crédit:', e);
      showToast('Erreur serveur', 'error');
    }
  };

  // Acheter pack de crédits
  const handleBuyPack = async (amount: number) => {
    try {
      const res = await fetch('/api/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCredits(data.credits);
        setShowPackModal(false);
        showToast(`${amount} crédits ajoutés !`, 'success');
      } else {
        showToast(data.error || 'Erreur lors du rechargement', 'error');
      }
    } catch (e) {
      console.error('Erreur achat crédit:', e);
      showToast('Erreur serveur', 'error');
    }
  };

  return (
    <div className="flex flex-col p-3 gap-3 min-h-screen bg-[#0A0A0A] text-white">
      {/* Overlay de chargement */}
      {isProcessing && (
        <div className="fixed inset-0 z-[400] bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F7941D]"></div>
          <p className="text-[#F7941D] mt-4 font-bold text-sm">Traitement en cours...</p>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 bg-[#161616] border px-3 py-1.5 rounded-lg shadow-2xl z-[500] text-xs font-semibold ${
            toast.type === 'error'
              ? 'border-red-500 text-red-300'
              : toast.type === 'warn'
              ? 'border-amber-500 text-amber-300'
              : 'border-[#F7941D] text-[#FFD9A8]'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Modal Packs */}
      {showPackModal && (
        <div className="fixed inset-0 z-[300] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#161616] border border-[#F7941D] rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-white">💰 Packs de crédits</h2>
              <button
                onClick={() => setShowPackModal(false)}
                className="bg-[#1F1F1F] text-white border border-[#2E2E2E] hover:border-[#F7941D] px-2 py-1 rounded text-xs"
              >
                ✖
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3 text-center">1 crédit = 1 fichier DTF traité et optimisé.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-[#2E2E2E] rounded-lg p-3 flex flex-col items-center gap-1 hover:border-[#F7941D] transition-colors">
                <span className="text-2xl">🎁</span>
                <span className="text-sm font-extrabold text-white">50 crédits</span>
                <span className="text-[#F7941D] font-extrabold text-lg">25 TND</span>
                <button
                  onClick={() => handleBuyPack(50)}
                  className="bg-[#F7941D] text-black font-extrabold hover:bg-[#FFB25A] w-full py-1.5 rounded-md text-xs mt-1"
                >
                  Choisir
                </button>
              </div>
              <div className="border border-[#F7941D] rounded-lg p-3 flex flex-col items-center gap-1 bg-[#2a1a05] relative">
                <span className="absolute -top-2 -right-2 bg-[#F7941D] text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                  POPULAIRE
                </span>
                <span className="text-2xl">👑</span>
                <span className="text-sm font-extrabold text-white">200 crédits</span>
                <span className="text-[#F7941D] font-extrabold text-lg">80 TND</span>
                <span className="text-[10px] text-green-400 font-bold">Soit 0,40 TND/crédit (-20%)</span>
                <button
                  onClick={() => handleBuyPack(200)}
                  className="bg-[#F7941D] text-black font-extrabold hover:bg-[#FFB25A] w-full py-1.5 rounded-md text-xs mt-1"
                >
                  Choisir
                </button>
              </div>
            </div>
            <p className="text-[9px] text-[#9C9C9C] mt-3 leading-tight text-center">
              ⚠️ Mode TEST : le paiement est simulé pour l'instant.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#161616] border border-[#2E2E2E] rounded-lg px-4 py-2 gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#F7941D] hover:underline text-xs font-bold">
              ← {t('common.home')}
            </Link>
            <h1 className="text-base font-extrabold text-white leading-none">
              VXEL <span className="text-[#F7941D]">DTF Studio Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label
              htmlFor="imageLoader"
              className="bg-[#1F1F1F] text-white border border-[#2E2E2E] hover:border-[#F7941D] hover:text-[#FFB25A] px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              {t('studioPage.uploadImg')}
            </label>
            <input type="file" id="imageLoader" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <LanguageCurrencySelector />
          {isLoaded && isSignedIn && (
            <div className="flex items-center gap-2">
              <span className="bg-[#0A0A0A] border border-[#F7941D] text-[#FFD9A8] px-3 py-1 rounded-lg text-xs font-extrabold">
                {credits !== null ? credits : '...'} {t('common.credits')}
              </span>
              <button
                onClick={() => setShowPackModal(true)}
                className="bg-[#F7941D] text-black font-extrabold hover:bg-[#FFB25A] px-3 py-1 rounded-md text-[10px]"
              >
                {t('common.buyBtn')}
              </button>
              <UserButton />
            </div>
          )}
          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <button className="bg-[#F7941D] text-black px-4 py-1.5 rounded-md text-xs font-bold hover:bg-[#FFB25A]">
                {t('common.signIn')}
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* Grille principale */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Colonne 1 : Prévisualisation */}
        <div className="col-span-12 lg:col-span-5 bg-[#161616] border border-[#2E2E2E] rounded-lg flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#2E2E2E]">
            <h3 className="text-xs font-bold text-[#F7941D] uppercase tracking-wide">{t('studioPage.previewTitle')}</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setBgView('fabric')}
                className={`px-2 py-0.5 text-[10px] bg-[#1F1F1F] rounded border ${
                  bgView === 'fabric' ? 'border-[#F7941D] text-[#F7941D]' : 'border-[#2E2E2E]'
                }`}
              >
                👕
              </button>
              <button
                onClick={() => setBgView('checker')}
                className={`px-2 py-0.5 text-[10px] bg-[#1F1F1F] rounded border ${
                  bgView === 'checker' ? 'border-[#F7941D] text-[#F7941D]' : 'border-[#2E2E2E]'
                }`}
              >
                ♟
              </button>
              <button
                onClick={() => setBgView('black')}
                className={`px-2 py-0.5 text-[10px] bg-[#1F1F1F] rounded border ${
                  bgView === 'black' ? 'border-[#F7941D] text-[#F7941D]' : 'border-[#2E2E2E]'
                }`}
              >
                ■
              </button>
              <button
                onClick={() => setBgView('white')}
                className={`px-2 py-0.5 text-[10px] bg-[#1F1F1F] rounded border ${
                  bgView === 'white' ? 'border-[#F7941D] text-[#F7941D]' : 'border-[#2E2E2E]'
                }`}
              >
                □
              </button>
            </div>
          </div>

          <div
            className="flex-1 relative flex items-center justify-center p-2 overflow-hidden min-h-[350px]"
            style={{
              backgroundColor:
                bgView === 'fabric'
                  ? fabricColor
                  : bgView === 'checker'
                  ? '#222'
                  : bgView === 'black'
                  ? '#000'
                  : '#fff',
            }}
          >
            {bgView === 'checker' && (
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                }}
              />
            )}

            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-w-full max-h-full object-contain relative z-10 cursor-crosshair"
            />

            {!originalImage && (
              <div className="text-[#9C9C9C] text-sm absolute z-0 text-center p-4">
                <p className="font-bold text-[#F7941D] mb-2">{t('studioPage.readyToOptimize')}</p>
                <p className="text-xs">{t('studioPage.stepsGuide')}</p>
              </div>
            )}

            <div className="absolute bottom-2 left-2 bg-[#0A0A0A]/90 border border-[#F7941D] text-[#FFD9A8] text-[10px] px-2 py-0.5 rounded z-20">
              {dimensionText}
            </div>
            <div className="absolute top-2 left-2 bg-[#0A0A0A]/90 border border-[#F7941D] text-[#FFD9A8] text-[10px] px-2 py-0.5 rounded z-20">
              👕 {fabricName}
            </div>
            {awaitingClickColor && (
              <div className="absolute top-2 text-[10px] text-[#FFD9A8] bg-[#0A0A0A]/90 px-2 py-0.5 rounded border border-[#F7941D] z-20">
                {t('studioPage.clickBgPrompt')}
              </div>
            )}
            {perfText && (
              <div className="absolute top-2 right-2 text-[10px] text-[#9C9C9C] bg-[#0A0A0A]/90 px-2 py-0.5 rounded border border-[#2E2E2E] z-20">
                {perfText}
              </div>
            )}
          </div>

          <div className="px-3 py-2 border-t border-[#2E2E2E] flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleDownload('color')}
              disabled={!originalImage}
              className="bg-[#F7941D] text-black font-extrabold hover:bg-[#FFB25A] disabled:opacity-50 disabled:cursor-not-allowed flex-1 py-1.5 rounded-md transition text-xs"
            >
              {t('studioPage.pngColorBtn')}
            </button>
            <button
              onClick={() => handleDownload('white')}
              disabled={!originalImage}
              className="bg-[#1F1F1F] text-white border border-[#2E2E2E] hover:border-[#F7941D] hover:text-[#FFB25A] disabled:opacity-50 disabled:cursor-not-allowed flex-1 py-1.5 rounded-md transition text-xs font-bold"
            >
              {t('studioPage.whiteBaseBtn')}
            </button>
          </div>
        </div>

        {/* Colonne 2 : Contrôles */}
        <div className="col-span-12 lg:col-span-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-1 flex flex-col gap-2">
          {/* Suppression du fond */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              {t('studioPage.removeBgSection')}
            </h3>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">{t('studioPage.methodLabel')}</label>
              <select
                value={bgRemovalMode}
                onChange={(e) => {
                  const m = e.target.value as any;
                  setBgRemovalMode(m);
                  if (m === 'click') setAwaitingClickColor(true);
                  else setAwaitingClickColor(false);
                }}
                className="bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded px-2 py-1 flex-1 text-xs"
              >
                <option value="auto">{t('studioPage.methodAuto')}</option>
                <option value="picker">{t('studioPage.methodPicker')}</option>
                <option value="click">{t('studioPage.methodClick')}</option>
                <option value="none">{t('studioPage.methodNone')}</option>
              </select>
            </div>
            {bgRemovalMode === 'picker' && (
              <div className="flex items-center gap-2 mb-2 text-xs">
                <label className="w-20 text-[#9C9C9C] text-[11px]">{t('studioPage.colorLabel')}</label>
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-12 h-6 rounded cursor-pointer bg-transparent border border-[#2E2E2E]"
                />
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">{t('studioPage.toleranceLabel')}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={bgTolerance}
                onChange={(e) => setBgTolerance(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{bgTolerance}</span>
            </div>
            {debugText && <div className="text-[10px] text-[#FFB25A] mt-1">📊 {debugText}</div>}
          </div>

          {/* Anti-halo & Luma Key */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              {t('studioPage.antiHaloSection')}
            </h3>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">{t('studioPage.chokeLabel')}</label>
              <input
                type="range"
                min="0"
                max="10"
                value={erodePixels}
                onChange={(e) => setErodePixels(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{erodePixels}</span>
            </div>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">{t('studioPage.lumaModeLabel')}</label>
              <select
                value={lumaMode}
                onChange={(e) => setLumaMode(e.target.value as any)}
                className="bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded px-2 py-1 flex-1 text-xs"
              >
                <option value="off">{t('studioPage.lumaOff')}</option>
                <option value="soft">{t('studioPage.lumaSoft')}</option>
                <option value="dark">{t('studioPage.lumaDark')}</option>
                <option value="light">{t('studioPage.lumaLight')}</option>
                <option value="auto">{t('studioPage.lumaAuto')}</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">{t('studioPage.thresholdLabel')}</label>
              <input
                type="range"
                min="0"
                max="255"
                value={lumaT}
                onChange={(e) => setLumaT(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{lumaT}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">{t('studioPage.softnessLabel')}</label>
              <input
                type="range"
                min="10"
                max="200"
                value={lumaS}
                onChange={(e) => setLumaS(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{lumaS}</span>
            </div>
          </div>

          {/* Nettoyage contours */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              {t('studioPage.contourCleanSection')}
            </h3>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="flex items-center gap-1 text-[#9C9C9C] text-[11px] w-32 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableFillHoles}
                  onChange={(e) => setEnableFillHoles(e.target.checked)}
                  className="accent-[#F7941D]"
                />
                {t('studioPage.fillHolesCheck')}
              </label>
              <input
                type="range"
                min="1"
                max="40"
                value={fillHolesSize}
                onChange={(e) => setFillHolesSize(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{fillHolesSize}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1 text-[#9C9C9C] text-[11px] w-32 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDefringe}
                  onChange={(e) => setEnableDefringe(e.target.checked)}
                  className="accent-[#F7941D]"
                />
                {t('studioPage.defringeCheck')}
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={defringePx}
                onChange={(e) => setDefringePx(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{defringePx}</span>
            </div>
          </div>

          {/* Couleurs */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              🎨 Couleurs
            </h3>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="flex items-center gap-1 text-[#9C9C9C] text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBoost}
                  onChange={(e) => setEnableBoost(e.target.checked)}
                  className="accent-[#F7941D]"
                />
                💪 Renforcer
              </label>
            </div>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">Saturation</label>
              <input
                type="range"
                min="100"
                max="220"
                value={boostSat}
                onChange={(e) => setBoostSat(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{boostSat}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">Contraste</label>
              <input
                type="range"
                min="100"
                max="180"
                value={boostCon}
                onChange={(e) => setBoostCon(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{boostCon}</span>
            </div>
          </div>

          {/* Finitions */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              ✨ Finitions
            </h3>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="flex items-center gap-1 text-[#9C9C9C] text-[11px] w-24 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableHalftone}
                  onChange={(e) => setEnableHalftone(e.target.checked)}
                  className="accent-[#F7941D]"
                />
                Halftone
              </label>
              <input
                type="range"
                min="3"
                max="15"
                value={dotSize}
                onChange={(e) => setDotSize(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{dotSize}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1 text-[#9C9C9C] text-[11px] w-24 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableGrunge}
                  onChange={(e) => setEnableGrunge(e.target.checked)}
                  className="accent-[#F7941D]"
                />
                Grunge
              </label>
              <input
                type="range"
                min="10"
                max="70"
                value={grungeIntensity}
                onChange={(e) => setGrungeIntensity(parseInt(e.target.value))}
                className="flex-1 accent-[#F7941D]"
              />
              <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{grungeIntensity}</span>
            </div>
          </div>
        </div>

        {/* Colonne 3 : Tissu & Dimensions */}
        <div className="col-span-12 lg:col-span-3 overflow-y-auto max-h-[calc(100vh-120px)] pr-1 flex flex-col gap-2">
          {/* Couleur tissu */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              👕 Couleur tissu
            </h3>
            <div className="grid grid-cols-8 gap-1 mb-2">
              {FABRIC_SWATCHES.map((sw) => (
                <button
                  key={sw.name}
                  onClick={() => handleSetFabricColor(sw.color, sw.name)}
                  style={{ backgroundColor: sw.color }}
                  title={sw.name}
                  className={`w-full aspect-square rounded border transition-all ${
                    fabricColor.toLowerCase() === sw.color.toLowerCase()
                      ? 'border-[#F7941D] scale-110 shadow-lg'
                      : 'border-[#2E2E2E]'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={fabricColor}
                onChange={(e) => handleSetFabricColor(e.target.value)}
                className="w-8 h-6 rounded border border-[#2E2E2E] cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={fabricColor}
                onChange={(e) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    handleSetFabricColor(e.target.value);
                  }
                }}
                className="bg-[#0A0A0A] border border-[#2E2E2E] text-white text-xs rounded px-2 py-1 flex-1 font-mono"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="text-gray-300 font-semibold cursor-pointer">Auto-optim</label>
              <input
                type="checkbox"
                checked={enableFabricOpt}
                onChange={(e) => setEnableFabricOpt(e.target.checked)}
                className="accent-[#F7941D]"
              />
            </div>
          </div>

          {/* Upscale & Dimensions */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              📐 Upscale & Dimensions
            </h3>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">Upscale</label>
              <select
                value={scaleFactor}
                onChange={(e) => setScaleFactor(parseInt(e.target.value))}
                className="bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded px-2 py-1 flex-1 text-xs"
              >
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
              </select>
              <span className="text-[#FFB25A] font-bold text-xs">{scaleFactor}x</span>
            </div>

            <div className="flex items-center justify-between text-xs mb-2">
              <label className="text-gray-300 font-semibold cursor-pointer">Recadrage auto</label>
              <input
                type="checkbox"
                checked={enableCrop}
                onChange={(e) => setEnableCrop(e.target.checked)}
                className="accent-[#F7941D]"
              />
            </div>

            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">Redimension</label>
              <select
                value={fitMode}
                onChange={(e) => setFitMode(e.target.value as any)}
                className="bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded px-2 py-1 flex-1 text-xs"
              >
                <option value="tight">🎯 Ajusté au design</option>
                <option value="frame">⬜ Cadre fixe (marges)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[10px] text-[#9C9C9C] mb-0.5">Largeur max (cm)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetWidthCm}
                  onChange={(e) => setTargetWidthCm(parseFloat(e.target.value) || 29)}
                  className="w-full bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#9C9C9C] mb-0.5">Hauteur max (cm)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetHeightCm}
                  onChange={(e) => setTargetHeightCm(parseFloat(e.target.value) || 34)}
                  className="w-full bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Astuce Pro */}
          <div className="bg-gradient-to-br from-[#F7941D]/10 to-[#0A0A0A] border border-[#F7941D]/30 rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#F7941D]/30 pb-1 mb-2">
              💡 Astuce Pro
            </h3>
            <p className="text-[10px] text-[#9C9C9C] leading-relaxed">
              <span className="text-[#F7941D] font-bold">Couleurs délavées ?</span> cochez <b>💪 Renforcer</b>.<br />
              <span className="text-[#F7941D] font-bold">T-shirt noir :</span> Luma <b>Off</b> + fond <b>Auto</b> + <b>Reboucher les trous</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers de traitement Canvas
function countOpaque(data: Uint8ClampedArray) {
  let c = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 0) c++;
  return c;
}

function safeBackgroundRemoval(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  refR: number,
  refG: number,
  refB: number,
  toleranceVal: number
) {
  const tolerance = toleranceVal * 3;
  const n = w * h;
  const matchColor = (idx: number) =>
    colorDistManhattan(data[idx], data[idx + 1], data[idx + 2], refR, refG, refB) <= tolerance;

  const bg = new Uint8Array(n);
  const queue = new Int32Array(n);
  let qt = 0;
  let qh = 0;

  for (let x = 0; x < w; x++) {
    const p1 = x;
    if (matchColor(p1 * 4) && !bg[p1]) {
      bg[p1] = 1;
      queue[qt++] = p1;
    }
    const p2 = (h - 1) * w + x;
    if (matchColor(p2 * 4) && !bg[p2]) {
      bg[p2] = 1;
      queue[qt++] = p2;
    }
  }

  for (let y = 0; y < h; y++) {
    const p3 = y * w;
    if (matchColor(p3 * 4) && !bg[p3]) {
      bg[p3] = 1;
      queue[qt++] = p3;
    }
    const p4 = y * w + (w - 1);
    if (matchColor(p4 * 4) && !bg[p4]) {
      bg[p4] = 1;
      queue[qt++] = p4;
    }
  }

  while (qh < qt) {
    const pos = queue[qh++];
    const x = pos % w;
    const y = Math.floor(pos / w);
    const nb: number[] = [];
    if (x > 0) nb.push(pos - 1);
    if (x < w - 1) nb.push(pos + 1);
    if (y > 0) nb.push(pos - w);
    if (y < h - 1) nb.push(pos + w);
    for (const np of nb) {
      if (!bg[np] && matchColor(np * 4)) {
        bg[np] = 1;
        queue[qt++] = np;
      }
    }
  }

  let r = 0;
  for (let i = 0; i < n; i++) {
    if (bg[i] && data[i * 4 + 3] > 0) {
      data[i * 4 + 3] = 0;
      r++;
    }
  }
  return r;
}

function fillSmallHoles(data: Uint8ClampedArray, w: number, h: number, maxSize: number) {
  const n = w * h;
  const trans = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (data[i * 4 + 3] < 128) trans[i] = 1;

  const comp = new Int32Array(n).fill(-1);
  const sizes: number[] = [];
  let nextId = 0;
  const stack = new Int32Array(n);

  for (let i = 0; i < n; i++) {
    if (!trans[i] || comp[i] >= 0) continue;
    let sz = 0;
    let sp = 0;
    stack[sp++] = i;
    comp[i] = nextId;

    while (sp > 0) {
      const p = stack[--sp];
      sz++;
      const x = p % w;
      const y = (p / w) | 0;
      const nb: number[] = [];
      if (x > 0) nb.push(p - 1);
      if (x < w - 1) nb.push(p + 1);
      if (y > 0) nb.push(p - w);
      if (y < h - 1) nb.push(p + w);
      for (const q of nb) {
        if (trans[q] && comp[q] < 0) {
          comp[q] = nextId;
          stack[sp++] = q;
        }
      }
    }
    sizes[nextId] = sz;
    nextId++;
  }

  const touche = new Uint8Array(nextId);
  for (let i = 0; i < n; i++) {
    if (comp[i] >= 0) {
      const x = i % w;
      const y = (i / w) | 0;
      if (x === 0 || x === w - 1 || y === 0 || y === h - 1) touche[comp[i]] = 1;
    }
  }

  for (let i = 0; i < n; i++) {
    if (trans[i] && comp[i] >= 0 && !touche[comp[i]] && sizes[comp[i]] <= maxSize * maxSize) {
      data[i * 4 + 3] = 255;
    }
  }
}

function defringeIsolated(data: Uint8ClampedArray, w: number, h: number, radius: number) {
  const n = w * h;
  const opaque = new Uint8Array(n);
  for (let i = 0; i < n; i++) if (data[i * 4 + 3] >= 128) opaque[i] = 1;
  const r2 = radius * radius;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!opaque[i]) continue;
      let vo = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && opaque[ny * w + nx]) vo++;
        }
      }
      if (vo < 3) data[i * 4 + 3] = 0;
    }
  }
}

function boostColors(data: Uint8ClampedArray, w: number, h: number, satMul: number, conMul: number) {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i + 3] = 255;
    let r = (data[i] - 128) * conMul + 128;
    let g = (data[i + 1] - 128) * conMul + 128;
    let b = (data[i + 2] - 128) * conMul + 128;
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * satMul;
    g = gray + (g - gray) * satMul;
    b = gray + (b - gray) * satMul;
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
}

function localVariance(data: Uint8ClampedArray, w: number, h: number) {
  const n = w * h;
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    lum[i] = luminance(data[p], data[p + 1], data[p + 2]);
  }
  const out = new Float32Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      let s2 = 0;
      let c = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const v = lum[ny * w + nx];
            s += v;
            s2 += v * v;
            c++;
          }
        }
      }
      const m = s / c;
      out[y * w + x] = Math.max(0, s2 / c - m * m);
    }
  }
  return out;
}

function applyAdaptiveLumaKey(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  mode: string,
  threshold: number,
  softness: number,
  fabricColorHex: string
) {
  if (mode === 'off') return;
  let eff = mode;
  if (mode === 'auto') {
    const frgb = hexToRgb(fabricColorHex);
    const fl = luminance(frgb.r, frgb.g, frgb.b);
    if (fl > 200) eff = 'light';
    else return;
  }
  const EPS = 0.01;
  const VAR_FLAT = 250;
  let vari: Float32Array | null = null;
  if (eff === 'soft') vari = localVariance(data, w, h);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = luminance(data[i], data[i + 1], data[i + 2]);
    const px = i / 4;
    if (eff === 'soft' && vari && vari[px] > VAR_FLAT) continue;
    let f;
    if (eff === 'dark' || eff === 'soft') f = Math.max(0, Math.min(1, (lum - threshold) / Math.max(1, softness)));
    else f = Math.max(0, Math.min(1, (255 - lum - (255 - threshold)) / Math.max(1, softness)));

    if (f <= EPS) {
      data[i + 3] = 0;
      continue;
    }
    if (f < 1) {
      const fSafe = Math.max(f, EPS);
      if (eff === 'dark' || eff === 'soft') {
        data[i] = Math.min(255, data[i] / fSafe);
        data[i + 1] = Math.min(255, data[i + 1] / fSafe);
        data[i + 2] = Math.min(255, data[i + 2] / fSafe);
      } else {
        data[i] = Math.max(0, Math.min(255, (data[i] - 255 * (1 - f)) / fSafe));
        data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 255 * (1 - f)) / fSafe));
        data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 255 * (1 - f)) / fSafe));
      }
      data[i + 3] = Math.round(data[i + 3] * f);
    }
  }
}

function applyErosion(data: Uint8ClampedArray, w: number, h: number, radius: number) {
  const n = w * h;
  const dist = new Float32Array(n);
  const DIAG = Math.SQRT2;
  for (let i = 0; i < n; i++) dist[i] = data[i * 4 + 3] === 0 ? 0 : 999;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (dist[i] === 0) continue;
      let d = dist[i];
      if (x > 0) d = Math.min(d, dist[i - 1] + 1);
      if (y > 0) d = Math.min(d, dist[i - w] + 1);
      if (x > 0 && y > 0) d = Math.min(d, dist[i - w - 1] + DIAG);
      if (x < w - 1 && y > 0) d = Math.min(d, dist[i - w + 1] + DIAG);
      dist[i] = d;
    }
  }

  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      let d = dist[i];
      if (x < w - 1) d = Math.min(d, dist[i + 1] + 1);
      if (y < h - 1) d = Math.min(d, dist[i + w] + 1);
      if (x < w - 1 && y < h - 1) d = Math.min(d, dist[i + w + 1] + DIAG);
      if (x > 0 && y < h - 1) d = Math.min(d, dist[i + w - 1] + DIAG);
      dist[i] = d;
    }
  }

  for (let i = 0; i < n; i++) if (dist[i] <= radius) data[i * 4 + 3] = 0;
}

function applyGrunge(data: Uint8ClampedArray, w: number, h: number, intensity: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] > 0) {
        const noise = Math.abs((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1);
        if (noise < intensity * 0.25) data[idx + 3] = 0;
      }
    }
  }
}

function applyHalftone(data: Uint8ClampedArray, w: number, h: number, dotSize: number) {
  const halfStep = dotSize / 2;
  for (let y = 0; y < h; y += dotSize) {
    for (let x = 0; x < w; x += dotSize) {
      let totalLum = 0;
      let count = 0;
      for (let dy = 0; dy < dotSize && y + dy < h; dy++) {
        for (let dx = 0; dx < dotSize && x + dx < w; dx++) {
          const pIdx = ((y + dy) * w + (x + dx)) * 4;
          if (data[pIdx + 3] > 10) {
            totalLum += luminance(data[pIdx], data[pIdx + 1], data[pIdx + 2]) / 255;
            count++;
          }
        }
      }
      if (count > dotSize * dotSize * 0.2) {
        const avgLum = totalLum / count;
        const radius = halfStep * (1 - avgLum);
        for (let dy = 0; dy < dotSize && y + dy < h; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < w; dx++) {
            data[((y + dy) * w + (x + dx)) * 4 + 3] = 0;
          }
        }
        const cx = x + halfStep;
        const cy = y + halfStep;
        for (let dy = -halfStep; dy <= halfStep; dy++) {
          for (let dx = -halfStep; dx <= halfStep; dx++) {
            const nx = Math.round(cx + dx);
            const ny = Math.round(cy + dy);
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && dx * dx + dy * dy <= radius * radius) {
              data[(ny * w + nx) * 4 + 3] = 255;
            }
          }
        }
      }
    }
  }
}

function findBoundingBox(data: Uint8ClampedArray, w: number, h: number) {
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      if (data[(row + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }
  return found ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : null;
}