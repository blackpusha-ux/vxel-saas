'use client';

import { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import Link from 'next/link';
import { ArrowLeft, Upload, Trash2, Download, Settings, Ruler, Printer, FileText, Image as ImageIcon, Layers, FileCode, Check, X } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';
import { generateDTXFile } from '@/lib/dtf-export';

interface QueueItem {
  src: string;
  w: number;
  h: number;
}

export type PlancheExportFormat = 'PDF' | 'PNG' | 'TIFF' | 'DTX';

export default function DTFPlanchePage() {
  const { t } = useTranslation();
  const [printQueue, setPrintQueue] = useState<QueueItem[]>([]);
  const [tagWidth, setTagWidth] = useState<number>(29);
  const [tagHeight, setTagHeight] = useState<number>(34);
  const [machineWidth, setMachineWidth] = useState<number>(58);
  const [gutterSize, setGutterSize] = useState<number>(10);
  const [previewDimensions, setPreviewDimensions] = useState<string>('—');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Modal State for 4 Export Formats
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<PlancheExportFormat>('PDF');

  // Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setPrintQueue((prev) => [...prev, { src, w: tagWidth, h: tagHeight }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFromQueue = (index: number) => {
    setPrintQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setPrintQueue([]);
  };

  const addToQueue = () => {
    if (printQueue.length === 0) {
      alert(t('planchePage.alertNoImage'));
      return;
    }
    const src = printQueue[printQueue.length - 1].src;
    const newItems: QueueItem[] = Array(5).fill(null).map(() => ({ src, w: tagWidth, h: tagHeight }));
    setPrintQueue((prev) => [...prev, ...newItems]);
  };

  const calculateLayout = () => {
    const gutterCm = gutterSize / 10;
    let currentX_cm = gutterCm;
    let currentY_cm = gutterCm;
    let maxHeightInRow_cm = 0;
    const positions: (QueueItem & { x: number; y: number })[] = [];

    for (let i = 0; i < printQueue.length; i++) {
      const item = printQueue[i];

      if ((currentX_cm + item.w) > (machineWidth - gutterCm)) {
        currentX_cm = gutterCm;
        currentY_cm += maxHeightInRow_cm + gutterCm;
        maxHeightInRow_cm = 0;
      }

      positions.push({ ...item, x: currentX_cm, y: currentY_cm });
      currentX_cm += item.w + gutterCm;
      if (item.h > maxHeightInRow_cm) maxHeightInRow_cm = item.h;
    }

    const realHeightCm = currentY_cm + maxHeightInRow_cm + gutterCm;
    return { positions, realHeightCm };
  };

  // Render on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || printQueue.length === 0) {
      setPreviewDimensions('—');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const layout = calculateLayout();
    const { positions, realHeightCm } = layout;

    const scaleFactor = 500 / machineWidth;
    const canvasW = Math.round(machineWidth * scaleFactor);
    const canvasH = Math.round(realHeightCm * scaleFactor);

    canvas.width = canvasW;
    canvas.height = canvasH;

    setPreviewDimensions(`${machineWidth}cm × ${realHeightCm.toFixed(1)}cm`);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    positions.forEach((pos) => {
      const img = new Image();
      img.onload = () => {
        const drawX = pos.x * scaleFactor;
        const drawY = pos.y * scaleFactor;
        const drawW = pos.w * scaleFactor;
        const drawH = pos.h * scaleFactor;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        ctx.strokeStyle = '#F7941D';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, drawW, drawH);
      };
      img.src = pos.src;
    });
  }, [printQueue, tagWidth, tagHeight, machineWidth, gutterSize]);

  const handleOpenExportModal = () => {
    if (printQueue.length === 0) {
      alert(t('planchePage.alertEmptyQueue'));
      return;
    }
    setShowExportModal(true);
  };

  const handleExecuteExport = () => {
    if (printQueue.length === 0 || !canvasRef.current) return;

    const layout = calculateLayout();
    const { positions, realHeightCm } = layout;
    const canvas = canvasRef.current;

    if (selectedFormat === 'PDF') {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'cm',
        format: [machineWidth, realHeightCm],
      });
      positions.forEach((pos) => {
        doc.addImage(pos.src, 'PNG', pos.x, pos.y, pos.w, pos.h);
      });
      doc.save(`VXEL_Planche_${machineWidth}x${realHeightCm.toFixed(1)}cm.pdf`);
    } else if (selectedFormat === 'PNG') {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `VXEL_Planche_${machineWidth}x${realHeightCm.toFixed(1)}cm.png`;
      a.click();
    } else if (selectedFormat === 'TIFF') {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `VXEL_Planche_${machineWidth}x${realHeightCm.toFixed(1)}cm.tiff`;
      a.click();
    } else if (selectedFormat === 'DTX') {
      // Native DTX v2 Binary Export
      const dtxBytes = generateDTXFile(canvas, {
        widthCm: machineWidth,
        heightCm: realHeightCm,
        dpi: 1440,
        pressTempC: 160,
        pressDurationSec: 15,
      });
      const blob = new Blob([dtxBytes.buffer as ArrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VXEL_Planche_${machineWidth}x${realHeightCm.toFixed(1)}cm.dtx`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] p-3 font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700&display=swap');
        .font-baloo { font-family: 'Baloo 2', cursive; }
        .font-nunito { font-family: 'Nunito', sans-serif; }
        .tb-btn-primary { background: #F7941D; color: #0A0A0A; font-weight: 800; transition: 0.2s; }
        .tb-btn-primary:hover { background: #FFB25A; }
        .tb-input { background: #0A0A0A; border: 1px solid #2E2E2E; color: white; font-size: 12px; }
        .section { background: #161616; border: 1px solid #2E2E2E; border-radius: 8px; padding: 10px; margin-bottom: 10px; }
        .section h3 { font-size: 12px; color: #F7941D; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #2E2E2E; padding-bottom: 4px; font-family: 'Baloo 2', cursive; }
      `}</style>

      {/* Header */}
      <header className="flex items-center justify-between bg-[#161616] border border-[#2E2E2E] rounded-lg px-4 py-2 mb-3">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('common.home')}
          </Link>
          <h1 className="text-xl font-bold text-white font-baloo">VXEL <span className="text-[#F7941D]">Planche</span> <span className="text-xs text-gray-400 font-normal font-nunito">DTF Pro</span></h1>
          <label className="text-xs bg-[#1F1F1F] p-2 rounded border border-[#2E2E2E] text-white flex items-center gap-2 cursor-pointer hover:bg-[#2E2E2E] transition-colors">
            <Upload className="w-4 h-4" />
            {t('planchePage.uploadBtn')}
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
        <div>
          <LanguageCurrencySelector />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[calc(100vh-100px)]">

        {/* Col 1: Prévisualisation */}
        <div className="lg:col-span-7 bg-[#161616] border border-[#2E2E2E] rounded-lg flex flex-col relative overflow-hidden h-[500px] lg:h-auto">
          <div className="absolute top-2 left-2 z-10 bg-black/80 px-3 py-1.5 rounded text-xs border border-[#F7941D] flex items-center gap-2 font-nunito">
            {t('planchePage.visualPreview')}
            <span className="text-[#F7941D] font-mono font-bold ml-1">{previewDimensions}</span>
          </div>
          <div className="flex-1 w-full h-full overflow-auto flex justify-center items-start p-5"
               style={{
                 backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                 backgroundSize: '20px 20px',
                 backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                 backgroundColor: '#fff'
               }}>
            {printQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 h-full text-center">
                <Upload className="w-16 h-16 mb-4 text-[#F7941D] opacity-80 animate-bounce" />
                <p className="text-sm font-bold text-[#0A0A0A] mb-1">{t('planchePage.emptyTitle')}</p>
                <p className="text-xs text-slate-600">{t('planchePage.emptySub')}</p>
              </div>
            ) : (
              <canvas ref={canvasRef} className="shadow-2xl bg-white max-w-full" />
            )}
          </div>
        </div>

        {/* Col 2: Contrôles & Queue */}
        <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto pr-1 font-nunito">

          <div className="section">
            <h3 className="flex items-center gap-2"><Ruler className="w-4 h-4" /> {t('planchePage.tagDimensionsTitle')}</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">{t('planchePage.widthCm')}</label>
                <input type="number" value={tagWidth} onChange={(e) => setTagWidth(parseFloat(e.target.value))} className="tb-input w-full rounded p-2" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">{t('planchePage.heightCm')}</label>
                <input type="number" value={tagHeight} onChange={(e) => setTagHeight(parseFloat(e.target.value))} className="tb-input w-full rounded p-2" />
              </div>
            </div>
            <button onClick={addToQueue} className="w-full tb-btn-primary py-2 rounded text-xs font-bold">{t('planchePage.add5xBtn')}</button>
          </div>

          <div className="section">
            <h3 className="flex items-center gap-2"><Settings className="w-4 h-4" /> {t('planchePage.machineConfigTitle')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 w-24">{t('planchePage.filmWidthLabel')}</label>
                <select value={machineWidth} onChange={(e) => setMachineWidth(parseFloat(e.target.value))} className="tb-input flex-1 rounded p-2">
                  <option value={29}>{t('planchePage.singleFilm')}</option>
                  <option value={58}>{t('planchePage.doubleFilm')}</option>
                  <option value={60}>{t('planchePage.wideFilm')}</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 w-24">{t('planchePage.gutterLabel')}</label>
                <input type="number" value={gutterSize} onChange={(e) => setGutterSize(parseFloat(e.target.value))} className="tb-input flex-1 rounded p-2" />
              </div>
            </div>
          </div>

          <div className="section flex-1 flex flex-col">
            <h3 className="flex items-center gap-2"><Printer className="w-4 h-4" /> {t('planchePage.queueTitle')} ({printQueue.length})</h3>
            <div className="h-40 overflow-y-auto mb-2 text-xs space-y-1 bg-black/20 p-2 rounded border border-[#2E2E2E] flex-1">
              {printQueue.length === 0 ? (
                <div className="text-gray-500 italic text-center mt-10">{t('planchePage.queueEmpty')}</div>
              ) : (
                printQueue.map((item, i) => (
                  <div key={i} className="flex justify-between bg-[#1F1F1F] p-2 rounded border border-[#2E2E2E] items-center">
                    <span className="truncate mr-2">{i+1}. {item.w}x{item.h}cm</span>
                    <button onClick={() => removeFromQueue(i)} className="text-red-500 hover:text-white font-bold px-2">×</button>
                  </div>
                ))
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button onClick={clearQueue} className="bg-red-900/20 text-red-400 border border-red-900/50 py-2 rounded text-xs hover:bg-red-900/40 flex items-center justify-center gap-1">
                <Trash2 className="w-3 h-3" /> {t('planchePage.clearQueueBtn')}
              </button>
              <button onClick={handleOpenExportModal} className="tb-btn-primary py-2.5 rounded text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1 font-bold">
                <Download className="w-4 h-4" /> {t('planche.export.download')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal with 4 Formats (PDF, PNG, TIFF, DTX) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#F7941D]" /> Choisir le Format d'Exportation DTF
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Sélectionnez le format adapté à votre imprimante ou RIP</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#222]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* PDF Option */}
              <div
                onClick={() => setSelectedFormat('PDF')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedFormat === 'PDF' ? 'bg-[#0A0A0A] border-[#F7941D]' : 'bg-[#0A0A0A] border-[#2E2E2E] hover:border-slate-500'
                }`}
              >
                <div className="w-10 h-10 bg-blue-950/80 text-blue-300 rounded-xl flex items-center justify-center border border-blue-700/60 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">PDF Vectoriel 300 DPI</h4>
                  <p className="text-xs text-slate-400">Format universel accepté par 99% des imprimantes et RIP.</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedFormat === 'PDF' ? 'border-[#F7941D] bg-[#F7941D]' : 'border-[#2E2E2E]'}`}>
                  {selectedFormat === 'PDF' && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                </div>
              </div>

              {/* PNG Option */}
              <div
                onClick={() => setSelectedFormat('PNG')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedFormat === 'PNG' ? 'bg-[#0A0A0A] border-[#F7941D]' : 'bg-[#0A0A0A] border-[#2E2E2E] hover:border-slate-500'
                }`}
              >
                <div className="w-10 h-10 bg-green-950/80 text-green-300 rounded-xl flex items-center justify-center border border-green-700/60 flex-shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">PNG HD 300 DPI Transparent</h4>
                  <p className="text-xs text-slate-400">Format raster avec couche transparente pour impression directe.</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedFormat === 'PNG' ? 'border-[#F7941D] bg-[#F7941D]' : 'border-[#2E2E2E]'}`}>
                  {selectedFormat === 'PNG' && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                </div>
              </div>

              {/* TIFF Option */}
              <div
                onClick={() => setSelectedFormat('TIFF')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedFormat === 'TIFF' ? 'bg-[#0A0A0A] border-[#F7941D]' : 'bg-[#0A0A0A] border-[#2E2E2E] hover:border-slate-500'
                }`}
              >
                <div className="w-10 h-10 bg-amber-950/80 text-amber-300 rounded-xl flex items-center justify-center border border-amber-700/60 flex-shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">TIFF Uncompressed (RIP Pro)</h4>
                  <p className="text-xs text-slate-400">Format haute qualité sans perte pour logiciels RIP professionnels.</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedFormat === 'TIFF' ? 'border-[#F7941D] bg-[#F7941D]' : 'border-[#2E2E2E]'}`}>
                  {selectedFormat === 'TIFF' && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                </div>
              </div>

              {/* DTX Option */}
              <div
                onClick={() => setSelectedFormat('DTX')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedFormat === 'DTX' ? 'bg-[#0A0A0A] border-[#F7941D]' : 'bg-[#0A0A0A] border-[#2E2E2E] hover:border-slate-500'
                }`}
              >
                <div className="w-10 h-10 bg-purple-950/80 text-purple-300 rounded-xl flex items-center justify-center border border-purple-700/60 flex-shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    DTX Natif v2
                    <span className="px-2 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-700/60 text-[10px] font-extrabold rounded-full">
                      Natif DTF
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">Pour machines Coldeso, Prestige & UniHeat avec couche blanche intégrée.</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedFormat === 'DTX' ? 'border-[#F7941D] bg-[#F7941D]' : 'border-[#2E2E2E]'}`}>
                  {selectedFormat === 'DTX' && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2E2E2E]">
              <button onClick={() => setShowExportModal(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">
                Annuler
              </button>
              <button
                onClick={handleExecuteExport}
                className="px-6 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#F7941D]/20 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger la planche ({selectedFormat})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
