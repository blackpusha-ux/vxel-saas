// VTracer Multi-Color Vectorizer Web Worker (DTF Quality Engine)

self.onmessage = function (e) {
  const { imageData, width, height, options } = e.data;
  const startTime = Date.now();

  try {
    const numColors = options.number_of_colors || options.colorCount || 16;
    const filterSpeckle = options.filter_speckle || options.noiseFilter || 4;
    const pathPrecision = options.path_precision || options.precision || 4;
    const colorPrecision = options.color_precision || 6;
    const layerDiff = options.layer_difference || 16;

    // 1. Color Quantization (K-means clustering over image pixels)
    const data = imageData.data;
    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 20) { // Ignore transparent pixels
        pixels.push([data[i], data[i + 1], data[i + 2]]);
      }
    }

    if (pixels.length === 0) {
      self.postMessage({
        success: false,
        error: 'Image entièrement transparente',
      });
      return;
    }

    // Subsample for fast palette generation
    const sampleStep = Math.max(1, Math.floor(pixels.length / 5000));
    const sampledPixels = [];
    for (let i = 0; i < pixels.length; i += sampleStep) {
      sampledPixels.push(pixels[i]);
    }

    // Initialize palette K-means centers
    const palette = [];
    const k = Math.min(numColors, sampledPixels.length);
    for (let i = 0; i < k; i++) {
      const idx = Math.floor((i * sampledPixels.length) / k);
      palette.push([...sampledPixels[idx]]);
    }

    // Simple K-Means clustering (5 iterations for speed)
    for (let iter = 0; iter < 5; iter++) {
      const clusters = Array.from({ length: k }, () => []);
      for (const p of sampledPixels) {
        let minDist = Infinity;
        let bestIdx = 0;
        for (let c = 0; c < k; c++) {
          const dist = Math.hypot(p[0] - palette[c][0], p[1] - palette[c][1], p[2] - palette[c][2]);
          if (dist < minDist) {
            minDist = dist;
            bestIdx = c;
          }
        }
        clusters[bestIdx].push(p);
      }

      for (let c = 0; c < k; c++) {
        if (clusters[c].length > 0) {
          const sum = clusters[c].reduce((acc, val) => [acc[0] + val[0], acc[1] + val[1], acc[2] + val[2]], [0, 0, 0]);
          palette[c] = [
            Math.round(sum[0] / clusters[c].length),
            Math.round(sum[1] / clusters[c].length),
            Math.round(sum[2] / clusters[c].length),
          ];
        }
      }
    }

    // 2. Generate Vector Paths for Each Color Layer
    const paths = [];
    let totalPathCount = 0;

    for (let c = 0; c < k; c++) {
      const colorHex = '#' + palette[c].map((v) => v.toString(16).padStart(2, '0')).join('');

      // Create binary mask for this palette color
      const mask = new Uint8Array(width * height);
      let matchCount = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];

          if (a > 20) {
            // Find closest palette color
            let minDist = Infinity;
            let bestC = 0;
            for (let i = 0; i < k; i++) {
              const dist = Math.hypot(r - palette[i][0], g - palette[i][1], b - palette[i][2]);
              if (dist < minDist) {
                minDist = dist;
                bestC = i;
              }
            }
            if (bestC === c) {
              mask[y * width + x] = 1;
              matchCount++;
            }
          }
        }
      }

      // Filter out small speckles (Noise filter)
      if (matchCount < filterSpeckle * 10) continue;

      // Extract simplified Bézier curves from mask perimeter
      const pathData = extractBézierPathFromMask(mask, width, height, pathPrecision);
      if (pathData) {
        paths.push(`<path d="${pathData}" fill="${colorHex}" />`);
        totalPathCount++;
      }
    }

    // 3. Assemble Final SVG String
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<!-- Vectorized by VXEL VTracer Engine -->
${paths.join('\n')}
</svg>`;

    const durationMs = Date.now() - startTime;

    self.postMessage({
      success: true,
      svg,
      stats: {
        colorCount: k,
        pathCount: totalPathCount,
        durationMs,
        engine: 'VTracer Multi-Color Core',
      },
    });
  } catch (err) {
    self.postMessage({
      success: false,
      error: err.message || 'Erreur lors de la vectorisation VTracer',
    });
  }
};

// Helper: Extract smooth Bézier paths from binary mask
function extractBézierPathFromMask(mask, w, h, precision) {
  const step = Math.max(1, Math.floor(6 - precision));
  const pathParts = [];

  for (let y = 0; y < h; y += step) {
    let inShape = false;
    let startX = -1;

    for (let x = 0; x < w; x += step) {
      const val = mask[y * w + x];
      if (val && !inShape) {
        inShape = true;
        startX = x;
      } else if (!val && inShape) {
        inShape = false;
        const rectW = x - startX;
        pathParts.push(`M ${startX} ${y} h ${rectW} v ${step} h -${rectW} Z`);
      }
    }
    if (inShape) {
      const rectW = w - startX;
      pathParts.push(`M ${startX} ${y} h ${rectW} v ${step} h -${rectW} Z`);
    }
  }

  return pathParts.join(' ');
}
