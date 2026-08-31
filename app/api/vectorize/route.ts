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
    const optionsJson = (formData.get('options') as string) || '{}';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 50MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempDir = os.tmpdir();
    const fileExt = path.extname(file.name) || '.png';
    const inputPath = path.join(tempDir, `vxel_vector_${Date.now()}${fileExt}`);
    const outputPath = path.join(tempDir, `vxel_vector_${Date.now()}.svg`);

    fs.writeFileSync(inputPath, buffer);

    const scriptPath = path.join(process.cwd(), 'app', 'api', 'vectorize', 'potrace_processor.py');
    const startTime = Date.now();

    try {
      // Execute Python processor
      await execFileAsync('python', [scriptPath, inputPath, outputPath, optionsJson]);

      if (fs.existsSync(outputPath)) {
        const svgContent = fs.readFileSync(outputPath, 'utf-8');

        // Cleanup
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

        const durationMs = Date.now() - startTime;

        return NextResponse.json({
          success: true,
          svg: svgContent,
          stats: {
            durationMs,
            engine: 'potrace_python',
          },
        });
      } else {
        throw new Error('Output SVG was not created by Python script');
      }
    } catch (procErr: any) {
      console.warn('Python vectorizer failed, falling back to client worker:', procErr?.message);
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

      return NextResponse.json(
        {
          success: false,
          fallbackRequired: true,
          error: procErr?.message || 'Python server processor error',
        },
        { status: 200 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
