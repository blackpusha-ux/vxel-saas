export interface DTFMachineItem {
  id: string;
  brand: string;
  name: string;
  formats: string[];
  recommendedFormat: 'PDF' | 'PNG' | 'TIFF' | 'DTX' | 'EPS';
  maxResolution: string;
  notes: string;
}

export const DTF_MACHINES: DTFMachineItem[] = [
  {
    id: 'epson-f170-f2270',
    brand: 'Epson',
    name: 'Epson SureColor F170 / F2270',
    formats: ['PDF', 'PNG', 'TIFF'],
    recommendedFormat: 'PDF',
    maxResolution: '1440 × 1440 DPI',
    notes: 'Export PDF vectoriel 300 DPI recommandé avec profil Garment Creator.',
  },
  {
    id: 'brother-gtx',
    brand: 'Brother',
    name: 'Brother GTX-3 / GTX-4',
    formats: ['PDF', 'PNG', 'TIFF', 'BMP'],
    recommendedFormat: 'TIFF',
    maxResolution: '1200 × 1200 DPI',
    notes: 'Format TIFF non compressé recommandé pour conserver la densité du blanc.',
  },
  {
    id: 'roland-bn2-20',
    brand: 'Roland',
    name: 'Roland VersaSTUDIO BN2-20',
    formats: ['PDF', 'EPS', 'TIFF'],
    recommendedFormat: 'EPS',
    maxResolution: '1440 × 1080 DPI',
    notes: 'Format EPS vectoriel avec découpe contour recommandée via VersaWorks.',
  },
  {
    id: 'mimaki-txf150-75',
    brand: 'Mimaki',
    name: 'Mimaki TXF-150-75 / TXF-300',
    formats: ['PDF', 'TIFF', 'PSD', 'EPS'],
    recommendedFormat: 'PDF',
    maxResolution: '1440 × 720 DPI',
    notes: 'Format PDF prêt pour le logiciel RIP Mimaki RasterLink 7.',
  },
  {
    id: 'coldeso-a3-pro',
    brand: 'Coldeso',
    name: 'Coldeso A3 Pro (DTX Natif)',
    formats: ['PDF', 'PNG', 'DTX'],
    recommendedFormat: 'DTX',
    maxResolution: '1440 × 720 DPI',
    notes: 'Format binaire DTX v2 recommandé avec couche blanche intégrée.',
  },
  {
    id: 'prestige-a3-ii',
    brand: 'Prestige',
    name: 'Prestige A3+ II (DTX Natif)',
    formats: ['PDF', 'PNG', 'DTX', 'TIFF'],
    recommendedFormat: 'DTX',
    maxResolution: '1440 × 1440 DPI',
    notes: 'Format natif DTX avec temps de pressage et séchage optimisés.',
  },
  {
    id: 'uniheat-u1',
    brand: 'UniHeat',
    name: 'UniHeat U1 (DTX Natif)',
    formats: ['PDF', 'PNG', 'DTX'],
    recommendedFormat: 'DTX',
    maxResolution: '2880 × 1440 DPI',
    notes: 'Imprimante industrielle DTF avec support DTX natif.',
  },
  {
    id: 'cadlink-digital-factory',
    brand: 'CADlink',
    name: 'CADlink Digital Factory RIP',
    formats: ['PDF', 'PNG', 'TIFF', 'DTX'],
    recommendedFormat: 'PNG',
    maxResolution: '2880 × 1440 DPI',
    notes: 'PNG HD 300 DPI pour vitesse maximale ou DTX pour séparation automatique.',
  },
  {
    id: 'ergosoft-dtf-rip',
    brand: 'ErgoSoft',
    name: 'ErgoSoft DTF RIP',
    formats: ['PDF', 'TIFF', 'PNG', 'EPS', 'DTX'],
    recommendedFormat: 'PDF',
    maxResolution: '2880 × 2880 DPI',
    notes: 'PDF vectoriel recommandé avec profil colorimétrique ICC ErgoSoft.',
  },
];
