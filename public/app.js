// =====================================================
// VXEL - MOTEUR DE TRAITEMENT D'IMAGE (app.js)
// =====================================================
const $ = id => document.getElementById(id);
const canvas = $('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let originalImage = null, clickedBgColor = null, processedImageData = null;
let currentFabricColor = '#000000', currentBgView = 'fabric', awaitingClickColor = false;

function showToast(msg, type = 'info', duration = 3000) {
    const t = $('toast'); t.textContent = msg; t.classList.remove('hidden');
    t.style.borderColor = type === 'error' ? '#ef4444' : type === 'warn' ? '#f59e0b' : '#F7941D';
    clearTimeout(showToast._tid); showToast._tid = setTimeout(() => t.classList.add('hidden'), duration);
}
function luminance(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }
function colorDistManhattan(r1, g1, b1, r2, g2, b2) { return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2); }
function hexToRgb(hex) { hex = hex.replace('#', ''); return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) }; }

function setFabricColor(hex) {
    currentFabricColor = hex; $('fabricColor').value = hex; $('fabricHex').value = hex;
    document.querySelectorAll('.fabric-swatch').forEach(sw => sw.classList.toggle('active-swatch', sw.dataset.color === hex));
    const rgb = hexToRgb(hex), lum = luminance(rgb.r, rgb.g, rgb.b);
    const infoBox = $('fabricModeInfo'), fabricInfo = $('fabricInfo');
    if (lum < 60) infoBox.innerHTML = '<b>🖤 Tissu foncé :</b> laissez Luma Off, la White Base suffit';
    else if (lum > 200) infoBox.innerHTML = '<b>⚪ Tissu clair :</b> Luma "Blancs" possible';
    else infoBox.innerHTML = '<b>🎨 Tissu coloré :</b> design complet avec White Base';
    const as = document.querySelector('.fabric-swatch.active-swatch');
    fabricInfo.innerText = `👕 ${as ? as.dataset.name : 'Perso'}`;
    if ($('enableFabricOpt').checked) autoAdjustLuma(lum);
    if (currentBgView === 'fabric') $('previewContainer').style.backgroundColor = hex;
    processImage();
}
function autoAdjustLuma(lum) {
    if ($('lumaMode').value === 'auto') {
        if (lum > 200) $('lumaMode').value = 'light'; else $('lumaMode').value = 'off';
        showToast('⚙️ Auto : Luma ajusté', 'warn', 2200);
    }
}

