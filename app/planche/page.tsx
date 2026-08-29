'use client';

import { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import Link from 'next/link';

interface QueueItem {
  src: string;
  w: number;
  h: number;
}

export default function DTFPlanchePage() {
  const [printQueue, setPrintQueue] = useState<QueueItem[]>([]);
  const [tagWidth, setTagWidth] = useState<number>(29);
  const [tagHeight, setTagHeight] = useState<number>(34);
  const [machineWidth, setMachineWidth] = useState<number>(58);
  const [gutterSize, setGutterSize] = useState<number>(10);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Chargement des images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = ev => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(promises);
    
    const newItems: QueueItem[] = results.map(src => ({ src, w: tagWidth, h: tagHeight }));
    setPrintQueue(prev => [...prev, ...newItems]);
    
    e.target.value = '';
  };

  // 2. Gestion de la queue
  const clearQueue = () => setPrintQueue([]);
  
  const removeFromQueue = (index: number) => {
    setPrintQueue(prev => prev.filter((_, i) => i !== index));
  };

  // 3. Calcul de la disposition
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

  // 4. Dessin sur le Canvas (Prévisualisation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || printQueue.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const layout = calculateLayout();
    const { positions, realHeightCm } = layout;
    
    const scaleFactor = 500 / machineWidth; 
    const canvasW = Math.round(machineWidth * scaleFactor);
    const canvasH = Math.round(realHeightCm * scaleFactor);
    
    canvas.width = canvasW;
    canvas.height = canvasH;
    
    // Fond blanc
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let loadedCount = 0;
    positions.forEach((pos) => {
      const img = new Image();
      img.onload = () => {
        const drawX = pos.x * scaleFactor;
        const drawY = pos.y * scaleFactor;
        const drawW = pos.w * scaleFactor;
        const drawH = pos.h * scaleFactor;
        
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        
        // Cadre orange pour l'écran
        ctx.strokeStyle = '#F7941D';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, drawW, drawH);
        
        loadedCount++;
      };
      img.src = pos.src;
    });
  }, [printQueue, tagWidth, tagHeight, machineWidth, gutterSize]);

  // 5. Génération PDF
  const downloadPDF = () => {
    if (printQueue.length === 0) return alert("File vide !");

    const layout = calculateLayout();
    const { positions, realHeightCm } = layout;
    
    const doc = new jsPDF({ 
      orientation: 'p', 
      unit: 'cm', 
      format: [machineWidth, realHeightCm] 
    });
    
    positions.forEach(pos => {
      doc.addImage(pos.src, 'PNG', pos.x, pos.y, pos.w, pos.h);
    });

    doc.save(`TBALBIZA_Planche_${machineWidth}x${realHeightCm.toFixed(1)}cm.pdf`);
  };

  const layout = calculateLayout();

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
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">← Retour</Link>
          <h1 className="text-xl font-bold text-white font-baloo">TBAL<span className="text-[#F7941D]">BIZA</span> <span className="text-xs text-gray-400 font-normal font-nunito">Planche DTF Pro</span></h1>
          <input type="file" id="imageLoader" accept="image/*" multiple onChange={handleImageUpload} className="text-xs bg-[#1F1F1F] p-1 rounded border border-[#2E2E2E] text-white" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Col 1: Prévisualisation */}
        <div className="lg:col-span-7 bg-[#161616] border border-[#2E2E2E] rounded-lg flex flex-col relative overflow-hidden h-[600px] lg:h-auto">
          <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-1 rounded text-xs border border-[#F7941D] flex items-center gap-2 font-nunito">
            ️ Aperçu Visuel 
            <span className="text-[#F7941D] font-mono font-bold ml-1">
              {printQueue.length > 0 ? `${machineWidth}cm × ${layout.realHeightCm.toFixed(1)}cm` : '—'}
            </span>
          </div>
          <div className="flex-1 w-full h-full overflow-auto flex justify-center items-start p-5" 
               style={{
                 backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                 backgroundSize: '20px 20px',
                 backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                 backgroundColor: '#fff'
               }}>
            <canvas ref={canvasRef} className="shadow-2xl bg-white max-w-full" style={{ display: printQueue.length > 0 ? 'block' : 'none' }} />
          </div>
        </div>

        {/* Col 2: Contrôles & Queue */}
        <div className="lg:col-span-5 flex flex-col gap-3 overflow-y-auto pr-1 font-nunito">
            
          <div className="section">
            <h3>📐 Dimensions du Tag</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Largeur (cm)</label>
                <input type="number" value={tagWidth} onChange={(e) => setTagWidth(parseFloat(e.target.value))} className="tb-input w-full rounded p-1" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Hauteur (cm)</label>
                <input type="number" value={tagHeight} onChange={(e) => setTagHeight(parseFloat(e.target.value))} className="tb-input w-full rounded p-1" />
              </div>
            </div>
            <button onClick={() => {
                const src = printQueue.length > 0 ? printQueue[printQueue.length-1].src : null;
                if (!src) return alert("Chargez d'abord une image !");
                const newItems: QueueItem[] = Array(5).fill(null).map(() => ({ src: src!, w: tagWidth, h: tagHeight }));
                setPrintQueue(prev => [...prev, ...newItems]);
            }} className="w-full tb-btn-primary py-2 rounded text-xs font-bold"> Ajouter 5x ce format à la file</button>
          </div>

          <div className="section">
            <h3>🖨️ Configuration Machine</h3>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs text-gray-400 w-24">Largeur Film:</label>
              <select value={machineWidth} onChange={(e) => setMachineWidth(parseFloat(e.target.value))} className="tb-input flex-1 rounded p-1">
                <option value={29}>29 cm (Simple)</option>
                <option value={58}>58 cm (Double)</option>
                <option value={60}>60 cm (Large)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400 w-24">Ecart (mm):</label>
              <input type="number" value={gutterSize} onChange={(e) => setGutterSize(parseFloat(e.target.value))} className="tb-input flex-1 rounded p-1" />
            </div>
          </div>

          <div className="section flex-1 flex flex-col">
            <h3>📂 File d'Attente (<span>{printQueue.length}</span>)</h3>
            <div className="h-40 overflow-y-auto mb-2 text-xs space-y-1 bg-black/20 p-2 rounded border border-[#2E2E2E] flex-1">
              {printQueue.length === 0 ? (
                <div className="text-gray-500 italic text-center mt-10">Chargez des images pour commencer...</div>
              ) : (
                printQueue.map((item, i) => (
                  <div key={i} className="flex justify-between bg-[#1F1F1F] p-2 rounded border border-[#2E2E2E]">
                    <span>{i+1}. {item.w}x{item.h}cm</span>
                    <button onClick={() => removeFromQueue(i)} className="text-red-500 hover:text-white font-bold">×</button>
                  </div>
                ))
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button onClick={clearQueue} className="bg-red-900/20 text-red-400 border border-red-900/50 py-1.5 rounded text-xs hover:bg-red-900/40">️ Vider</button>
              <button onClick={downloadPDF} className="tb-btn-primary py-1.5 rounded text-xs shadow-lg shadow-orange-500/20">📥 Télécharger PDF PROPRE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}