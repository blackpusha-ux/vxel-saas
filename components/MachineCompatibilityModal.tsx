'use client';

import React, { useState } from 'react';
import { Search, X, Printer, Check, Star, Info, Zap } from 'lucide-react';
import { dtfMachinesDatabase, DTFMachine } from '@/lib/dtf-machines';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectMachine?: (machine: DTFMachine) => void;
}

export default function MachineCompatibilityModal({ isOpen, onClose, onSelectMachine }: Props) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredMachines = dtfMachinesDatabase.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories: { key: string; label: string }[] = [
    { key: 'coldeso', label: 'Coldeso (DTX Natif)' },
    { key: 'prestige', label: 'Prestige (DTX Natif)' },
    { key: 'uniheat', label: 'UniHeat (DTX Natif)' },
    { key: 'epson', label: 'Epson SureColor' },
    { key: 'brother', label: 'Brother DTF' },
    { key: 'roland', label: 'Roland VersaSTUDIO' },
    { key: 'mimaki', label: 'Mimaki TxF Series' },
    { key: 'rip', label: 'Logiciels RIP (CADlink, ErgoSoft...)' },
    { key: 'generic', label: 'Imprimantes Génériques Chinoises' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#2E2E2E] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F7941D]/10 text-[#F7941D] rounded-xl flex items-center justify-center border border-[#F7941D]/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                Base de Données Machines DTF Compatibles
              </h2>
              <p className="text-xs text-slate-400">Spécifications techniques, résolutions et formats d'impression supportés</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#222]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#2E2E2E] bg-[#0A0A0A]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par marque ou modèle (ex: Epson, Coldeso, Brother, CADlink...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#2E2E2E] text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#F7941D]"
            />
          </div>
        </div>

        {/* Machines List Grouped by Category */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {categories.map((cat) => {
            const machinesInCat = filteredMachines.filter((m) => m.category === cat.key);
            if (machinesInCat.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#F7941D] uppercase tracking-wider border-b border-[#2E2E2E] pb-2 flex items-center gap-2">
                  <span>{cat.label}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {machinesInCat.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (onSelectMachine) {
                          onSelectMachine(m);
                          onClose();
                        }
                      }}
                      className="bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D] rounded-2xl p-4 transition-all cursor-pointer group flex flex-col justify-between space-y-3 relative"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#F7941D] transition-colors">{m.name}</h4>
                          {m.isPopular && (
                            <span className="px-2 py-0.5 bg-[#F7941D]/10 border border-[#F7941D]/30 text-[#F7941D] text-[10px] font-extrabold rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-[#F7941D]" /> Recommandé VXEL
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3 pt-1">
                          <span>📐 Résolution max : <strong className="text-slate-200">{m.maxResolution}</strong></span>
                          <span>🎨 Profil : <strong className="text-slate-200">{m.colorProfile}</strong></span>
                        </div>
                      </div>

                      {/* Formats Supported Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#2E2E2E]/60">
                        <span className="text-[10px] text-slate-500 mr-1">Formats :</span>
                        {m.supportedFormats.map((fmt) => (
                          <span
                            key={fmt}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              fmt === 'DTX'
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60'
                                : fmt === 'PDF'
                                ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60'
                                : fmt === 'PNG'
                                ? 'bg-green-950/80 text-green-300 border border-green-700/60'
                                : fmt === 'TIFF'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
                            }`}
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>

                      <p className="text-[10px] text-slate-400 leading-tight italic bg-[#161616] p-2 rounded-lg border border-[#2E2E2E]">
                        💡 {m.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2E2E2E] bg-[#111] flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-xs rounded-xl">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
