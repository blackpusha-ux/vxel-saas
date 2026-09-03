// ============================================================================
// VXEL VTracer Engine v3.0 — Moteur de vectorisation professionnel
// Pipeline : Pré-traitement → K-Means perceptuel → Marching Squares →
//            Douglas-Peucker → Courbes de Bézier cubiques → SVG HD
// ============================================================================

self.onmessage = function (e) {
  const { imageData, width, height, options } = e.data;
  const startTime = Date.now();

  try {
    const numColors     = Math.min(32, Math.max(2, options.number_of_colors || 16));
    const filterSpeckle = Math.max(0, options.filter_speckle || 4);
    const pathPrecision = Math.max(1, Math.min(8, options.path_precision || 4));
    const turdSize      = Math.max(10, options.turdsize || 100); // Seuil de suppression bruit Potrace
    const pathOmit      = Math.max(2, options.pathomit || 8);     // Seuil omission tracés parasites
    const alphaMax      = options.alphamax !== undefined ? options.alphamax : 1.0;

    // ── Tolérance Douglas-Peucker : plus pathPrecision est haut, plus c'est fin ──
    const dpTolerance = Math.max(0.3, (4.5 - pathPrecision * 0.5) * (alphaMax / 1.0));

    // ── 1. PRÉ-TRAITEMENT ─────────────────────────────────────────────────────
    const raw = new Uint8ClampedArray(imageData.data);

    // 1a. Débruitage 3×3 gaussian léger (réduit les artefacts JPEG)
    const smoothed = gaussianBlur3x3(raw, width, height);

    // 1b. Boost contraste adaptatif (améliore la séparation des couleurs)
    boostContrast(smoothed, width, height, 1.15);

    // ── 2. QUANTISATION COULEURS (K-Means perceptuel LAB-approché) ────────────
    const palette = kMeansPalette(smoothed, width, height, numColors);
    const k = palette.length;

    // ── 3. ASSIGNATION PAR PIXEL ──────────────────────────────────────────────
    // Pour chaque pixel opaque, trouver la couleur de palette la plus proche
    const colorIndex = new Int16Array(width * height).fill(-1);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i4 = (y * width + x) * 4;
        if (smoothed[i4 + 3] < 20) continue; // transparent
        const r = smoothed[i4], g = smoothed[i4 + 1], b = smoothed[i4 + 2];
        colorIndex[y * width + x] = nearestPalette(r, g, b, palette);
      }
    }

    // ── 4. EXTRACTION DE CONTOURS + BÉZIER PAR COUCHE COULEUR ─────────────────
    const paths = [];
    let totalPathCount = 0;

    for (let c = 0; c < k; c++) {
      // Masque binaire pour cette couleur
      const mask = new Uint8Array(width * height);
      let pixCount = 0;
      for (let i = 0; i < width * height; i++) {
        if (colorIndex[i] === c) { mask[i] = 1; pixCount++; }
      }

      // Ignorer les couches trop petites (filtre speckle & pathomit)
      const minPixels = Math.max(turdSize, Math.max(pathOmit * pathOmit, filterSpeckle * filterSpeckle * 2));
      if (pixCount < minPixels) continue;

      // Marching squares → liste de contours (polygones)
      const contours = marchingSquares(mask, width, height);

      const colorHex = rgbToHex(palette[c][0], palette[c][1], palette[c][2]);

      for (const contour of contours) {
        if (contour.length < 4) continue;

        // Filtrer les minuscules contours (bruit / turdsize)
        if (contourArea(contour) < minPixels) continue;

        // Simplification Douglas-Peucker
        const simplified = douglasPeucker(contour, dpTolerance);
        if (simplified.length < 3) continue;

        // Convertir en courbes de Bézier lissées (Catmull-Rom → cubique)
        const pathD = pointsToSmoothBezier(simplified);
        if (!pathD) continue;

        paths.push(`<path d="${pathD}" fill="${colorHex}" fill-rule="evenodd"/>`);
        totalPathCount++;
      }
    }

    // ── 5. ASSEMBLAGE SVG FINAL ───────────────────────────────────────────────
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<!-- Vectorized by VXEL VTracer Engine v3 -->
${paths.join('\n')}
</svg>`;

    const durationMs = Date.now() - startTime;

    self.postMessage({
      success: true,
      svg,
      stats: { colorCount: k, pathCount: totalPathCount, durationMs, engine: 'VTracer Pro v3' },
    });

  } catch (err) {
    self.postMessage({ success: false, error: err.message || 'Erreur vectorisation' });
  }
};

// ============================================================================
// HELPERS
// ============================================================================

/** Flou gaussien 3×3 pour réduire le bruit JPEG avant quantisation */
function gaussianBlur3x3(data, w, h) {
  const out = new Uint8ClampedArray(data);
  const kernel = [1,2,1, 2,4,2, 1,2,1]; // ÷ 16
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i4 = (y * w + x) * 4;
      if (data[i4 + 3] < 20) continue;
      for (let ch = 0; ch < 3; ch++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ni = ((y + ky) * w + (x + kx)) * 4;
            sum += data[ni + ch] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        out[i4 + ch] = Math.min(255, sum >> 4); // ÷ 16
      }
    }
  }
  return out;
}

/** Boost contraste par courbe S légère */
function boostContrast(data, w, h, factor) {
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const v = (i / 255 - 0.5) * factor + 0.5;
    lut[i] = Math.min(255, Math.max(0, Math.round(v * 255)));
  }
  for (let i = 0; i < w * h * 4; i += 4) {
    if (data[i + 3] < 20) continue;
    data[i]     = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }
}

/** Distance couleur perceptuelle (pondération ITU-R BT.709) */
function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return 0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db;
}

/** Trouve l'index palette le plus proche pour un pixel RGB */
function nearestPalette(r, g, b, palette) {
  let minD = Infinity, best = 0;
  for (let i = 0; i < palette.length; i++) {
    const d = colorDist(r, g, b, palette[i][0], palette[i][1], palette[i][2]);
    if (d < minD) { minD = d; best = i; }
  }
  return best;
}

/**
 * K-Means amélioré :
 * - Initialisation K-Means++ pour de meilleures couleurs de départ
 * - 10 itérations
 * - Distance perceptuelle
 * - Sous-échantillonnage intelligent
 */
function kMeansPalette(data, w, h, k) {
  // Collecte pixels opaques sous-échantillonnés
  const pixels = [];
  const step = Math.max(1, Math.floor(w * h / 8000));
  for (let i = 0; i < w * h; i += step) {
    const i4 = i * 4;
    if (data[i4 + 3] >= 20) {
      pixels.push([data[i4], data[i4 + 1], data[i4 + 2]]);
    }
  }
  if (pixels.length === 0) return [[0, 0, 0]];

  const n = pixels.length;
  const actualK = Math.min(k, n);

  // K-Means++ initialization
  const palette = [];
  // Premier centre : pixel aléatoire (mais déterministe)
  palette.push([...pixels[Math.floor(n / 3)]]);

  for (let c = 1; c < actualK; c++) {
    // Calcule la distance au centre le plus proche pour chaque pixel
    const dists = pixels.map((p) => {
      let minD = Infinity;
      for (const center of palette) {
        const d = colorDist(p[0], p[1], p[2], center[0], center[1], center[2]);
        if (d < minD) minD = d;
      }
      return minD;
    });
    // Choisit le pixel le plus éloigné de tous les centres existants
    let maxD = 0, bestIdx = 0;
    for (let i = 0; i < dists.length; i++) {
      if (dists[i] > maxD) { maxD = dists[i]; bestIdx = i; }
    }
    palette.push([...pixels[bestIdx]]);
  }

  // 10 itérations K-Means
  for (let iter = 0; iter < 10; iter++) {
    const sums = Array.from({ length: actualK }, () => [0, 0, 0, 0]); // r,g,b,count
    for (const p of pixels) {
      const c = nearestPalette(p[0], p[1], p[2], palette);
      sums[c][0] += p[0]; sums[c][1] += p[1]; sums[c][2] += p[2]; sums[c][3]++;
    }
    let changed = false;
    for (let c = 0; c < actualK; c++) {
      if (sums[c][3] === 0) continue;
      const nr = Math.round(sums[c][0] / sums[c][3]);
      const ng = Math.round(sums[c][1] / sums[c][3]);
      const nb = Math.round(sums[c][2] / sums[c][3]);
      if (nr !== palette[c][0] || ng !== palette[c][1] || nb !== palette[c][2]) changed = true;
      palette[c] = [nr, ng, nb];
    }
    if (!changed) break; // convergence anticipée
  }

  return palette;
}

/**
 * Marching Squares simplifié — extrait les contours d'un masque binaire.
 * Retourne un tableau de polygones (chaque polygone = tableau de [x, y]).
 */
function marchingSquares(mask, w, h) {
  const visited = new Uint8Array(w * h);
  const contours = [];

  // Directions de marche (8-connexité clockwise)
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, -1, -1, -1, 0, 1, 1, 1];

  for (let sy = 0; sy < h; sy++) {
    for (let sx = 0; sx < w; sx++) {
      const si = sy * w + sx;
      if (!mask[si] || visited[si]) continue;

      // Vérifie que c'est un pixel de bord (au moins un voisin vide)
      let isBorder = false;
      for (let d = 0; d < 4; d++) {
        const nx = sx + [1,-1,0,0][d], ny = sy + [0,0,1,-1][d];
        if (nx < 0 || nx >= w || ny < 0 || ny >= h || !mask[ny * w + nx]) {
          isBorder = true; break;
        }
      }
      if (!isBorder) continue;

      // Trace le contour par border following (Moore neighborhood)
      const contour = [];
      let cx = sx, cy = sy;
      let dir = 0; // direction de départ

      // Trouve la première direction valide
      for (let d = 0; d < 8; d++) {
        const nx = cx + dx[d], ny = cy + dy[d];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && mask[ny * w + nx]) {
          dir = d; break;
        }
      }

      const maxSteps = w * h;
      let steps = 0;

      do {
        contour.push([cx, cy]);
        visited[cy * w + cx] = 1;

        // Cherche le prochain pixel de bord dans les 8 directions en partant de (dir+6)%8
        let found = false;
        for (let dd = 0; dd < 8; dd++) {
          const nd = (dir + 6 + dd) % 8;
          const nx = cx + dx[nd], ny = cy + dy[nd];
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && mask[ny * w + nx]) {
            cx = nx; cy = ny; dir = nd;
            found = true; break;
          }
        }
        if (!found) break;
        steps++;
      } while ((cx !== sx || cy !== sy) && steps < maxSteps);

      if (contour.length >= 4) {
        contours.push(contour);
      }
    }
  }

  return contours;
}

/** Calcule l'aire approximative d'un contour (formule du lacet de chaussure) */
function contourArea(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i][0] * pts[j][1];
    area -= pts[j][0] * pts[i][1];
  }
  return Math.abs(area) / 2;
}

/**
 * Algorithme de simplification Douglas-Peucker.
 * Réduit le nombre de points d'un polygone tout en gardant la forme globale.
 */
function douglasPeucker(points, tolerance) {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = pointToSegmentDist(points[i], points[0], points[end]);
    if (d > maxDist) { maxDist = d; maxIdx = i; }
  }

  if (maxDist > tolerance) {
    const left  = douglasPeucker(points.slice(0, maxIdx + 1), tolerance);
    const right = douglasPeucker(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[end]];
}

/** Distance d'un point à un segment */
function pointToSegmentDist([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Convertit une liste de points en path SVG avec courbes de Bézier cubiques lissées.
 * Utilise l'approche Catmull-Rom → cubique pour des transitions fluides.
 */
function pointsToSmoothBezier(pts) {
  if (pts.length < 2) return null;

  const n = pts.length;
  // Ferme le polygone en dupliquant les extrémités
  const p = [...pts, pts[0], pts[1]]; // pour Catmull-Rom fermé

  const tension = 0.4; // 0 = linéaire, 0.5 = Catmull-Rom standard
  let d = `M ${fmt(pts[0][0])} ${fmt(pts[0][1])}`;

  for (let i = 0; i < n; i++) {
    const p0 = p[i], p1 = p[(i + 1) % (n + 2)], p2 = p[(i + 2) % (n + 2)];
    const prev = i === 0 ? pts[n - 1] : pts[i - 1];

    // Calcule les points de contrôle Catmull-Rom → Bézier cubique
    const cp1x = p1[0] - (p2[0] - prev[0]) * tension / 2;
    const cp1y = p1[1] - (p2[1] - prev[1]) * tension / 2;
    const cp2x = p1[0] + (p2[0] - p0[0]) * tension / 2;
    const cp2y = p1[1] + (p2[1] - p0[1]) * tension / 2;

    d += ` C ${fmt(cp1x)} ${fmt(cp1y)}, ${fmt(cp2x)} ${fmt(cp2y)}, ${fmt(p1[0])} ${fmt(p1[1])}`;
  }

  d += ' Z';
  return d;
}

function fmt(n) { return Math.round(n * 10) / 10; }

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
}
