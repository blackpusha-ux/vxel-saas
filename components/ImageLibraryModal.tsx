'use client';

import React from 'react';
import { X, Trash2, Plus, Sparkles, FolderOpen, Layers, Image as ImageIcon } from 'lucide-react';
import { useImageLibrary, LibraryItem } from '@/contexts/ImageLibraryContext';

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (item: LibraryItem) => void;
}

export default function ImageLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
}: ImageLibraryModalProps) {
  const { library, removeFromLibrary } = useImageLibrary();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#2E2E2E] flex items-center justify-between bg-[#0F0F0F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#F7941D]/10 border border-[#F7941D]/30 flex items-center justify-center text-[#F7941D]">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Ma Bibliothèque de Designs DTF</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#222] text-[#F7941D] border border-[#333]">
                  {library.length} / 20
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sélectionnez un visuel préparé pour l'ajouter directement à votre planche d'impression
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {library.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#0A0A0A] border border-[#2E2E2E] flex items-center justify-center mx-auto text-slate-600">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-extrabold text-white">Aucune image sauvegardée</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Traitez un visuel dans le Studio DTF ou le Vectoriseur, puis cliquez sur "💾 Sauvegarder dans ma bibliothèque" pour le retrouver ici !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {library.map((item) => (
                <div
                  key={item.id}
                  className="group bg-[#0A0A0A] border border-[#2E2E2E] hover:border-[#F7941D]/60 rounded-2xl p-3 flex flex-col justify-between transition-all space-y-3"
                >
                  {/* Thumbnail with Checkerboard */}
                  <div
                    className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center relative border border-[#2E2E2E]"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #1c1c1c 25%, transparent 25%), linear-gradient(-45deg, #1c1c1c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c1c 75%), linear-gradient(-45deg, transparent 75%, #1c1c1c 75%)',
                      backgroundSize: '12px 12px',
                      backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                      backgroundColor: '#0F0F0F',
                    }}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black/80 text-[#F7941D] border border-white/10">
                      {item.type === 'vector' ? 'SVG Vector' : 'PNG DTF'}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-white truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500">{item.date}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#222]">
                    {onSelectImage && (
                      <button
                        onClick={() => {
                          onSelectImage(item);
                          onClose();
                        }}
                        className="flex-1 py-2 bg-[#F7941D] hover:bg-[#FFB25A] text-black font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter</span>
                      </button>
                    )}

                    <button
                      onClick={() => removeFromLibrary(item.id)}
                      className="p-2 bg-[#161616] hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-[#2E2E2E] hover:border-red-800 rounded-xl transition-colors"
                      title="Supprimer de la bibliothèque"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2E2E2E] bg-[#0F0F0F] flex items-center justify-between text-xs text-slate-400">
          <span>Conseil : Les images sont conservées pour composer vos planches rapidement.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#161616] hover:bg-[#222] border border-[#2E2E2E] text-white font-bold rounded-xl transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
