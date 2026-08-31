export interface DTFMachine {
  id: string;
  name: string;
  brand: string;
  category: 'epson' | 'brother' | 'roland' | 'mimaki' | 'coldeso' | 'prestige' | 'uniheat' | 'rip' | 'generic';
  supportedFormats: ('PDF' | 'PNG' | 'TIFF' | 'DTX' | 'EPS')[];
  recommendedFormat: 'PDF' | 'PNG' | 'TIFF' | 'DTX' | 'EPS';
  maxResolution: string;
  colorProfile: string;
  isPopular?: boolean;
  supportsNativeDTX?: boolean;
  notes: string;
}

export const dtfMachinesDatabase: DTFMachine[] = [
  // Coldeso, Prestige, UniHeat (DTX Natif)
  {
    id: 'coldeso-a3-pro',
    name: 'Coldeso A3 Pro (DTX Natif)',
    brand: 'Coldeso',
    category: 'coldeso',
    supportedFormats: ['DTX', 'PNG', 'PDF', 'TIFF'],
    recommendedFormat: 'DTX',
    maxResolution: '1440 × 720 DPI',
    colorProfile: 'CMYK + White Underbase',
    isPopular: true,
    supportsNativeDTX: true,
    notes: 'Supporte le format binaire DTX v2 natif avec gestion directe du sous-couche blanc.',
  },
  {
    id: 'prestige-a3-ii',
    name: 'Prestige A3+ II (DTX Natif)',
    brand: 'Prestige',
    category: 'prestige',
    supportedFormats: ['DTX', 'PNG', 'PDF', 'TIFF'],
    recommendedFormat: 'DTX',
    maxResolution: '1440 × 1440 DPI',
    colorProfile: 'CMYK + 2x White',
    isPopular: true,
    supportsNativeDTX: true,
    notes: 'Optimisé pour le format natif DTX avec temps de séchage réglable.',
  },
  {
    id: 'uniheat-u1',
    name: 'UniHeat U1 Industrial (DTX Natif)',
    brand: 'UniHeat',
    category: 'uniheat',
    supportedFormats: ['DTX', 'TIFF', 'PDF'],
    recommendedFormat: 'DTX',
    maxResolution: '2880 × 1440 DPI',
    colorProfile: 'CMYK + White + Fluorescent',
    isPopular: true,
    supportsNativeDTX: true,
    notes: 'Imprimante industrielle haute cadence avec support DTX natif.',
  },

  // Epson
  {
    id: 'epson-f170',
    name: 'Epson SureColor F170 / F100',
    brand: 'Epson',
    category: 'epson',
    supportedFormats: ['PDF', 'PNG', 'TIFF'],
    recommendedFormat: 'PNG',
    maxResolution: '1200 × 600 DPI',
    colorProfile: 'sRGB / CMYK',
    isPopular: true,
    notes: 'Format PNG HD avec transparence recommandé pour les modèles A4/A3.',
  },
  {
    id: 'epson-f2270',
    name: 'Epson SureColor F2270 / F3070 DTG/DTF',
    brand: 'Epson',
    category: 'epson',
    supportedFormats: ['PDF', 'TIFF', 'PNG'],
    recommendedFormat: 'PDF',
    maxResolution: '1440 × 1440 DPI',
    colorProfile: 'Epson Garment CMYK+W',
    isPopular: true,
    notes: 'Export PDF vectoriel 300 DPI recommandé avec profil Garment Creator.',
  },

  // Brother
  {
    id: 'brother-gtx-4',
    name: 'Brother GTX-4 / GTX-Pro DTF',
    brand: 'Brother',
    category: 'brother',
    supportedFormats: ['PDF', 'TIFF', 'PNG'],
    recommendedFormat: 'TIFF',
    maxResolution: '1200 × 1200 DPI',
    colorProfile: 'Brother CMYK+W',
    isPopular: true,
    notes: 'Format TIFF non compressé recommandé pour conserver la densité de blanc Brother.',
  },

  // Roland
  {
    id: 'roland-bn2-20',
    name: 'Roland VersaSTUDIO BN2-20',
    brand: 'Roland',
    category: 'roland',
    supportedFormats: ['EPS', 'PDF', 'TIFF'],
    recommendedFormat: 'EPS',
    maxResolution: '1440 × 1080 DPI',
    colorProfile: 'Roland Color System Library',
    isPopular: true,
    notes: 'Format EPS vectoriel avec découpe contour recommandée via VersaWorks.',
  },

  // Mimaki
  {
    id: 'mimaki-txf150-75',
    name: 'Mimaki TxF150-75 / TxF300-75',
    brand: 'Mimaki',
    category: 'mimaki',
    supportedFormats: ['PDF', 'EPS', 'TIFF'],
    recommendedFormat: 'PDF',
    maxResolution: '1440 × 720 DPI',
    colorProfile: 'RasterLink CMYK+W',
    isPopular: true,
    notes: 'Format PDF prêt pour le logiciel RIP Mimaki RasterLink 7.',
  },

  // RIP Logiciels
  {
    id: 'cadlink-digital-factory',
    name: 'CADlink Digital Factory v10/v11 RIP',
    brand: 'CADlink',
    category: 'rip',
    supportedFormats: ['PNG', 'PDF', 'TIFF', 'EPS'],
    recommendedFormat: 'PNG',
    maxResolution: '2880 × 1440 DPI',
    colorProfile: 'Custom ICC RIP Profiles',
    isPopular: true,
    notes: 'Compatible avec tous les formats. Le PNG HD 300 DPI offre la meilleure vitesse RIP.',
  },
  {
    id: 'ergosoft-dtf',
    name: 'ErgoSoft 16 DTF Print Edition',
    brand: 'ErgoSoft',
    category: 'rip',
    supportedFormats: ['PDF', 'TIFF', 'EPS'],
    recommendedFormat: 'PDF',
    maxResolution: '2880 × 2880 DPI',
    colorProfile: 'ErgoSoft CMYK+W',
    notes: 'Export PDF vectoriel 300 DPI recommandé avec séparation de couche.',
  },

  // Génériques Chinois
  {
    id: 'generic-30cm-dtf',
    name: 'Imprimante DTF Générique 30cm / A3 (XP600 / i3200)',
    brand: 'Générique',
    category: 'generic',
    supportedFormats: ['PNG', 'PDF', 'TIFF', 'DTX'],
    recommendedFormat: 'PNG',
    maxResolution: '1440 × 720 DPI',
    colorProfile: 'CMYK + 2W',
    isPopular: true,
    notes: 'La majorité des imprimantes chinoises 30cm acceptent les formats PNG HD et DTX.',
  },
  {
    id: 'generic-60cm-dtf',
    name: 'Imprimante DTF Générique 60cm / 2 Têtes i3200',
    brand: 'Générique',
    category: 'generic',
    supportedFormats: ['PNG', 'PDF', 'TIFF', 'DTX'],
    recommendedFormat: 'PDF',
    maxResolution: '2880 × 1440 DPI',
    colorProfile: 'CMYK + 4W',
    isPopular: true,
    notes: 'Export PDF recommandé pour les grands formats 60cm multi-visuels.',
  },
];
