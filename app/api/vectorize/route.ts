import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const optionsJsonStr = (formData.get('options') as string) || '{}';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const fileExt = path.extname(file.name) || '.png';
    const inputPath = path.join(tempDir, `vxel_in_${timestamp}${fileExt}`);
    const outputSvgPath = path.join(tempDir, `vxel_out_${timestamp}.svg`);
    const outputPngPath = path.join(tempDir, `vxel_out_${timestamp}.png`);

    fs.writeFileSync(inputPath, buffer);

    const scriptPath = path.join(process.cwd(), 'app', 'api', 'vectorize', 'potrace_processor.py');
    const startTime = Date.now();

    try {
      const { stdout } = await execFileAsync('python', [
        scriptPath,
        inputPath,
        outputSvgPath,
        outputPngPath,
        optionsJsonStr,
      ]);

      let procStats = {};
      try {
        procStats = JSON.parse(stdout);
      } catch (e) {
        procStats = {};
      }

      let svgContent = '';
      let pngBase64 = '';

      if (fs.existsSync(outputSvgPath)) {
        svgContent = fs.readFileSync(outputSvgPath, 'utf-8');
      }

      if (fs.existsSync(outputPngPath)) {
        const pngBuf = fs.readFileSync(outputPngPath);
        pngBase64 = `data:image/png;base64,${pngBuf.toString('base64')}`;
      }

      // Cleanup temp files
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputSvgPath)) fs.unlinkSync(outputSvgPath);
      if (fs.existsSync(outputPngPath)) fs.unlinkSync(outputPngPath);

      const durationMs = Date.now() - startTime;

      if (!svgContent) {
        throw new Error('SVG output was not generated');
      }

      return NextResponse.json({
        success: true,
        svg: svgContent,
        pngBase64,
        stats: {
          durationMs,
          engine: 'VTracer & Potrace Server IA',
          ...procStats,
        },
      });
    } catch (procErr: any) {
      console.warn('Server VTracer/Potrace execution failed:', procErr?.message);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputSvgPath)) fs.unlinkSync(outputSvgPath);
      if (fs.existsSync(outputPngPath)) fs.unlinkSync(outputPngPath);

      return NextResponse.json(
        {
          success: false,
          fallbackRequired: true,
          error: procErr?.message || 'Server processor execution error',
        },
        { status: 200 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