document.querySelectorAll('.fabric-swatch').forEach(sw => sw.addEventListener('click', () => setFabricColor(sw.dataset.color)));
$('fabricColor').addEventListener('input', e => setFabricColor(e.target.value));
$('fabricHex').addEventListener('change', e => { const v = e.target.value.trim(); if (/^#[0-9a-fA-F]{6}$/.test(v)) setFabricColor(v); });
$('enableFabricOpt').addEventListener('change', () => { if ($('enableFabricOpt').checked) { const rgb = hexToRgb(currentFabricColor); autoAdjustLuma(luminance(rgb.r, rgb.g, rgb.b)); } processImage(); });
$('lumaMode').addEventListener('change', () => { if ($('lumaMode').value === 'dark') showToast('⚠️ Mode Noirs agressif', 'warn', 3500); processImage(); });
$('lumaS').addEventListener('input', () => { $('valLumaS').innerText = $('lumaS').value; processImage(); });
$('lumaT').addEventListener('input', () => {
    $('valLumaT').innerText = $('lumaT').value;
    if ($('lumaMode').value === 'auto' && $('enableFabricOpt').checked) { $('enableFabricOpt').checked = false; showToast('⚙️ Auto-optim désactivée', 'warn', 2500); }
    if (!awaitingClickColor) processImage();
});

$('imageLoader').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { const img = new Image();
        img.onload = () => { originalImage = img; clickedBgColor = null; $('placeholderText').style.display = 'none';
            if ($('bgRemovalMode').value === 'click') showRawPreviewForPicking(); else processImage();
            $('downloadBtn').disabled = false; $('downloadWhiteBtn').disabled = false; };
        img.src = ev.target.result; };
    reader.readAsDataURL(file);
});
$('bgRemovalMode').addEventListener('change', () => {
    const mode = $('bgRemovalMode').value;
    $('manualColorContainer').classList.toggle('hidden', mode !== 'picker');
    $('clickHint').classList.toggle('hidden', mode !== 'click');
    if (mode !== 'click') { clickedBgColor = null; awaitingClickColor = false; }
    if (mode === 'click' && !clickedBgColor) showRawPreviewForPicking(); else { awaitingClickColor = false; processImage(); }
});
$('enableCrop').addEventListener('change', () => {
    $('dimensionControls').style.opacity = $('enableCrop').checked ? '1' : '0.5';
    $('dimensionControls').style.pointerEvents = $('enableCrop').checked ? 'auto' : 'none';
    $('fitMode').parentElement.style.opacity = $('enableCrop').checked ? '1' : '0.5';
    processImage();
});
function syncFinishControls() {
    $('dotSize').style.opacity = $('enableHalftone').checked ? '1' : '0.35';
    $('grungeIntensity').style.opacity = $('enableGrunge').checked ? '1' : '0.35';
}
['enableHalftone', 'enableGrunge', 'enableFillHoles', 'enableDefringe', 'enableBoost'].forEach(id => $(id).addEventListener('change', () => { syncFinishControls(); processImage(); }));

function showRawPreviewForPicking() {
    if (!originalImage) return; awaitingClickColor = true;
    const scale = parseInt($('scaleFactor').value), w = originalImage.width * scale, h = originalImage.height * scale;
    canvas.width = w; canvas.height = h;
    const m = canvas.getContext('2d'); m.imageSmoothingEnabled = scale > 1; m.imageSmoothingQuality = 'high';
    m.clearRect(0, 0, w, h); m.drawImage(originalImage, 0, 0, w, h);
    $('dimensionInfo').innerText = `📐 Pipette active`;
}
canvas.addEventListener('click', e => {
    if ($('bgRemovalMode').value !== 'click' || !originalImage || !awaitingClickColor) return;
    const rect = canvas.getBoundingClientRect(), sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((e.clientX - rect.left) * sx)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((e.clientY - rect.top) * sy)));
    const p = ctx.getImageData(x, y, 1, 1).data;
    if (p[3] < 10) { showToast('⚠️ Zone transparente', 'warn'); return; }
    clickedBgColor = { r: p[0], g: p[1], b: p[2] }; awaitingClickColor = false;
    showToast(`🎯 rgb(${p[0]},${p[1]},${p[2]})`, 'success'); processImage();
});

['scaleFactor', 'bgTolerance', 'erodePixels', 'dotSize', 'grungeIntensity', 'targetWidthCm', 'targetHeightCm', 'customBgColor', 'fitMode', 'fillHolesSize', 'defringePx', 'boostSat', 'boostCon'].forEach(id => {
    $(id).addEventListener('input', () => { if (!awaitingClickColor) processImage(); });
});
[['bgTolerance', 'valTolerance'], ['erodePixels', 'valErode'], ['dotSize', 'valDotSize'], ['grungeIntensity', 'valGrunge'], ['fillHolesSize', 'valFillHoles'], ['defringePx', 'valDefringe'], ['boostSat', 'valBoostSat'], ['boostCon', 'valBoostCon']].forEach(([s, v]) => $(s).addEventListener('input', () => $(v).innerText = $(s).value));
$('scaleFactor').addEventListener('change', () => { $('valScale').innerText = $('scaleFactor').value + 'x'; });

function setBg(type) {
    currentBgView = type; const c = $('previewContainer'), ch = $('checkerBg');
    if (type === 'checker') { c.style.backgroundColor = '#222'; ch.style.display = 'block'; ch.style.opacity = '0.2'; }
    else if (type === 'fabric') { c.style.backgroundColor = currentFabricColor; ch.style.display = 'none'; }
    else if (type === 'black') { c.style.backgroundColor = '#000'; ch.style.display = 'none'; }
    else if (type === 'white') { c.style.backgroundColor = '#fff'; ch.style.display = 'none'; }
}

