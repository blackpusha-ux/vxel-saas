import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier image fourni' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Fichier trop lourd (max 50 Mo)' }, { status: 400 });
    }

    const apiKeyId = process.env.VECTORIZER_AI_API_KEY_ID || process.env.VECTORIZER_AI_API_KEY || '';
    const apiSecret = process.env.VECTORIZER_AI_API_SECRET || '';

    // Check if Vectorizer.ai credentials exist
    if (!apiKeyId) {
      return NextResponse.json(
        {
          success: false,
          noKey: true,
          fallbackRequired: true,
          error: 'Clé API Vectorizer.ai non configurée dans .env.local (VECTORIZER_AI_API_KEY)',
        },
        { status: 200 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prepare Vectorizer.ai API FormData
    const apiFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type || 'image/png' });
    apiFormData.append('image', blob, file.name);
    apiFormData.append('mode', 'color');
    apiFormData.append('precision', 'high');
    apiFormData.append('background', 'transparent');

    const authHeader = apiSecret
      ? `Basic ${Buffer.from(`${apiKeyId}:${apiSecret}`).toString('base64')}`
      : `Bearer ${apiKeyId}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const startTime = Date.now();

    const apiRes = await fetch('https://vectorizer.ai/api/v1/vectorize', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: apiFormData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.warn('Vectorizer.ai API call failed:', apiRes.status, errText);

      return NextResponse.json(
        {
          success: false,
          fallbackRequired: true,
          error: `API Vectorizer.ai Erreur (${apiRes.status}): ${errText || 'Quota dépassé ou clé invalide'}`,
        },
        { status: 200 }
      );
    }

    const svgContent = await apiRes.text();
    const durationMs = Date.now() - startTime;

    // Count paths & colors in SVG
    const pathMatches = svgContent.match(/<path/g);
    const colorMatches = svgContent.match(/fill="#[a-fA-F0-9]{3,6}"/g);

    const totalPaths = pathMatches ? pathMatches.length : 1;
    const uniqueColors = colorMatches ? new Set(colorMatches).size : 8;

    return NextResponse.json({
      success: true,
      svg: svgContent,
      stats: {
        durationMs,
        engine: 'Vectorizer.ai Official API (Pro HD)',
        total_paths: totalPaths,
        colors_count: uniqueColors,
      },
    });
  } catch (err: any) {
    console.warn('Vectorizer API Route exception:', err?.message);
    return NextResponse.json(
      {
        success: false,
        fallbackRequired: true,
        error: err?.name === 'AbortError' ? 'Timeout API Vectorizer.ai (30s)' : err?.message || 'Erreur interne',
      },
      { status: 200 }
    );
  }
}
