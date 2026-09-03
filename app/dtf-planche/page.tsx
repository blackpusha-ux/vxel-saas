'use client';

import { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';

import Link from 'next/link';
import { ArrowLeft, Upload, Trash2, Download, Settings, Ruler, Printer, FolderOpen, Sparkles, Layers, Percent } from 'lucide-react';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { useTranslation } from '@/hooks/useTranslation';
import { generateDTXFile } from '@/lib/dtf-export';
import ExportFormatModal, { PlancheFormatOption } from '@/components/ExportFormatModal';
import ImageLibraryModal from '@/components/ImageLibraryModal';
import { useImageLibrary, LibraryItem } from '@/contexts/ImageLibraryContext';
import { DTFMachineItem } from '@/lib/dtf-machines';

interface QueueItem {
  src: string;
  w: number;
  h: number;
}

export default function DTFPlanchePage() {
  const { t } = useTranslation();
  const [printQueue, setPrintQueue] = useState<QueueItem[]>([]);
  const [tagWidth, setTagWidth] = useState<number>(29);
  const [tagHeight, setTagHeight] = useState<number>(34);
  const [machineWidth, setMachineWidth] = useState<number>(58);
  const [gutterSize, setGutterSize] = useState<number>(10);
  const [previewDimensions, setPreviewDimensions] = useState<string>('—');
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  // Modal State for Machine-Guided Export
  const [showExportModal, setShowExportModal] = useState(false);

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

  // Helper wrapper for DTX compatibility
  const generateDTXWrapper = (pdfBlob: Blob, fileName: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const pdfArrayBuffer = e.target?.result as ArrayBuffer;
      const headerText = `DTX_V2\nDIMENSIONS:${machineWidth}x${previewDimensions}\nDPI:1440\nCHANNELS:CMYK+WHITE\n---\n`;
      const headerEncoder = new TextEncoder();
      const headerBytes = headerEncoder.encode(headerText);

      const dtxBuffer = new Uint8Array(headerBytes.length + pdfArrayBuffer.byteLength);
      dtxBuffer.set(headerBytes, 0);
      dtxBuffer.set(new Uint8Array(pdfArrayBuffer), headerBytes.length);

      const dtxBlob = new Blob([dtxBuffer.buffer as ArrayBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(dtxBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    };
    reader.readAsArrayBuffer(pdfBlob);
  };

  const handleConfirmExport = (format: PlancheFormatOption, machine: DTFMachineItem | null) => {
    if (printQueue.length === 0 || !canvasRef.current) return;

    const layout = calculateLayout();
    const { positions, realHeightCm } = layout;
    const canvas = canvasRef.current;

    const baseFileName = `VXEL_Planche_${machineWidth}x${realHeightCm.toFixed(1)}cm_${machine ? machine.id : 'custom'}`;

    if (format === 'PDF') {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'cm',
        format: [machineWidth, realHeightCm],
      });
      positions.forEach((pos) => {
        doc.addImage(pos.src, 'PNG', pos.x, pos.y, pos.w, pos.h);
      });
      doc.save(`${baseFileName}.pdf`);
    } else if (format === 'PNG') {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFileName}.png`;
      a.click();
    } else if (format === 'TIFF') {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseFileName}.tiff`;
      a.click();
    } else if (format === 'DTX') {
      // Direct Native DTX Binary Generation
      try {
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
        a.download = `${baseFileName}.dtx`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        // Fallback to DTX Header Wrapper over PDF if binary canvas fails
        const doc = new jsPDF({
          orientation: 'p',
          unit: 'cm',
          format: [machineWidth, realHeightCm],
        });
        positions.forEach((pos) => {
          doc.addImage(pos.src, 'PNG', pos.x, pos.y, pos.w, pos.h);
        });
        const pdfBlob = doc.output('blob');
        generateDTXWrapper(pdfBlob, `${baseFileName}.dtx`);
      }
    }
  };

  const layout = calculateLayout();
  const totalArtworkAreaCm2 = printQueue.reduce((acc, it) => acc + (it.w * it.h), 0);
  const totalFilmAreaCm2 = machineWidth * Math.max(1, layout.realHeightCm);
  const filmUsagePct = printQueue.length > 0 ? Math.min(98, Math.round((totalArtworkAreaCm2 / totalFilmAreaCm2) * 100)) : 0;
  const wastePct = printQueue.length > 0 ? Math.max(2, 100 - filmUsagePct) : 0;

  const handleSelectFromLibrary = (item: LibraryItem) => {
    setPrintQueue((prev) => [...prev, { src: item.url, w: tagWidth, h: tagHeight }]);
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
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t('common.home')}
          </Link>
          <h1 className="text-xl font-bold text-white font-baloo">VXEL <span className="text-[#F7941D]">Planche</span> <span className="text-xs text-gray-400 font-normal font-nunito">DTF Pro</span></h1>
          
          <label className="text-xs bg-[#1F1F1F] p-2 rounded border border-[#2E2E2E] hover:border-[#F7941D] text-white flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-[#F7941D]" />
            {t('planchePage.uploadBtn')}
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>

          <button
            onClick={() => setIsLibraryOpen(true)}
            className="text-xs bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-[#2E2E2E] hover:border-[#F7941D] text-slate-200 px-3 py-2 rounded flex items-center gap-2 font-bold transition-colors"
          >
            <FolderOpen className="w-4 h-4 text-[#F7941D]" />
            <span>📚 Ma Bibliothèque</span>
          </button>
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

          {printQueue.length > 0 && (
            <div className="absolute top-2 right-2 z-10 bg-black/80 px-3 py-1.5 rounded text-xs border border-[#2E2E2E] flex items-center gap-3 font-mono">
              <span className="text-green-400 font-bold">Film utile: {filmUsagePct}%</span>
              <span className="text-slate-400">Gaspillage: {wastePct}%</span>
            </div>
          )}

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
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Choisir depuis ma bibliothèque</span>
                </button>
              </div>
            ) : (
              <canvas ref={canvasRef} className="shadow-2xl bg-white max-w-full" />
            )}
          </div>
        </div>

        {/* Col 2: Contrôles & Queue */}
        <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto pr-1 font-nunito">

          {/* Film Optimization Yield Banner */}
          {printQueue.length > 0 && (
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-lg p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F7941D]/10 border border-[#F7941D]/30 flex items-center justify-center text-[#F7941D]">
                  <Percent className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block">Optimisation du film</span>
                  <span className="text-[10px] text-slate-400">Nesting DTF automatique</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#F7941D] font-mono font-bold text-sm">{filmUsagePct}% utilisé</span>
                <span className="text-[10px] text-slate-500 block">~{totalArtworkAreaCm2.toFixed(0)}cm² utile</span>
              </div>
            </div>
          )}

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
                <Download className="w-4 h-4" /> Télécharger Planche DTF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Library Modal */}
      <ImageLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectImage={handleSelectFromLibrary}
      />

      {/* Export Format Modal with Printer Selector */}
      <ExportFormatModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirmExport={handleConfirmExport}
      />
    </div>
  );
}

