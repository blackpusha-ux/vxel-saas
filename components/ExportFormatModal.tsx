'use client';

import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, Layers, FileCode, Check, Star, X, Printer } from 'lucide-react';
import { DTF_MACHINES, DTFMachineItem } from '@/lib/dtf-machines';
import { useTranslation } from '@/hooks/useTranslation';

export type PlancheFormatOption = 'PDF' | 'PNG' | 'TIFF' | 'DTX';

interface ExportFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: (format: PlancheFormatOption, machine: DTFMachineItem | null) => void;
}

export default function ExportFormatModal({ isOpen, onClose, onConfirmExport }: ExportFormatModalProps) {
  const { t } = useTranslation();
  const [selectedMachineId, setSelectedMachineId] = useState<string>('other');
  const [selectedFormat, setSelectedFormat] = useState<PlancheFormatOption>('PDF');

  if (!isOpen) return null;

  const currentMachine = DTF_MACHINES.find((m) => m.id === selectedMachineId) || null;

  const handleMachineChange = (machineId: string) => {
    setSelectedMachineId(machineId);
    if (machineId === 'other') {
      setSelectedFormat('PDF');
    } else {
      const machine = DTF_MACHINES.find((m) => m.id === machineId);
      if (machine && ['PDF', 'PNG', 'TIFF', 'DTX'].includes(machine.recommendedFormat)) {
        setSelectedFormat(machine.recommendedFormat as PlancheFormatOption);
      }
    }
  };

  const formatsList: {
    id: PlancheFormatOption;
    nameKey: string;
    icon: any;
    desc: string;
    isNativeDTX?: boolean;
  }[] = [
    {
      id: 'PDF',
      nameKey: 'planche.export.formats.pdf',
      icon: FileText,
      desc: 'Format universel 300 DPI accepté par 99% des imprimantes et RIP.',
    },
    {
      id: 'PNG',
      nameKey: 'planche.export.formats.png',
      icon: ImageIcon,
      desc: 'Format raster HD avec canal alpha transparent pour impression directe.',
    },
    {
      id: 'TIFF',
      nameKey: 'planche.export.formats.tiff',
      icon: Layers,
      desc: 'Format haute qualité non compressé pour logiciels RIP professionnels.',
    },
    {
      id: 'DTX',
      nameKey: 'planche.export.formats.dtx',
      icon: FileCode,
      desc: 'Format binaire DTF natif optimisé pour machines Coldeso, Prestige, UniHeat.',
      isNativeDTX: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-[#F7941D]" /> {t('planche.export.title')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sélectionnez votre imprimante pour obtenir le format d'impression optimal
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#222]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Machine Selector Dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Printer className="w-4 h-4 text-[#F7941D]" />
            <span>{t('planche.export.selectMachine')}</span>
          </label>
          <select
            value={selectedMachineId}
            onChange={(e) => handleMachineChange(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#2E2E2E] text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#F7941D] font-bold"
          >
            <option value="other">{t('planche.export.otherMachine')}</option>
            {DTF_MACHINES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.maxResolution})
              </option>
            ))}
          </select>

          {currentMachine && (
            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#2E2E2E] text-xs space-y-1">
              <p className="text-[#F7941D] font-bold">💡 Note Machine : {currentMachine.notes}</p>
            </div>
          )}
        </div>

        {/* 4 Formats Grid */}
        <div className="space-y-3">
          {formatsList.map((fmt) => {
            const Icon = fmt.icon;
            const isSelected = selectedFormat === fmt.id;
            const isRecommended = currentMachine && currentMachine.recommendedFormat === fmt.id;

            return (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 relative ${
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

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      {t(fmt.nameKey)}
                      {fmt.isNativeDTX && (
                        <span className="px-2 py-0.5 bg-purple-950/80 text-purple-300 border border-purple-700/60 text-[10px] font-extrabold rounded-full">
                          DTX Natif
                        </span>
                      )}
                    </h4>

                    {isRecommended && (
                      <span className="px-2.5 py-0.5 bg-[#F7941D] text-black text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                        <Star className="w-3 h-3 fill-black" /> {t('planche.export.recommended')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{fmt.desc}</p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[#F7941D] bg-[#F7941D]' : 'border-[#2E2E2E]'
                  }`}
                >
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
              onConfirmExport(selectedFormat, currentMachine);
              onClose();
            }}
            className="px-6 py-2.5 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl shadow-lg shadow-[#F7941D]/20 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger ({selectedFormat})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
