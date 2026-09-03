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

function countOpaque(data: Uint8ClampedArray) {
  let count = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 10) count++;
  }
  return count;
}

function detectBackgroundColor(imageData: ImageData): {
  detected: true;
  color: { r: number; g: number; b: number };
} | { detected: false } {
  const { data, width: w, height: h } = imageData;
  if (w < 1 || h < 1) return { detected: false };

  const corners = [
    { r: data[0], g: data[1], b: data[2] },
    { r: data[(w - 1) * 4], g: data[(w - 1) * 4 + 1], b: data[(w - 1) * 4 + 2] },
    {
      r: data[(h - 1) * w * 4],
      g: data[(h - 1) * w * 4 + 1],
      b: data[(h - 1) * w * 4 + 2],
    },
    {
      r: data[((h - 1) * w + (w - 1)) * 4],
      g: data[((h - 1) * w + (w - 1)) * 4 + 1],
      b: data[((h - 1) * w + (w - 1)) * 4 + 2],
    },
  ];

  const avgColor = {
    r: (corners[0].r + corners[1].r + corners[2].r + corners[3].r) / 4,
    g: (corners[0].g + corners[1].g + corners[2].g + corners[3].g) / 4,
    b: (corners[0].b + corners[1].b + corners[2].b + corners[3].b) / 4,
  };

  const similar = corners.every((c) => {
    const dist = Math.hypot(c.r - avgColor.r, c.g - avgColor.g, c.b - avgColor.b);
    return dist <= 30;
  });

  if (!similar) return { detected: false };

  return {
    detected: true,
    color: {
      r: Math.round(avgColor.r),
      g: Math.round(avgColor.g),
      b: Math.round(avgColor.b),
    },
  };
}

function removeBackgroundByColor(
  imageData: ImageData,
  targetColor: { r: number; g: number; b: number },
  tolerance: number
) {
  const { data, width: w, height: h } = imageData;
  const threshold = tolerance * 4.5;
  const visited = new Uint8Array(w * h);
  const queue: number[] = [];

  // Ensemencement depuis les 4 bords du visuel (perimeter seeds)
  for (let x = 0; x < w; x++) {
    queue.push(x); // haut
    queue.push((h - 1) * w + x); // bas
  }
  for (let y = 1; y < h - 1; y++) {
    queue.push(y * w); // gauche
    queue.push(y * w + (w - 1)); // droite
  }

  // Flood-fill BFS pour supprimer uniquement le fond connecté
  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    if (visited[idx]) continue;
    visited[idx] = 1;

    const i4 = idx * 4;
    const a = data[i4 + 3];
    if (a < 10) continue; // déjà transparent

    const dist = Math.hypot(
      data[i4] - targetColor.r,
      data[i4 + 1] - targetColor.g,
      data[i4 + 2] - targetColor.b
    );

    if (dist <= threshold) {
      data[i4 + 3] = 0; // suppression fond

      const x = idx % w;
      const y = Math.floor(idx / w);
      if (x > 0 && !visited[idx - 1]) queue.push(idx - 1);
      if (x < w - 1 && !visited[idx + 1]) queue.push(idx + 1);
      if (y > 0 && !visited[idx - w]) queue.push(idx - w);
      if (y < h - 1 && !visited[idx + w]) queue.push(idx + w);
    }
  }

  return imageData;
}


/**
 * detectAndRemoveWatermarks — Détecte et supprime les watermarks/overlays :
 * 1) Zones semi-transparentes (alpha 50–200) → directement supprimées
 * 2) Pixels isolés à fort contraste sur fond uniforme (logos/texte overlay)
 *    → remplacés par interpolation des voisins (inpainting simple 3×3)
 * intensity: 0–1 (contrôle la sensibilité de détection)
 */