// =====================================================
// PIPELINE DE TRAITEMENT (AVEC OVERLAY DE CHARGEMENT)
// =====================================================
function processImage() {
    if (!originalImage) return;

    // === BONUS PRO : Afficher l'overlay de chargement ===
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    // On décale le traitement lourd de 50ms pour laisser au navigateur le temps d'afficher l'overlay
    setTimeout(() => {
        const t0 = performance.now();
        const scale = parseInt($('scaleFactor').value);
        const targetW = originalImage.width * scale, targetH = originalImage.height * scale;
        const tempCanvas = document.createElement('canvas'); tempCanvas.width = targetW; tempCanvas.height = targetH;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = scale > 1; tempCtx.imageSmoothingQuality = 'high';
        tempCtx.drawImage(originalImage, 0, 0, targetW, targetH);
        const imgData = tempCanvas.getImageData(0, 0, targetW, targetH), data = imgData.data;
        const initialOpaque = countOpaque(data);
        const mode = $('bgRemovalMode').value;
        let refR = 0, refG = 0, refB = 0;
        if (mode === 'auto') {
            const samples = [], ss = 4, corners = [[0, 0], [targetW - ss, 0], [0, targetH - ss], [targetW - ss, targetH - ss]];
            for (const [cx, cy] of corners) for (let dy = 0; dy < ss; dy++) for (let dx = 0; dx < ss; dx++) { const idx = ((cy + dy) * targetW + (cx + dx)) * 4; samples.push([data[idx], data[idx + 1], data[idx + 2]]); }
            refR = median(samples.map(s => s[0])); refG = median(samples.map(s => s[1])); refB = median(samples.map(s => s[2]));
        } else if (mode === 'picker') { const hex = $('customBgColor').value; refR = parseInt(hex.slice(1, 3), 16); refG = parseInt(hex.slice(3, 5), 16); refB = parseInt(hex.slice(5, 7), 16); }
        else if (mode === 'click') { if (clickedBgColor) { refR = clickedBgColor.r; refG = clickedBgColor.g; refB = clickedBgColor.b; } else { refR = data[0]; refG = data[1]; refB = data[2]; } }

        let removedCount = 0;
        if (mode !== 'none') removedCount = safeBackgroundRemoval(data, targetW, targetH, refR, refG, refB);
        const erodeRadius = parseInt($('erodePixels').value) * scale;
        if (erodeRadius > 0) applyErosion(data, targetW, targetH, erodeRadius);

        if ($('enableFillHoles').checked) fillSmallHoles(data, targetW, targetH, parseInt($('fillHolesSize').value));
        if ($('enableDefringe').checked) defringeIsolated(data, targetW, targetH, parseInt($('defringePx').value));

        applyAdaptiveLumaKey(data, targetW, targetH);

        if ($('enableGrunge').checked) applyGrunge(data, targetW, targetH, parseInt($('grungeIntensity').value) / 100);
        if ($('enableHalftone').checked) applyHalftone(data, targetW, targetH, parseInt($('dotSize').value) * scale);

        if ($('enableBoost').checked) boostColors(data, targetW, targetH, parseInt($('boostSat').value) / 100, parseInt($('boostCon').value) / 100);

        tempCtx.putImageData(imgData, 0, 0);

        let cropBox = null;
        if ($('enableCrop').checked) cropBox = findBoundingBox(data, targetW, targetH);
        let finalCanvas = tempCanvas;
        if (cropBox) { const cd = tempCtx.getImageData(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
            finalCanvas = document.createElement('canvas'); finalCanvas.width = cropBox.w; finalCanvas.height = cropBox.h;
            finalCanvas.getContext('2d').putImageData(cd, 0, 0); }

        let outputCanvas = finalCanvas;
        if ($('enableCrop').checked) {
            const tW_px = Math.round(parseFloat($('targetWidthCm').value) * (300 / 2.54));
            const tH_px = Math.round(parseFloat($('targetHeightCm').value) * (300 / 2.54));
            const ratio = Math.min(tW_px / finalCanvas.width, tH_px / finalCanvas.height);
            if ($('fitMode').value === 'tight') {
                const outW = Math.max(1, Math.round(finalCanvas.width * ratio)), outH = Math.max(1, Math.round(finalCanvas.height * ratio));
                const out = document.createElement('canvas'); out.width = outW; out.height = outH;
                const o = out.getContext('2d'); o.imageSmoothingEnabled = true; o.imageSmoothingQuality = 'high';
                o.drawImage(finalCanvas, 0, 0, outW, outH); outputCanvas = out;
            } else {
                const out = document.createElement('canvas'); out.width = tW_px; out.height = tH_px;
                const o = out.getContext('2d'); o.imageSmoothingEnabled = true; o.imageSmoothingQuality = 'high';
                const sx = (tW_px - finalCanvas.width * ratio) / 2, sy = (tH_px - finalCanvas.height * ratio) / 2;
                o.drawImage(finalCanvas, 0, 0, finalCanvas.width, finalCanvas.height, sx, sy, finalCanvas.width * ratio, finalCanvas.height * ratio); outputCanvas = out;
            }
        }

        canvas.width = outputCanvas.width; canvas.height = outputCanvas.height;
        const mc = canvas.getContext('2d'); mc.clearRect(0, 0, canvas.width, canvas.height); mc.drawImage(outputCanvas, 0, 0);
        processedImageData = outputCanvas;
        const realW = (outputCanvas.width / 300) * 2.54, realH = (outputCanvas.height / 300) * 2.54;
        $('dimensionInfo').innerText = `📐 ${realW.toFixed(1)}×${realH.toFixed(1)}cm · ${outputCanvas.width}×${outputCanvas.height}px`;
        $('perfInfo').innerText = `⚡ ${(performance.now() - t0).toFixed(0)}ms`;
        if (mode !== 'none') { $('debugInfo').classList.remove('hidden'); $('debugText').innerText = `Fond rgb(${refR.toFixed(0)},${refG.toFixed(0)},${refB.toFixed(0)}) · Suppr: ${removedCount.toLocaleString()}/${initialOpaque.toLocaleString()}`; }
        else $('debugInfo').classList.add('hidden');

        // === BONUS PRO : Masquer l'overlay à la fin du traitement ===
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    }, 50);
}

function countOpaque(data) { let c = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > 0) c++; return c; }

