import { jsPDF } from 'jspdf';

export interface DTXExportOptions {
  widthCm: number;
  heightCm: number;
  dpi?: number;
  pressTempC?: number;
  pressDurationSec?: number;
  pressPressureBar?: number;
}

/**
 * Generates a real native binary DTX v2 file for Coldeso, Prestige, UniHeat & compatible DTF machines.
 */
export function generateDTXFile(
  canvas: HTMLCanvasElement,
  options: DTXExportOptions
): Uint8Array {
  const {
    widthCm,
    heightCm,
    dpi = 1440,
    pressTempC = 160,
    pressDurationSec = 15,
    pressPressureBar = 4,
  } = options;

  const widthMm = Math.round(widthCm * 10);
  const heightMm = Math.round(heightCm * 10);

  // 1. DTX Header Signature (4 bytes): 'D' 'T' 'X' '2' -> 0x44 0x54 0x58 0x32
  const headerSignature = new Uint8Array([0x44, 0x54, 0x58, 0x32]);

  // 2. Metadata Block (32 bytes)
  const metaBuffer = new ArrayBuffer(32);
  const metaView = new DataView(metaBuffer);

  metaView.setUint16(0, widthMm, true);         // Width in mm (2 bytes)
  metaView.setUint16(2, heightMm, true);        // Height in mm (2 bytes)
  metaView.setUint16(4, dpi, true);             // DPI resolution (2 bytes)
  metaView.setUint8(6, 5);                      // Channels: CMYK + White Underbase (1 byte)
  metaView.setUint8(7, 8);                      // Bit depth: 8-bit (1 byte)
  metaView.setUint16(8, pressTempC, true);      // Recommended Press Temp °C (2 bytes)
  metaView.setUint16(10, pressDurationSec, true); // Recommended Press Duration Sec (2 bytes)
  metaView.setUint16(12, pressPressureBar * 10, true); // Recommended Pressure Bar * 10 (2 bytes)
  // Bytes 14..31 reserved for future extensions

  // 3. Extract Canvas Image Data & Generate CMYK + White Underbase Raster
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx ? ctx.getImageData(0, 0, w, h).data : new Uint8ClampedArray(w * h * 4);

  const rasterLength = w * h * 5; // 5 channels per pixel: C, M, Y, K, White
  const rasterBuffer = new Uint8Array(rasterLength);

  let ptr = 0;
  for (let i = 0; i < imgData.length; i += 4) {
    const r = imgData[i] / 255;
    const g = imgData[i + 1] / 255;
    const b = imgData[i + 2] / 255;
    const a = imgData[i + 3];

    // RGB to CMYK conversion
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    rasterBuffer[ptr++] = Math.round(c * 255);
    rasterBuffer[ptr++] = Math.round(m * 255);
    rasterBuffer[ptr++] = Math.round(y * 255);
    rasterBuffer[ptr++] = Math.round(k * 255);
    rasterBuffer[ptr++] = a > 20 ? 255 : 0; // White underbase mask channel
  }

  // 4. Calculate Checksum (Fletcher-32 over raster data)
  let sum1 = 0xffff;
  let sum2 = 0xffff;
  for (let i = 0; i < rasterBuffer.length; i++) {
    sum1 = (sum1 + rasterBuffer[i]) % 65535;
    sum2 = (sum2 + sum1) % 65535;
  }
  const checksum = (sum2 << 16) | sum1;

  const checksumBuffer = new ArrayBuffer(4);
  new DataView(checksumBuffer).setUint32(0, checksum, true);

  // 5. DTX Footer (Parameters Block 16 bytes)
  const footerBuffer = new ArrayBuffer(16);
  const footView = new DataView(footerBuffer);
  footView.setUint32(0, 0x5658454c, true); // VXEL magic marker 'VXEL'
  footView.setUint16(4, pressTempC, true);
  footView.setUint16(6, pressDurationSec, true);

  // Combine All Sections into Single Binary Uint8Array
  const totalSize =
    headerSignature.length +
    metaBuffer.byteLength +
    rasterBuffer.length +
    checksumBuffer.byteLength +
    footerBuffer.byteLength;

  const dtxBinary = new Uint8Array(totalSize);
  let offset = 0;

  dtxBinary.set(headerSignature, offset);
  offset += headerSignature.length;

  dtxBinary.set(new Uint8Array(metaBuffer), offset);
  offset += metaBuffer.byteLength;

  dtxBinary.set(rasterBuffer, offset);
  offset += rasterBuffer.length;

  dtxBinary.set(new Uint8Array(checksumBuffer), offset);
  offset += checksumBuffer.byteLength;

  dtxBinary.set(new Uint8Array(footerBuffer), offset);

  return dtxBinary;
}