function detectAndRemoveWatermarks(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  intensity: number
) {
  const contrastThreshold = Math.round(80 - intensity * 50); // 30–80
  const watermarkMask = new Uint8Array(w * h); // 1 = pixel watermark

  // Passe 1 : zones semi-transparentes (alpha entre 50 et 200)
  for (let i = 0; i < w * h; i++) {
    const alpha = data[i * 4 + 3];
    if (alpha > 50 && alpha < 200) {
      watermarkMask[i] = 1;
    }
  }

  // Passe 2 : détection contraste élevé sur fond uniforme
  // Pour chaque pixel, on compare sa couleur à la moyenne de son voisinage 5×5
  const radius = 2;
  for (let y = radius; y < h - radius; y++) {
    for (let x = radius; x < w - radius; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] < 20) continue; // transparent → skip

      let sumR = 0, sumG = 0, sumB = 0, cnt = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx === 0 && dy === 0) continue;
          const ni = ((y + dy) * w + (x + dx)) * 4;
          if (data[ni + 3] > 20) {
            sumR += data[ni]; sumG += data[ni + 1]; sumB += data[ni + 2];
            cnt++;
          }
        }
      }
      if (cnt === 0) continue;

      const avgR = sumR / cnt, avgG = sumG / cnt, avgB = sumB / cnt;
      const dist = Math.hypot(data[idx] - avgR, data[idx + 1] - avgG, data[idx + 2] - avgB);

      // Pixel très différent de ses voisins = potentiel watermark overlay
      if (dist > contrastThreshold) {
        // Vérification supplémentaire : les voisins sont homogènes (fond uniforme)
        let varR = 0, varG = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ni = ((y + dy) * w + (x + dx)) * 4;
            if (data[ni + 3] > 20) {
              varR += (data[ni] - avgR) ** 2;
              varG += (data[ni + 1] - avgG) ** 2;
            }
          }
        }
        const uniformity = Math.sqrt((varR + varG) / (cnt * 2));
        // Si fond uniforme (variance basse) + pixel très contrasté → watermark
        if (uniformity < 25) {
          watermarkMask[y * w + x] = 1;
        }
      }
    }
  }

  // Passe 3 : inpainting — remplace les pixels watermark par la moyenne des voisins non-watermark
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!watermarkMask[y * w + x]) continue;

      let sumR = 0, sumG = 0, sumB = 0, cnt = 0;
      const nr = 3; // rayon inpainting
      for (let dy = -nr; dy <= nr; dy++) {
        for (let dx = -nr; dx <= nr; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
          const ni = ny * w + nx;
          if (!watermarkMask[ni] && data[ni * 4 + 3] > 20) {
            sumR += data[ni * 4]; sumG += data[ni * 4 + 1]; sumB += data[ni * 4 + 2];
            cnt++;
          }
        }
      }

      const base = (y * w + x) * 4;
      if (cnt > 0) {
        // Remplace par la couleur du fond environnant
        data[base]     = Math.round(sumR / cnt);
        data[base + 1] = Math.round(sumG / cnt);
        data[base + 2] = Math.round(sumB / cnt);
        data[base + 3] = 255; // opaque
      } else {
        // Aucun voisin valide → on supprime
        data[base + 3] = 0;
      }
    }
  }
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
  const [currentFileName, setCurrentFileName] = useState<string>('visuel.png'); // nom du fichier chargé

  // Settings
  const [bgView, setBgView] = useState<'fabric' | 'checker' | 'black' | 'white'>('fabric');
  const [fabricColor, setFabricColorState] = useState('#000000');
  const [fabricName, setFabricName] = useState('Noir');
  const [enableFabricOpt, setEnableFabricOpt] = useState(false);

  // Background Removal Controls
  const [bgRemovalMode, setBgRemovalMode] = useState<'auto' | 'black' | 'white' | 'both' | 'custom' | 'picker' | 'click' | 'none'>('auto');
  const [customBgColor, setCustomBgColor] = useState('#000000');
  const [bgTolerance, setBgTolerance] = useState(30);
  const [whiteTolerance, setWhiteTolerance] = useState(35); // Slider Tolérance Blanc pour off-whites & contours

  // === NOUVEAU : Seuil de luminosité global pour la suppression du blanc ===
  const [whiteThreshold, setWhiteThreshold] = useState(240); // (R+G+B)/3 > seuil → transparent
  const [aggressiveWhite, setAggressiveWhite] = useState(false); // Seuil forcé à 220

  // === UPSCALE : Facteur d'agrandissement AVANT traitement ===
  // (remplace scaleFactor - même variable, UI réactivée ci-dessous)

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
  // === UPSCALE AUTOMATIQUE INTELLIGENT ===
  const [autoUpscale, setAutoUpscale] = useState(true); // activé par défaut
  // === COULEUR DE FOND DÉTECTÉE (affichage UI) ===
  const [detectedBgColor, setDetectedBgColor] = useState<{ r: number; g: number; b: number } | null>(null);
  // === SUPPRESSION WATERMARKS ===
  const [enableWatermarkRemoval, setEnableWatermarkRemoval] = useState(false);
  const [watermarkIntensity, setWatermarkIntensity] = useState(50);

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

    setTimeout(() => {
      try {
      setIsProcessing(true);
      const t0 = performance.now();

      // ── UPSCALE AUTOMATIQUE INTELLIGENT ──────────────────────────────────
      // Si autoUpscale actif : choisit le facteur selon la résolution source
      let scale = scaleFactor;
      if (autoUpscale) {
        const maxDim = Math.max(originalImage.width, originalImage.height);
        if (maxDim < 1500)      scale = 4; // petite image → 4x
        else if (maxDim < 3000) scale = 2; // moyenne     → 2x
        else                    scale = 1; // grande       → pas d'upscale
      }

      const targetW = originalImage.width * scale;
      const targetH = originalImage.height * scale;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = targetW;
      tempCanvas.height = targetH;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        throw new Error("Impossible d'obtenir le contexte canvas 2D");
      }

      // Upscale haute qualité
      tempCtx.imageSmoothingEnabled = scale > 1;
      tempCtx.imageSmoothingQuality = 'high';
      tempCtx.drawImage(originalImage, 0, 0, targetW, targetH);

      // ── FLOU GAUSSIEN POST-UPSCALE (lisse les pixels agrandis) ───────────
      // Seulement si upscale > 1 (évite de ramollir les images déjà HD)
      if (scale > 1) {
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = targetW;
        blurCanvas.height = targetH;
        const blurCtx = blurCanvas.getContext('2d');
        if (blurCtx) {
          // Flou très léger via CSS filter sur canvas — rayon 0.5–1px selon facteur
          const blurRadius = scale === 4 ? 1 : 0.5;
          blurCtx.filter = `blur(${blurRadius}px)`;
          blurCtx.drawImage(tempCanvas, 0, 0);
          blurCtx.filter = 'none';
          // Recopie le résultat flou dans tempCanvas
          tempCtx.clearRect(0, 0, targetW, targetH);
          tempCtx.drawImage(blurCanvas, 0, 0);
        }
      }

      const imgData = tempCtx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      const initialOpaque = countOpaque(data);

      let refR = 0, refG = 0, refB = 0;
      let skipFloodFill = false;
      let removedCount = 0;

      if (bgRemovalMode === 'auto') {
        const detection = detectBackgroundColor(imgData);
        if (detection.detected) {
          refR = detection.color.r;
          refG = detection.color.g;
          refB = detection.color.b;
          setDetectedBgColor(detection.color); // ← affichage UI
          const before = countOpaque(data);
          removeBackgroundByColor(imgData, detection.color, bgTolerance);
          removedCount += before - countOpaque(data);
          skipFloodFill = true;
        } else {
          setDetectedBgColor(null);
          const samples: [number, number, number][] = [];
          const ss = 4;
          const corners = [
            [0, 0], [targetW - ss, 0],
            [0, targetH - ss], [targetW - ss, targetH - ss],
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
        }
      } else if (bgRemovalMode === 'picker' || bgRemovalMode === 'custom') {
        setDetectedBgColor(null);
        if (clickedBgColor && bgRemovalMode === 'picker') {
          refR = clickedBgColor.r; refG = clickedBgColor.g; refB = clickedBgColor.b;
        } else {
          const rgb = hexToRgb(customBgColor);
          refR = rgb.r; refG = rgb.g; refB = rgb.b;
        }
      } else if (bgRemovalMode === 'click') {
        setDetectedBgColor(null);
        if (clickedBgColor) {
          refR = clickedBgColor.r; refG = clickedBgColor.g; refB = clickedBgColor.b;
        } else {
          refR = data[0]; refG = data[1]; refB = data[2];
        }
      } else {
        setDetectedBgColor(null);
      }

      // =====================================================================
      // STRATÉGIE DOUBLE :
      //  • Modes "black" / "auto" / "custom" → flood-fill depuis les bords
      //  • Mode "white" → SEUIL DE LUMINOSITÉ GLOBAL pixel-par-pixel (R+G+B)/3
      //  • Mode "both"  → flood-fill noir + seuil luminosité blanc
      // =====================================================================
      const effectiveWhiteThreshold = aggressiveWhite ? 220 : whiteThreshold;

      const modeForFloodFill: string =
        skipFloodFill || bgRemovalMode === 'white' ? 'none' :
        bgRemovalMode === 'both'  ? 'black' :
        bgRemovalMode;

      if (modeForFloodFill !== 'none') {
        removedCount += safeBackgroundRemoval(data, targetW, targetH, refR, refG, refB, bgTolerance, modeForFloodFill, whiteTolerance);
      }

      if (bgRemovalMode === 'white' || bgRemovalMode === 'both') {
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) continue;
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (avg >= effectiveWhiteThreshold) {
            data[i + 3] = 0;
            removedCount++;
          }
        }
      }

      // ── SUPPRESSION WATERMARKS ────────────────────────────────────────────
      if (enableWatermarkRemoval) {
        detectAndRemoveWatermarks(data, targetW, targetH, watermarkIntensity / 100);
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
          out.width = outW; out.height = outH;
          const o = out.getContext('2d');
          if (o) {
            o.imageSmoothingEnabled = true;
            o.imageSmoothingQuality = 'high';
            o.drawImage(finalCanvas, 0, 0, outW, outH);
          }
          outputCanvas = out;
        } else {
          const out = document.createElement('canvas');
          out.width = tW_px; out.height = tH_px;
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
      setPerfText(`⚡ ${(performance.now() - t0).toFixed(0)}ms · ${scale}x`);

      if (bgRemovalMode !== 'none') {
        setDebugText(`Fond rgb(${refR.toFixed(0)},${refG.toFixed(0)},${refB.toFixed(0)}) · Suppr: ${removedCount.toLocaleString()}/${initialOpaque.toLocaleString()}`);
      } else {
        setDebugText('');
      }
      } catch (error) {
        console.error('Erreur traitement:', error);
        showToast('Erreur lors du traitement', 'error');
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  }, [
    originalImage,
    showToast,
    scaleFactor,
    autoUpscale,
    bgRemovalMode,
    customBgColor,
    clickedBgColor,
    bgTolerance,
    whiteTolerance,
    whiteThreshold,
    aggressiveWhite,
    enableWatermarkRemoval,
    watermarkIntensity,
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
    setCurrentFileName(file.name); // mémorise le nom du fichier pour l'enregistrement projet
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
    const pickerActive = bgRemovalMode === 'click' || bgRemovalMode === 'picker';
    if (!pickerActive || !originalImage || !awaitingClickColor || !canvasRef.current) return;
    const canvasEl = canvasRef.current;
    const rect = canvasEl.getBoundingClientRect();
    const sx = canvasEl.width / rect.width;
    const sy = canvasEl.height / rect.height;
    const rectX = (e.clientX - rect.left) * sx;
    const rectY = (e.clientY - rect.top) * sy;
    const x = Math.min(Math.max(0, Math.floor(rectX)), canvasEl.width - 1);
    const y = Math.min(Math.max(0, Math.floor(rectY)), canvasEl.height - 1);
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    const p = ctx.getImageData(x, y, 1, 1).data;
    if (p[3] < 10) {
      showToast('⚠️ Zone transparente', 'warn');
      return;
    }
    setClickedBgColor({ r: p[0], g: p[1], b: p[2] });
    const hex =
      '#' +
      [p[0], p[1], p[2]]
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('');
    setCustomBgColor(hex);
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

    // =========================================================================
    // Enregistrement projet en base64 dans MongoDB (après téléchargement réussi)
    // On utilise try/catch séparé pour ne pas bloquer l'UX si ça échoue
    // =========================================================================
    try {
      if (processedCanvas && originalImage) {
        const processedDataUrl = type === 'color'
          ? processedCanvas.toDataURL('image/png')
          : (() => {
              // Génère le white-base en base64 pour le stockage
              const w = processedCanvas.width;
              const h = processedCanvas.height;
              const wc2 = document.createElement('canvas');
              wc2.width = w;
              wc2.height = h;
              const wctx = wc2.getContext('2d');
              if (!wctx) return processedCanvas.toDataURL('image/png');
              const srcImgData = processedCanvas.getContext('2d')!.getImageData(0, 0, w, h);
              const whiteImg = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
              for (let i = 0; i < srcImgData.data.length; i += 4) {
                if (srcImgData.data[i + 3] > 20) {
                  whiteImg.data[i] = 255; whiteImg.data[i+1] = 255;
                  whiteImg.data[i+2] = 255; whiteImg.data[i+3] = 255;
                }
              }
              wctx.putImageData(whiteImg, 0, 0);
              return wc2.toDataURL('image/png');
            })();

        // Image originale en base64
        const origCanvas = document.createElement('canvas');
        origCanvas.width = originalImage.width;
        origCanvas.height = originalImage.height;
        const origCtx = origCanvas.getContext('2d');
        if (origCtx) origCtx.drawImage(originalImage, 0, 0);
        const originalDataUrl = origCanvas.toDataURL('image/png');

        const fileName = currentFileName || 'visuel';
        const baseName = fileName.replace(/\.[^.]+$/, '');
        const processedName = type === 'color'
          ? `${baseName}-dtf-couleur.png`
          : `${baseName}-dtf-white-base.png`;

        fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolType: 'dtf-studio',
            originalFileName: fileName,
            processedFileName: processedName,
            originalFileData: originalDataUrl,
            processedFileData: processedDataUrl,
            originalFileMime: 'image/png',
            processedFileMime: 'image/png',
            fileSize: Math.round(originalDataUrl.length * 0.75),
            status: 'completed',
            creditsUsed: 1,
            metadata: {
              bgRemovalMode,
              widthCm: targetWidthCm,
              heightCm: targetHeightCm,
              scaleFactor,
              exportType: type,
            },
          }),
        }).catch((err) => console.warn('[DTF Studio] Enregistrement projet échoué:', err));
      }
    } catch (saveErr) {
      console.warn('[DTF Studio] Erreur enregistrement projet (non bloquant):', saveErr);
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

            {!originalImage ? (
              <div className="text-center text-gray-500 p-4">
                <p className="text-sm font-bold text-[#F7941D] mb-1">{t('studioPage.readyToOptimize')}</p>
                <p className="text-xs">{t('studioPage.stepsGuide')}</p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`max-h-[500px] max-w-full object-contain ${
                  (bgRemovalMode === 'click' || bgRemovalMode === 'picker') && awaitingClickColor ? 'cursor-crosshair border-2 border-dashed border-[#F7941D]' : ''
                }`}
              />
            )}
          </div>

          <div className="px-3 py-2 border-t border-[#2E2E2E] bg-[#111] flex flex-col gap-1 text-[11px] text-gray-400">
            <div className="flex justify-between items-center">
              <span>{dimensionText}</span>
              <span className="text-[#F7941D] font-bold">{perfText}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="truncate">{debugText}</span>
            </div>
          </div>

          <div className="p-3 border-t border-[#2E2E2E] bg-[#161616] flex gap-2">
            <button
              onClick={() => handleDownload('color')}
              disabled={!originalImage}
              className="bg-[#F7941D] text-black font-extrabold hover:bg-[#FFB25A] disabled:opacity-50 disabled:cursor-not-allowed flex-1 py-1.5 rounded-md transition text-xs shadow-lg shadow-[#F7941D]/10"
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

          {/* ====== UPSCALE AVANT TRAITEMENT ====== */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              {t('studioPage.upscaleSection')}
            </h3>

            {/* Toggle Upscale Auto */}
            <label className="flex items-center gap-2 cursor-pointer text-xs mb-2">
              <input
                type="checkbox"
                checked={autoUpscale}
                onChange={(e) => setAutoUpscale(e.target.checked)}
                className="accent-[#F7941D] w-3.5 h-3.5"
              />
              <span className="text-[11px] text-slate-300 font-bold">⚡ Upscale automatique (recommandé)</span>
            </label>

            {autoUpscale ? (
              <p className="text-[10px] text-slate-500 bg-[#0A0A0A] rounded px-2 py-1.5 leading-snug">
                🔍 Auto : &lt;1500px→4x · 1500–3000px→2x · &gt;3000px→1x<br />
                {originalImage && (
                  <span className="text-[#F7941D] font-bold">
                    {Math.max(originalImage.width, originalImage.height) < 1500
                      ? '→ 4x Ultra-HD appliqué'
                      : Math.max(originalImage.width, originalImage.height) < 3000
                      ? '→ 2x recommandé appliqué'
                      : '→ Pas d\'upscale (image déjà HD)'}
                  </span>
                )}
              </p>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  {([1, 2, 4] as const).map((factor) => (
                    <button
                      key={factor}
                      onClick={() => setScaleFactor(factor)}
                      className={`flex-1 py-1.5 rounded text-xs font-extrabold border transition-all ${
                        scaleFactor === factor
                          ? 'bg-[#F7941D] text-black border-[#F7941D] shadow-md shadow-[#F7941D]/20'
                          : 'bg-[#0A0A0A] text-slate-300 border-[#2E2E2E] hover:border-[#F7941D]'
                      }`}
                    >
                      {factor === 1 ? t('studioPage.upscale1x') : factor === 2 ? t('studioPage.upscale2x') : t('studioPage.upscale4x')}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Résolution sortie : {scaleFactor === 1 ? 'Originale' : scaleFactor === 2 ? '2× (recommandé)' : '4× Ultra-HD (lent)'}
                </p>
              </>
            )}
            <p className="text-[9px] text-slate-600 mt-1">Flou gaussien léger appliqué après upscale pour lisser les pixels.</p>
          </div>

          {/* ====== SUPPRESSION DU FOND ====== */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              {t('studioPage.removeBgSection')}
            </h3>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <label className="w-20 text-[#9C9C9C] text-[11px]">{t('studioPage.methodLabel')}</label>
              <select
                value={bgRemovalMode}
                onChange={(e) => {
                  const m = e.target.value as 'auto' | 'black' | 'white' | 'both' | 'custom' | 'picker' | 'click' | 'none';
                  setBgRemovalMode(m);
                  if (m === 'click' || m === 'custom' || m === 'picker') setAwaitingClickColor(true);
                  else setAwaitingClickColor(false);
                }}
                className="bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded px-2 py-1 flex-1 text-xs"
              >
                <option value="auto">{t('studio.bgRemoval.mode.auto')}</option>
                <option value="black">{t('studio.bgRemoval.mode.black')}</option>
                <option value="white">{t('studio.bgRemoval.mode.white')}</option>
                <option value="both">{t('studio.bgRemoval.mode.both')}</option>
                <option value="custom">{t('studio.bgRemoval.mode.custom')}</option>
                <option value="picker">🎨 Pipette (choisir la couleur)</option>
                <option value="none">{t('studio.bgRemoval.mode.none')}</option>
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

            {/* Tolérance globale (flood-fill noir/auto/custom) */}
            {bgRemovalMode !== 'white' && (
              <div className="flex items-center gap-2 mb-2 text-xs">
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
            )}

            {/* ====== CONTRÔLES SEUIL BLANC (mode white / both) ====== */}
            {(bgRemovalMode === 'white' || bgRemovalMode === 'both') && (
              <div className="space-y-2 pt-1 border-t border-[#2E2E2E] mt-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] font-bold text-[#F7941D] uppercase tracking-wider">⚡ Seuil Luminosité</span>
                  <span className="text-[9px] text-slate-500 ml-auto">Simple (R+G+B)/3</span>
                </div>

                {/* Checkbox Suppression Agressive */}
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={aggressiveWhite}
                    onChange={(e) => {
                      setAggressiveWhite(e.target.checked);
                      if (e.target.checked) setWhiteThreshold(220);
                    }}
                    className="accent-[#F7941D] w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-300 font-bold">{t('studioPage.aggressiveWhiteLabel')}</span>
                </label>

                {/* Slider seuil luminosité 150-255 */}
                <div className="flex items-center gap-2 text-xs">
                  <label className="w-20 text-[#9C9C9C] text-[11px] shrink-0">{t('studioPage.whiteThresholdLabel')}</label>
                  <input
                    type="range"
                    min="150"
                    max="255"
                    value={aggressiveWhite ? 220 : whiteThreshold}
                    disabled={aggressiveWhite}
                    onChange={(e) => setWhiteThreshold(parseInt(e.target.value))}
                    className="flex-1 accent-[#F7941D] disabled:opacity-40"
                  />
                  <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">
                    {aggressiveWhite ? 220 : whiteThreshold}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 leading-snug">
                  Pixels dont la moyenne (R+G+B)/3 ≥ {aggressiveWhite ? 220 : whiteThreshold} → transparents.
                  Tous les blancs supprimés (fond + design).
                </p>
              </div>
            )}

            {/* Couleur de fond détectée */}
            {detectedBgColor && bgRemovalMode === 'auto' && (
              <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                <div
                  className="w-4 h-4 rounded border border-[#2E2E2E] flex-shrink-0"
                  style={{ backgroundColor: `rgb(${detectedBgColor.r},${detectedBgColor.g},${detectedBgColor.b})` }}
                />
                <span className="text-slate-400">
                  🎯 Couleur détectée : <span className="text-[#F7941D] font-bold font-mono">
                    rgb({detectedBgColor.r},{detectedBgColor.g},{detectedBgColor.b})
                  </span>
                </span>
              </div>
            )}
            {debugText && <div className="text-[10px] text-[#FFB25A] mt-1">📊 {debugText}</div>}
          </div>

          {/* ====== SUPPRESSION WATERMARKS ====== */}
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-2.5">
            <h3 className="text-[11px] font-extrabold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              🔍 Suppression Watermarks
            </h3>

            {/* Toggle Watermark Removal */}
            <label className="flex items-center gap-2 cursor-pointer text-xs mb-2">
              <input
                type="checkbox"
                checked={enableWatermarkRemoval}
                onChange={(e) => setEnableWatermarkRemoval(e.target.checked)}
                className="accent-[#F7941D] w-3.5 h-3.5"
              />
              <span className="text-[11px] text-slate-300 font-bold">Supprimer watermarks auto</span>
            </label>

            {enableWatermarkRemoval && (
              <>
                <div className="flex items-center gap-2 text-xs">
                  <label className="w-20 text-[#9C9C9C] text-[11px]">Intensité</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={watermarkIntensity}
                    onChange={(e) => setWatermarkIntensity(parseInt(e.target.value))}
                    className="flex-1 accent-[#F7941D]"
                  />
                  <span className="w-8 text-right text-[#F7941D] font-bold text-[11px]">{watermarkIntensity}</span>
                </div>
                <p className="text-[9px] text-slate-500 mt-1 leading-snug">
                  Détecte les zones semi-transparentes, textes et logos overlay,
                  puis les remplace par le fond environnant (inpainting).
                  <span className="text-amber-400"> ⚠️ Peut altérer certains designs. Tester avec précaution.</span>
                </p>
              </>
            )}
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
        </div>

        {/* Colonne 3 : Swatches & Paramètres Tissu */}
        <div className="col-span-12 lg:col-span-3 bg-[#161616] border border-[#2E2E2E] rounded-lg p-3 overflow-y-auto max-h-[calc(100vh-120px)] flex flex-col gap-3">
          <div>
            <h3 className="text-xs font-bold text-[#F7941D] uppercase border-b border-[#2E2E2E] pb-1 mb-2">
              {t('studioPage.fabricColorSection')}
            </h3>
            <div className="text-xs font-bold text-white mb-2 flex justify-between">
              <span>Sélectionné :</span>
              <span className="text-[#F7941D]">{fabricName}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {FABRIC_SWATCHES.map((s) => (
                <button
                  key={s.color}
                  onClick={() => handleSetFabricColor(s.color, s.name)}
                  title={s.name}
                  className={`h-8 rounded border transition-transform flex items-center justify-center text-[10px] ${
                    fabricColor.toLowerCase() === s.color.toLowerCase()
                      ? 'border-[#F7941D] scale-105 shadow-md shadow-[#F7941D]/20'
                      : 'border-[#2E2E2E] hover:scale-100'
                  }`}
                  style={{ backgroundColor: s.color }}
                >
                  {s.color === '#ffffff' && <span className="text-black text-[9px] font-bold">W</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#2E2E2E]">
            <label className="flex items-center gap-1.5 text-xs text-[#9C9C9C] cursor-pointer">
              <input
                type="checkbox"
                checked={enableFabricOpt}
                onChange={(e) => setEnableFabricOpt(e.target.checked)}
                className="accent-[#F7941D]"
              />
              <span>{t('studioPage.fabricOptCheck')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   FUNCTIONS DE TRAITEMENT D'IMAGE & ANTI-HALO SUPPRESSION DUAL (NOIR/BLANC)
   ======================================================================== */

function safeBackgroundRemoval(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  refR: number,
  refG: number,
  refB: number,
  toleranceVal: number,
  mode: string = 'auto',
  whiteTolVal: number = 35
) {
  const n = w * h;
  const tolBlack = toleranceVal * 3.2;
  const tolWhite = Math.max(40, whiteTolVal) * 3.8;
  const minWhiteRGB = Math.max(180, 255 - Math.round(whiteTolVal * 0.9));
  const minWhiteLum = Math.max(0.72, 1.0 - (whiteTolVal / 100) * 0.3);

  // 1. Analyze 4 corners to detect background colors in 'auto' mode
  const cornerIndices = [0, (w - 1) * 4, (h - 1) * w * 4, ((h - 1) * w + (w - 1)) * 4];
  let hasBlackCorner = false;
  let hasWhiteCorner = false;

  cornerIndices.forEach((idx) => {
    const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
    if (a < 10) return;
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const lum = (maxC + minC) / 510;
    if (r <= 40 && g <= 40 && b <= 40) hasBlackCorner = true;
    if (r >= 200 && g >= 200 && b >= 200 && lum > 0.80) hasWhiteCorner = true;
  });

  const removeBlack = mode === 'black' || mode === 'both' || (mode === 'auto' && hasBlackCorner);
  const removeWhite = mode === 'white' || mode === 'both' || (mode === 'auto' && hasWhiteCorner);
  const removeCustom = mode === 'custom' || mode === 'picker' || mode === 'click';

  const matchColor = (idx: number) => {
    const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
    if (a === 0) return false;

    // Check Black (RGB 0-40 or Manhattan distance)
    if (removeBlack) {
      if (r <= 40 && g <= 40 && b <= 40) return true;
      if (colorDistManhattan(r, g, b, 0, 0, 0) <= tolBlack) return true;
    }

    // Check White & Off-Whites (#F8F8F8, #F0F0F0, HSL Lum > 82%, low color saturation)
    if (removeWhite) {
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const lum = (maxC + minC) / 510;
      const satDiff = maxC - minC; // Pure/off-whites have low saturation difference

      if (r >= minWhiteRGB && g >= minWhiteRGB && b >= minWhiteRGB && satDiff <= 25) return true;
      if (lum >= minWhiteLum && satDiff <= 30) return true;
      if (colorDistManhattan(r, g, b, 255, 255, 255) <= tolWhite) return true;
    }

    // Check Custom color
    if (removeCustom) {
      if (colorDistManhattan(r, g, b, refR, refG, refB) <= tolBlack) return true;
    }

    return false;
  };

  const bg = new Uint8Array(n);
  const queue = new Int32Array(n);
  let qt = 0;
  let qh = 0;

  // Flood fill initialization strictly from outer border pixels (4 corners & perimeter)
  // This guarantees that white text or white graphics inside the design center are NEVER reached!
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

  let removed = 0;
  for (let i = 0; i < n; i++) {
    if (bg[i] && data[i * 4 + 3] > 0) {
      data[i * 4 + 3] = 0;
      removed++;
    }
  }

  // 2. Post-processing: Anti-aliasing fringe cleanup along perimeter borders
  // Fades out semi-transparent gray/white halos adjacent to removed background
  if (removeWhite || removeBlack) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (data[i * 4 + 3] === 0) continue;

        // Check if adjacent to background
        const isBorder =
          data[(i - 1) * 4 + 3] === 0 ||
          data[(i + 1) * 4 + 3] === 0 ||
          data[(i - w) * 4 + 3] === 0 ||
          data[(i + w) * 4 + 3] === 0;

        if (isBorder) {
          const r = data[i * 4];
          const g = data[i * 4 + 1];
          const b = data[i * 4 + 2];
          const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

          // If white background was removed and edge pixel is a light anti-aliased gray halo
          if (removeWhite && lum > 0.65) {
            const fade = Math.max(0, 1 - (lum - 0.65) / 0.35);
            data[i * 4 + 3] = Math.round(data[i * 4 + 3] * fade);
          }
        }
      }
    }
  }

  return removed;
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