function safeBackgroundRemoval(data, w, h, refR, refG, refB) {
    const tolerance = parseInt($('bgTolerance').value) * 3, n = w * h;
    const matchColor = idx => colorDistManhattan(data[idx], data[idx + 1], data[idx + 2], refR, refG, refB) <= tolerance;
    const bg = new Uint8Array(n), queue = new Int32Array(n); let qt = 0, qh = 0;
    for (let x = 0; x < w; x++) { const p1 = x; if (matchColor(p1 * 4) && !bg[p1]) { bg[p1] = 1; queue[qt++] = p1; } const p2 = (h - 1) * w + x; if (matchColor(p2 * 4) && !bg[p2]) { bg[p2] = 1; queue[qt++] = p2; } }
    for (let y = 0; y < h; y++) { const p3 = y * w; if (matchColor(p3 * 4) && !bg[p3]) { bg[p3] = 1; queue[qt++] = p3; } const p4 = y * w + (w - 1); if (matchColor(p4 * 4) && !bg[p4]) { bg[p4] = 1; queue[qt++] = p4; } }
    while (qh < qt) { const pos = queue[qh++], x = pos % w, y = Math.floor(pos / w); const nb = [];
        if (x > 0) nb.push(pos - 1); if (x < w - 1) nb.push(pos + 1); if (y > 0) nb.push(pos - w); if (y < h - 1) nb.push(pos + w);
        for (const np of nb) if (!bg[np] && matchColor(np * 4)) { bg[np] = 1; queue[qt++] = np; } }
    let r = 0; for (let i = 0; i < n; i++) if (bg[i] && data[i * 4 + 3] > 0) { data[i * 4 + 3] = 0; r++; } return r;
}

function fillSmallHoles(data, w, h, maxSize) {
    const n = w * h, trans = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (data[i * 4 + 3] < 128) trans[i] = 1;
    const comp = new Int32Array(n).fill(-1), sizes = []; let nextId = 0; const stack = new Int32Array(n);
    for (let i = 0; i < n; i++) { if (!trans[i] || comp[i] >= 0) continue; let sz = 0, sp = 0; stack[sp++] = i; comp[i] = nextId;
        while (sp > 0) { const p = stack[--sp]; sz++; const x = p % w, y = (p / w) | 0; const nb = [];
            if (x > 0) nb.push(p - 1); if (x < w - 1) nb.push(p + 1); if (y > 0) nb.push(p - w); if (y < h - 1) nb.push(p + w);
            for (const q of nb) if (trans[q] && comp[q] < 0) { comp[q] = nextId; stack[sp++] = q; } }
        sizes[nextId] = sz; nextId++; }
    const touche = new Uint8Array(nextId);
    for (let i = 0; i < n; i++) if (comp[i] >= 0) { const x = i % w, y = (i / w) | 0; if (x === 0 || x === w - 1 || y === 0 || y === h - 1) touche[comp[i]] = 1; }
    for (let i = 0; i < n; i++) if (trans[i] && comp[i] >= 0 && !touche[comp[i]] && sizes[comp[i]] <= maxSize * maxSize) data[i * 4 + 3] = 255;
}

