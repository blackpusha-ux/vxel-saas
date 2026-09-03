import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

// ---------------------------------------------------------------------------
// Sanitization Helper for SVG (Prevents XSS & Malicious Payloads)
// ---------------------------------------------------------------------------
function sanitizeSvgString(svg: string): string {
  if (!svg) return '';
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:[^"']*/gi, '');
}

/**
 * Normalise un base64 en retirant le préfixe data URI si présent.
 * Retourne { pureBase64, mime }
 */
function parseBase64(raw: string | undefined, fallbackMime = 'image/png'): { data: string; mime: string } {
  if (!raw) return { data: '', mime: fallbackMime };
  const match = raw.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { data: match[2], mime: match[1] };
  }
  return { data: raw, mime: fallbackMime };
}

// ---------------------------------------------------------------------------
// GET /api/projects
// Récupère la liste des projets appartenant à l'utilisateur connecté (Anti-IDOR)
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    // Récupère les 50 derniers projets de l'utilisateur sans charger les lourds buffers de fichiers
    const projects = await Project.find({ clerkId: user.id })
      .select('_id toolType originalFileName processedFileName originalFileMime processedFileMime fileSize status creditsUsed metadata createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('Erreur récupération projets :', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects
// Enregistre un projet sécurisé pour l'utilisateur connecté
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      'inconnu@vexel.dtf';

    await connectDB();
    const body = await req.json();

    const {
      toolType,
      originalFileName,
      processedFileName,
      originalFileData: rawOriginal,
      processedFileData: rawProcessed,
      originalFileMime: mimeOrig,
      processedFileMime: mimeProc,
      fileSize,
      status,
      creditsUsed,
      metadata,
    } = body;

    // Parse base64 data
    let { data: originalFileData, mime: originalFileMime } = parseBase64(rawOriginal, mimeOrig || 'image/png');
    let { data: processedFileData, mime: processedFileMime } = parseBase64(rawProcessed, mimeProc || 'image/png');

    // Security validation: max 50MB per base64 payload
    if (originalFileData.length > 70 * 1024 * 1024 || processedFileData.length > 70 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Taille de fichier excessive' }, { status: 413 });
    }

    // SVG Security Sanitization if vector
    if (processedFileMime === 'image/svg+xml' && processedFileData) {
      try {
        const decodedSvg = Buffer.from(processedFileData, 'base64').toString('utf-8');
        const cleanSvg = sanitizeSvgString(decodedSvg);
        processedFileData = Buffer.from(cleanSvg, 'utf-8').toString('base64');
      } catch {
        // En cas d'erreur de décodage, continuer
      }
    }

    const project = await Project.create({
      clerkId: user.id,
      userEmail: email,
      toolType: toolType || 'dtf-studio',
      originalFileName: originalFileName || 'visuel-source.png',
      processedFileName: processedFileName || 'visuel-traite.png',
      originalFileData,
      processedFileData,
      originalFileMime,
      processedFileMime,
      fileSize: fileSize || 0,
      status: status || 'completed',
      creditsUsed: typeof creditsUsed === 'number' ? creditsUsed : 1,
      metadata: metadata || {},
    });

    return NextResponse.json({
      success: true,
      projectId: project._id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('Erreur enregistrement projet :', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects
// Supprime un projet en vérifiant formellement l'autorisation (Anti-BOLA)
// ---------------------------------------------------------------------------
export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || id.length < 10) {
      return NextResponse.json({ success: false, error: 'ID projet manquant' }, { status: 400 });
    }

    await connectDB();

    // Supprime uniquement si le projet appartient à cet utilisateur
    const deleted = await Project.findOneAndDelete({ _id: id, clerkId: user.id });

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Projet introuvable ou non autorisé' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
