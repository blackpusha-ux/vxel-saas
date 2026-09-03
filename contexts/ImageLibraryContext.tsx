'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LibraryItem {
  id: string;
  url: string; // base64 data URL or blob
  type: 'dtf' | 'vector';
  name: string;
  date: string;
  width?: number;
  height?: number;
}

interface ImageLibraryContextType {
  library: LibraryItem[];
  addToLibrary: (item: Omit<LibraryItem, 'id' | 'date'> & { id?: string; date?: string }) => void;
  removeFromLibrary: (id: string) => void;
  getFromLibrary: (id: string) => LibraryItem | undefined;
  clearLibrary: () => void;
}

const ImageLibraryContext = createContext<ImageLibraryContextType | undefined>(undefined);

const STORAGE_KEY = 'vxel_image_library';
const MAX_ITEMS = 20;

export function ImageLibraryProvider({ children }: { children: React.ReactNode }) {
  const [library, setLibrary] = useState<LibraryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setLibrary(parsed);
        }
      }
    } catch (e) {
      console.error('Erreur chargement bibliothèque images:', e);
    }
  }, []);

  const saveToStorage = (items: LibraryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Erreur sauvegarde bibliothèque images:', e);
    }
  };

  const addToLibrary = (item: Omit<LibraryItem, 'id' | 'date'> & { id?: string; date?: string }) => {
    const newItem: LibraryItem = {
      id: item.id || `lib_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: item.date || new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      url: item.url,
      type: item.type,
      name: item.name || `Design_${Date.now()}`,
      width: item.width,
      height: item.height,
    };

    setLibrary((prev) => {
      const filtered = prev.filter((i) => i.id !== newItem.id);
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      saveToStorage(updated);
      return updated;
    });
  };

  const removeFromLibrary = (id: string) => {
    setLibrary((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  const getFromLibrary = (id: string) => {
    return library.find((item) => item.id === id);
  };

  const clearLibrary = () => {
    setLibrary([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Erreur nettoyage bibliothèque:', e);
    }
  };

  return (
    <ImageLibraryContext.Provider
      value={{
        library,
        addToLibrary,
        removeFromLibrary,
        getFromLibrary,
        clearLibrary,
      }}
    >
      {children}
    </ImageLibraryContext.Provider>
  );
}

export function useImageLibrary() {
  const context = useContext(ImageLibraryContext);
  if (!context) {
    throw new Error('useImageLibrary must be used within an ImageLibraryProvider');
  }
  return context;
}