function defringeIsolated(data, w, h, radius) {
    const n = w * h, opaque = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (data[i * 4 + 3] >= 128) opaque[i] = 1;
    const r2 = radius * radius;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!opaque[i]) continue; let vo = 0;
        for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) { if (dx * dx + dy * dy > r2) continue;
            const nx = x + dx, ny = y + dy; if (nx >= 0 && nx < w && ny >= 0 && ny < h && opaque[ny * w + nx]) vo++; }
        if (vo < 3) data[i * 4 + 3] = 0; }
}

function boostColors(data, w, h, satMul, conMul) {
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        data[i + 3] = 255;
        let r = (data[i] - 128) * conMul + 128, g = (data[i + 1] - 128) * conMul + 128, b = (data[i + 2] - 128) * conMul + 128;
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * satMul; g = gray + (g - gray) * satMul; b = gray + (b - gray) * satMul;
        data[i] = Math.max(0, Math.min(255, r)); data[i + 1] = Math.max(0, Math.min(255, g)); data[i + 2] = Math.max(0, Math.min(255, b));
    }
}

function localVariance(data, w, h) {
    const n = w * h, lum = new Float32Array(n);
    for (let i = 0; i < n; i++) { const p = i * 4; lum[i] = luminance(data[p], data[p + 1], data[p + 2]); }
    const out = new Float32Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, s2 = 0, c = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) { const v = lum[ny * w + nx]; s += v; s2 += v * v; c++; } }
        const m = s / c; out[y * w + x] = Math.max(0, s2 / c - m * m); }
    return out;
}
function applyAdaptiveLumaKey(data, w, h) {
    const mode = $('lumaMode').value; if (mode === 'off') return;
    const threshold = parseInt($('lumaT').value), softness = parseInt($('lumaS').value);
    let eff = mode;
    if (mode === 'auto') { const frgb = hexToRgb(currentFabricColor), fl = luminance(frgb.r, frgb.g, frgb.b); if (fl > 200) eff = 'light'; else return; }
    const EPS = 0.01, VAR_FLAT = 250;
    let vari = null; if (eff === 'soft') vari = localVariance(data, w, h);
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const lum = luminance(data[i], data[i + 1], data[i + 2]), px = i / 4;
        if (eff === 'soft' && vari[px] > VAR_FLAT) continue;
        let f;
        if (eff === 'dark' || eff === 'soft') f = Math.max(0, Math.min(1, (lum - threshold) / Math.max(1, softness)));
        else f = Math.max(0, Math.min(1, ((255 - lum) - (255 - threshold)) / Math.max(1, softness)));
        if (f <= EPS) { data[i + 3] = 0; continue; }
        if (f < 1) { const fSafe = Math.max(f, EPS);
            if (eff === 'dark' || eff === 'soft') { data[i] = Math.min(255, data[i] / fSafe); data[i + 1] = Math.min(255, data[i + 1] / fSafe); data[i + 2] = Math.min(255, data[i + 2] / fSafe); }
            else { data[i] = Math.max(0, Math.min(255, (data[i] - 255 * (1 - f)) / fSafe)); data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 255 * (1 - f)) / fSafe)); data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 255 * (1 - f)) / fSafe)); }
            data[i + 3] = Math.round(data[i + 3] * f); }
    }
}

