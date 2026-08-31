// public/workers/vectorizer-worker.js
// Off-thread DTF Vectorization Worker for VXEL DTF Studio Pro

// Inline lightweight tracer for Web Worker context to avoid DOM dependencies
function quantizeAndVectorize(imgData, width, height, options) {
  const startTime = performance.now();
  const data = imgData.data;

  const noiseFilter = options.noiseFilter || 1; // 0 to 3
  const minShapeSize = options.minShapeSize || 4; // px²
  const numberofcolors = Math.max(2, Math.min(64, options.colorCount || 16));
  const curveSmoothing = options.curveSmoothing || 1.0;

  // 1. Noise Filter: Median filter pass to reduce DTF edge noise & ink bleeds
  if (noiseFilter > 0) {
    const copy = new Uint8ClampedArray(data);
    const radius = Math.min(3, Math.floor(noiseFilter));
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = (y * width + x) * 4;
        if (copy[idx + 3] === 0) continue; // Keep transparent pixels untouched

        let rArr = [], gArr = [], bArr = [];
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            if (copy[nIdx + 3] > 0) {
              rArr.push(copy[nIdx]);
              gArr.push(copy[nIdx + 1]);
              bArr.push(copy[nIdx + 2]);
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

  // 2. Color Quantization & Color Palette Extract
  const colorMap = new Map();
  const step = Math.max(1, Math.floor(256 / Math.cbrt(numberofcolors)));

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 20) {
      data[i + 3] = 0; // Solid Alpha Cutoff
      continue;
    }
    const qR = Math.round(data[i] / step) * step;
    const qG = Math.round(data[i + 1] / step) * step;
    const qB = Math.round(data[i + 2] / step) * step;
    data[i] = Math.min(255, qR);
    data[i + 1] = Math.min(255, qG);
    data[i + 2] = Math.min(255, qB);

    const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Sort colors by frequency & pick top K
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, numberofcolors)
    .map((entry) => {
      const [r, g, b] = entry[0].split(',').map(Number);
      return { r, g, b, hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}` };
    });

  // 3. Simple Contour Vectorization Pass (Merged Paths per Color)
  const pathsByColor = new Map();
  sortedColors.forEach((c) => pathsByColor.set(c.hex, []));

  const visited = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      if (visited[pIdx] || data[pIdx * 4 + 3] === 0) continue;

      const r = data[pIdx * 4];
      const g = data[pIdx * 4 + 1];
      const b = data[pIdx * 4 + 2];

      // Find closest color in palette
      let minDst = Infinity;
      let closestColor = sortedColors[0];
      for (const c of sortedColors) {
        const dst = Math.abs(r - c.r) + Math.abs(g - c.g) + Math.abs(b - c.b);
        if (dst < minDst) {
          minDst = dst;
          closestColor = c;
        }
      }

      // Flood fill island
      const queue = [[x, y]];
      visited[pIdx] = 1;
      let minX = x, maxX = x, minY = y, maxY = y;
      let pixelCount = 0;

      while (queue.length > 0) {
        const [cx, cy] = queue.pop();
        pixelCount++;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          [cx + 1, cy], [cx - 1, cy],
          [cx, cy + 1], [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nPos = ny * width + nx;
            if (!visited[nPos] && data[nPos * 4 + 3] > 0) {
              const nr = data[nPos * 4];
              const ng = data[nPos * 4 + 1];
              const nb = data[nPos * 4 + 2];
              const dst = Math.abs(nr - closestColor.r) + Math.abs(ng - closestColor.g) + Math.abs(nb - closestColor.b);
              if (dst <= 30) {
                visited[nPos] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
      }

      // Filter out micro-artefacts below minShapeSize
      if (pixelCount >= minShapeSize) {
        const wBox = maxX - minX + 1;
        const hBox = maxY - minY + 1;
        const radius = Math.max(1, Math.round(Math.min(wBox, hBox) / 2));
        const colorPaths = pathsByColor.get(closestColor.hex);
        if (colorPaths) {
          if (wBox <= 3 && hBox <= 3) {
            colorPaths.push(`<rect x="${minX}" y="${minY}" width="${wBox}" height="${hBox}" rx="${curveSmoothing}" />`);
          } else {
            colorPaths.push(`<rect x="${minX}" y="${minY}" width="${wBox}" height="${hBox}" rx="${Math.min(wBox / 4, curveSmoothing * 2)}" />`);
          }
        }
      }
    }
  }

  // 4. Generate Optimized Clean SVG Output
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svgContent += `<!-- Vectorized by VXEL DTF Studio Pro Engine -->\n`;

  let usedColorsCount = 0;
  for (const [hexColor, rects] of pathsByColor.entries()) {
    if (rects.length > 0) {
      usedColorsCount++;
      svgContent += `  <g fill="${hexColor}">\n`;
      svgContent += `    ${rects.join('\n    ')}\n`;
      svgContent += `  </g>\n`;
    }
  }
  svgContent += `</svg>`;

  const durationMs = Math.round(performance.now() - startTime);

  return {
    svg: svgContent,
    stats: {
      colorCount: usedColorsCount,
      durationMs,
      width,
      height,
    },
  };
}

self.onmessage = function (e) {
  const { imageData, width, height, options } = e.data;
  try {
    const result = quantizeAndVectorize(imageData, width, height, options);
    self.postMessage({ success: true, ...result });
  } catch (err) {
    self.postMessage({ success: false, error: err.message || 'Vectorization error' });
  }
};
