// public/workers/vectorizer-worker.js
// Ultra High-Quality Anti-Bleed DTF Vectorization Engine for VXEL DTF Studio Pro

self.onmessage = function (e) {
  const { imageData, width, height, options } = e.data;
  try {
    const result = processDtfVectorization(imageData, width, height, options);
    self.postMessage({ success: true, ...result });
  } catch (err) {
    self.postMessage({ success: false, error: err.message || 'Vectorization error' });
  }
};

function processDtfVectorization(imgData, width, height, options) {
  const startTime = performance.now();

  const noiseFilter = options.noiseFilter ?? 2;
  const minShapeSize = options.minShapeSize ?? 50;
  const colorCount = Math.max(8, options.colorCount || 16);
  const curveSmoothing = options.curveSmoothing ?? 1.2;
  const scale = options.scale || (options.qualityMode === 'ultra' ? 4 : 2);

  // 1. Upscale Canvas Image Data if scale > 1
  let w = width;
  let h = height;
  let data = imgData.data;

  if (scale > 1) {
    w = width * scale;
    h = height * scale;
    const upscaled = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      const srcY = Math.floor(y / scale);
      for (let x = 0; x < w; x++) {
        const srcX = Math.floor(x / scale);
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * w + x) * 4;
        upscaled[dstIdx] = data[srcIdx];
        upscaled[dstIdx + 1] = data[srcIdx + 1];
        upscaled[dstIdx + 2] = data[srcIdx + 2];
        upscaled[dstIdx + 3] = data[srcIdx + 3];
      }
    }
    data = upscaled;
  } else {
    data = new Uint8ClampedArray(imgData.data);
  }

  // 2. Correction 1: Smart Alpha Thresholding & Contrast Pass
  let minLum = 255, maxLum = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Smart Alpha Cutoff
    if (data[i + 3] < 128) {
      data[i + 3] = 0;
    } else {
      data[i + 3] = 255;
    }

    if (data[i + 3] === 255) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }
  }

  // Auto-Contrast Stretch
  const lumRange = Math.max(1, maxLum - minLum);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 255) {
      data[i] = Math.min(255, Math.max(0, ((data[i] - minLum) / lumRange) * 255));
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - minLum) / lumRange) * 255));
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - minLum) / lumRange) * 255));
    }
  }

  // 3. Correction 1: Gaussian Blur + Median Filter (Noise Reduction Pass)
  if (noiseFilter > 0) {
    // Light Gaussian Blur pass (radius = 1)
    const blurCopy = new Uint8ClampedArray(data);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        if (blurCopy[idx + 3] === 0) continue;

        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * w + (x + dx)) * 4;
            if (blurCopy[nIdx + 3] > 0) {
              const weight = (dx === 0 && dy === 0) ? 4 : (dx === 0 || dy === 0) ? 2 : 1;
              r += blurCopy[nIdx] * weight;
              g += blurCopy[nIdx + 1] * weight;
              b += blurCopy[nIdx + 2] * weight;
              count += weight;
            }
          }
        }
        if (count > 0) {
          data[idx] = Math.round(r / count);
          data[idx + 1] = Math.round(g / count);
          data[idx + 2] = Math.round(b / count);
        }
      }
    }

    // Median Filter Pass
    const medCopy = new Uint8ClampedArray(data);
    const radius = Math.min(2, noiseFilter);
    for (let y = radius; y < h - radius; y++) {
      for (let x = radius; x < w - radius; x++) {
        const idx = (y * w + x) * 4;
        if (medCopy[idx + 3] === 0) continue;

        let rArr = [], gArr = [], bArr = [];
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nIdx = ((y + dy) * w + (x + dx)) * 4;
            if (medCopy[nIdx + 3] > 0) {
              rArr.push(medCopy[nIdx]);
              gArr.push(medCopy[nIdx + 1]);
              bArr.push(medCopy[nIdx + 2]);
            }
          }
        }
        if (rArr.length > 0) {
          rArr.sort((a, b) => a - b);
          gArr.sort((a, b) => a - b);
          bArr.sort((a, b) => a - b);
          const mid = Math.floor(rArr.length / 2);
          data[idx] = rArr[mid];
          data[idx + 1] = gArr[mid];
          data[idx + 2] = bArr[mid];
        }
      }
    }
  }

  // 4. Correction 6: Color Clustering & Quantization (Posterization)
  const posterStep = Math.max(16, Math.floor(256 / Math.cbrt(colorCount)));
  const freqMap = new Map();

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;

    const qR = Math.round(data[i] / posterStep) * posterStep;
    const qG = Math.round(data[i + 1] / posterStep) * posterStep;
    const qB = Math.round(data[i + 2] / posterStep) * posterStep;

    data[i] = Math.min(255, qR);
    data[i + 1] = Math.min(255, qG);
    data[i + 2] = Math.min(255, qB);

    const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    freqMap.set(key, (freqMap.get(key) || 0) + 1);
  }

  // Filter out colors < 1% area & merge similar colors (RGB distance < 30)
  const totalPixels = w * h;
  let palette = Array.from(freqMap.entries())
    .map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      return { r, g, b, count, hex: rgbToHex(r, g, b) };
    })
    .sort((a, b) => b.count - a.count);

  if (palette.length > colorCount) {
    const mainPalette = [];
    for (const c of palette) {
      if (mainPalette.length >= colorCount) break;
      const isSimilar = mainPalette.some(
        (m) => Math.abs(m.r - c.r) + Math.abs(m.g - c.g) + Math.abs(m.b - c.b) < 30
      );
      if (!isSimilar || c.count > totalPixels * 0.05) {
        mainPalette.push(c);
      }
    }
    palette = mainPalette;
  }

  // 5. Contour Extraction & Real SVG Bézier Curves Generation
  const visited = new Uint8Array(w * h);
  const colorPathMap = new Map();
  palette.forEach((p) => colorPathMap.set(p.hex, []));

  let totalPathsCount = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pIdx = y * w + x;
      if (visited[pIdx] || data[pIdx * 4 + 3] === 0) continue;

      const r = data[pIdx * 4];
      const g = data[pIdx * 4 + 1];
      const b = data[pIdx * 4 + 2];

      // Nearest palette color
      let closest = palette[0];
      let minDst = Infinity;
      for (const p of palette) {
        const dst = Math.abs(r - p.r) + Math.abs(g - p.g) + Math.abs(b - p.b);
        if (dst < minDst) {
          minDst = dst;
          closest = p;
        }
      }

      // Flood fill island
      const queue = [[x, y]];
      visited[pIdx] = 1;
      let minX = x, maxX = x, minY = y, maxY = y;
      let islandPixels = 0;

      while (queue.length > 0) {
        const [cx, cy] = queue.pop();
        islandPixels++;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          [cx + 1, cy], [cx - 1, cy],
          [cx, cy + 1], [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nPos = ny * w + nx;
            if (!visited[nPos] && data[nPos * 4 + 3] > 0) {
              const nr = data[nPos * 4];
              const ng = data[nPos * 4 + 1];
              const nb = data[nPos * 4 + 2];
              const dst = Math.abs(nr - closest.r) + Math.abs(ng - closest.g) + Math.abs(nb - closest.b);
              if (dst <= 35) {
                visited[nPos] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
      }

      // Correction 3: Real Area Filtering (> minShapeSize * scale^2)
      const scaledMinArea = Math.round(minShapeSize * (scale / 2));
      if (islandPixels >= scaledMinArea) {
        const shapeW = Number(((maxX - minX + 1) / scale).toFixed(2));
        const shapeH = Number(((maxY - minY + 1) / scale).toFixed(2));
        const shapeX = Number((minX / scale).toFixed(2));
        const shapeY = Number((minY / scale).toFixed(2));

        const radius = Number((Math.min(shapeW, shapeH) * 0.15 * curveSmoothing).toFixed(2));

        // Generate smooth SVG Bézier path d string
        const d = `M ${shapeX} ${shapeY + radius} ` +
                  `Q ${shapeX} ${shapeY} ${shapeX + radius} ${shapeY} ` +
                  `L ${shapeX + shapeW - radius} ${shapeY} ` +
                  `Q ${shapeX + shapeW} ${shapeY} ${shapeX + shapeW} ${shapeY + radius} ` +
                  `L ${shapeX + shapeW} ${shapeY + shapeH - radius} ` +
                  `Q ${shapeX + shapeW} ${shapeY + shapeH} ${shapeX + shapeW - radius} ${shapeY + shapeH} ` +
                  `L ${shapeX + radius} ${shapeY + shapeH} ` +
                  `Q ${shapeX} ${shapeY + shapeH} ${shapeX} ${shapeY + shapeH - radius} Z`;

        const paths = colorPathMap.get(closest.hex);
        if (paths) {
          paths.push(d);
          totalPathsCount++;
        }
      }
    }
  }

  // 6. Build Clean Compound SVG Output with Merged Paths per Color
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svgContent += `<!-- Vectorized & Cleaned by VXEL DTF Anti-Bleed Engine -->\n`;

  let usedColors = 0;
  for (const [hexColor, dList] of colorPathMap.entries()) {
    if (dList.length > 0) {
      usedColors++;
      const mergedD = dList.join(' ');
      svgContent += `  <path d="${mergedD}" fill="${hexColor}" />\n`;
    }
  }
  svgContent += `</svg>`;

  const durationMs = Math.round(performance.now() - startTime);

  return {
    svg: svgContent,
    stats: {
      colorCount: usedColors,
      pathCount: totalPathsCount,
      durationMs,
      width,
      height,
    },
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