function applyErosion(data, w, h, radius) {
    const n = w * h, dist = new Float32Array(n), DIAG = Math.SQRT2;
    for (let i = 0; i < n; i++) dist[i] = data[i * 4 + 3] === 0 ? 0 : 999;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (dist[i] === 0) continue; let d = dist[i];
        if (x > 0) d = Math.min(d, dist[i - 1] + 1); if (y > 0) d = Math.min(d, dist[i - w] + 1);
        if (x > 0 && y > 0) d = Math.min(d, dist[i - w - 1] + DIAG); if (x < w - 1 && y > 0) d = Math.min(d, dist[i - w + 1] + DIAG); dist[i] = d; }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { const i = y * w + x; let d = dist[i];
        if (x < w - 1) d = Math.min(d, dist[i + 1] + 1); if (y < h - 1) d = Math.min(d, dist[i + w] + 1);
        if (x < w - 1 && y < h - 1) d = Math.min(d, dist[i + w + 1] + DIAG); if (x > 0 && y < h - 1) d = Math.min(d, dist[i + w - 1] + DIAG); dist[i] = d; }
    for (let i = 0; i < n; i++) if (dist[i] <= radius) data[i * 4 + 3] = 0;
}
function applyGrunge(data, w, h, intensity) { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const idx = (y * w + x) * 4; if (data[idx + 3] > 0) { const noise = Math.abs((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1); if (noise < intensity * 0.25) data[idx + 3] = 0; } } }
function applyHalftone(data, w, h, dotSize) {
    const halfStep = dotSize / 2;
    for (let y = 0; y < h; y += dotSize) for (let x = 0; x < w; x += dotSize) { let totalLum = 0, count = 0;
        for (let dy = 0; dy < dotSize && (y + dy) < h; dy++) for (let dx = 0; dx < dotSize && (x + dx) < w; dx++) { const pIdx = ((y + dy) * w + (x + dx)) * 4; if (data[pIdx + 3] > 10) { totalLum += luminance(data[pIdx], data[pIdx + 1], data[pIdx + 2]) / 255; count++; } }
        if (count > dotSize * dotSize * 0.2) { const avgLum = totalLum / count, radius = halfStep * (1 - avgLum);
            for (let dy = 0; dy < dotSize && (y + dy) < h; dy++) for (let dx = 0; dx < dotSize && (x + dx) < w; dx++) data[((y + dy) * w + (x + dx)) * 4 + 3] = 0;
            const cx = x + halfStep, cy = y + halfStep;
            for (let dy = -halfStep; dy <= halfStep; dy++) for (let dx = -halfStep; dx <= halfStep; dx++) { const nx = Math.round(cx + dx), ny = Math.round(cy + dy);
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && dx * dx + dy * dy <= radius * radius) data[(ny * w + nx) * 4 + 3] = 255; } } }
}
function findBoundingBox(data, w, h) { let minX = w, minY = h, maxX = 0, maxY = 0, found = false;
    for (let y = 0; y < h; y++) { const row = y * w; for (let x = 0; x < w; x++) if (data[(row + x) * 4 + 3] > 10) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; found = true; } }
    return found ? { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } : null; }
function median(arr) { const s = arr.slice().sort((a, b) => a - b); const mid = Math.floor(s.length / 2); return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2; }

// =====================================================
// EXPORTS (VERROUILLES PAR CREDIT)
// =====================================================
$('downloadBtn').addEventListener('click', async () => {
    if (!processedImageData) return;
    if (typeof consumeCreditBeforeDownload === 'function') {
        if (!(await consumeCreditBeforeDownload())) return;
    }
    const link = document.createElement('a');
    link.download = `vxel-couleur-${$('targetWidthCm').value}x${$('targetHeightCm').value}cm.png`;
    link.href = processedImageData.toDataURL('image/png'); link.click();
    showToast('📥 PNG couleur téléchargé', 'success');
});

$('downloadWhiteBtn').addEventListener('click', async () => {
    if (!processedImageData) return;
    if (typeof consumeCreditBeforeDownload === 'function') {
        if (!(await consumeCreditBeforeDownload())) return;
    }
    const w = processedImageData.width, h = processedImageData.height;
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h; tmp.getContext('2d').drawImage(processedImageData, 0, 0);
    const srcData = tmp.getContext('2d').getImageData(0, 0, w, h).data;
    const whiteData = new ImageData(new Uint8ClampedArray(w * h * 4), w, h), dst = whiteData.data;
    for (let i = 0; i < srcData.length; i += 4) if (srcData[i + 3] > 20) { dst[i] = 255; dst[i + 1] = 255; dst[i + 2] = 255; dst[i + 3] = 255; }
    const expand = 3, mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) mask[i] = dst[i * 4 + 3] > 0 ? 1 : 0;
    for (let pass = 0; pass < expand; pass++) { const nm = new Uint8Array(mask);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (mask[i]) continue;
            if ((x > 0 && mask[i - 1]) || (x < w - 1 && mask[i + 1]) || (y > 0 && mask[i - w]) || (y < h - 1 && mask[i + w])) nm[i] = 1; } mask.set(nm); }
    for (let i = 0; i < w * h; i++) { if (mask[i]) { dst[i * 4] = 255; dst[i * 4 + 1] = 255; dst[i * 4 + 2] = 255; dst[i * 4 + 3] = 255; } else dst[i * 4 + 3] = 0; }
    const wc = document.createElement('canvas'); wc.width = w; wc.height = h; wc.getContext('2d').putImageData(whiteData, 0, 0);
    const link = document.createElement('a'); link.download = `vxel-white-base-${$('targetWidthCm').value}x${$('targetHeightCm').value}cm.png`; link.href = wc.toDataURL('image/png'); link.click();
    showToast('⚪ White Base téléchargée', 'success');
});

// Initialisation
syncFinishControls();
setFabricColor('#000000');
setBg('fabric');