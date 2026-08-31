'use client';

import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, Layers, FileCode, Check, Star, X, Info } from 'lucide-react';
import { DTFMachine } from '@/lib/dtf-machines';
import { useTranslation } from '@/hooks/useTranslation';

export type ExportFormat = 'PDF' | 'PNG' | 'TIFF' | 'DTX' | 'EPS';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedMachine: DTFMachine | null;
  onConfirmExport: (format: ExportFormat) => void;
}

export default function ExportFormatModal({ isOpen, onClose, selectedMachine, onConfirmExport }: Props) {
  const { t } = useTranslation();

  const formatsList: {
    id: ExportFormat;
    name: string;
    icon: any;
    desc: string;
    recommendedFor: string;
    isNativeDTX?: boolean;
  }[] = [
    {
      id: 'PDF',
      name: 'PDF Vectoriel (300 DPI)',
      icon: FileText,
      desc: 'Format universel accepté par 99% des machines et RIP du marché. Conserve les lignes vectorielles nettes.',
      recommendedFor: 'Epson F2270, Mimaki, ErgoSoft, CADlink',
    },
    {
      id: 'PNG',
      name: 'PNG HD 300 DPI Transparent',
      icon: ImageIcon,
      desc: 'Format raster haute définition avec canal alpha transparent. Idéal pour impression directe rapide.',
      recommendedFor: 'Epson F170, CADlink Digital Factory, Ateliers A3/A4',
    },
    {
      id: 'TIFF',
      name: 'TIFF Uncompressed CMYK+W',
      icon: Layers,
      desc: 'Format haute fidélité pour logiciels RIP professionnels sans compression ni perte de couleur.',
      recommendedFor: 'Brother GTX-4, Wasatch, Caldera, RIPs Pro',
    },
    {
      id: 'DTX',
      name: 'DTX Natif v2 (CMYK + Sous-couche Blanc)',
      icon: FileCode,
      desc: 'Format binaire DTF natif optimisé pour les têtes d\'impression. Inclut la métadonné blanche et les paramètres de pressage.',
      recommendedFor: 'Coldeso A3 Pro, Prestige A3+ II, UniHeat U1',
      isNativeDTX: true,
    },
    {
      id: 'EPS',
      name: 'EPS Vectoriel Contour',
      icon: FileCode,
      desc: 'Format vectoriel haut de gamme avec tracés de découpe intégrés pour traceurs et RIPs Roland/Mimaki.',
      recommendedFor: 'Roland VersaSTUDIO BN2-20, Mimaki TxF',
    },
  ];

  const initialFormat: ExportFormat = selectedMachine ? selectedMachine.recommendedFormat : 'PDF';
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(initialFormat);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-[#F7941D]" /> Choisir le Format d'Exportation DTF
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedMachine
                ? `Machine sélectionnée : ${selectedMachine.name}`
                : 'Sélectionnez le format optimal pour votre imprimante ou logiciel RIP'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#222]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formats Grid */}
        <div className="space-y-3">
          {formatsList.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = selectedFormat === fmt.id;
            const isRecommended = selectedMachine && selectedMachine.recommendedFormat === fmt.id;

            return (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 relative ${
                  isSelected
                    ? 'bg-[#0A0A0A] border-[#F7941D] shadow-lg shadow-[#F7941D]/10'
                    : 'bg-[#0A0A0A] border-[#2E2E2E] hover:border-slate-500'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    fmt.isNativeDTX
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                      : 'bg-[#161616] text-[#F7941D] border border-[#2E2E2E]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      {fmt.name}
                      {fmt.isNativeDTX && (
                        <span className="px-2 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-700/60 text-[10px] font-extrabold rounded-full">
                          DTX Natif
                        </span>
                      )}
                    </h3>

                    {isRecommended && (
                      <span className="px-2.5 py-0.5 bg-[#F7941D] text-black text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                        <Star className="w-3 h-3 fill-black" /> Recommandé
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{fmt.desc}</p>
                  <span className="text-[10px] text-slate-500 block">Machines recommandées : {fmt.recommendedFor}</span>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${
                  isSelected ? 'border-[#F7941D] bg-[#F7941D]' : 'border-[#2E2E2E]'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2E2E2E]">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirmExport(selectedFormat);
              onClose();
            }}
            className="px-6 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#F7941D]/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger la planche en {selectedFormat}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
