import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

// ---------------------------------------------------------------------------
// POST /api/projects
// Enregistre un projet avec les fichiers en base64 directement dans MongoDB.
// Payload attendu :
//   toolType             : 'dtf-studio' | 'vectorizer' | 'planche'
//   originalFileName     : string (ex: "chat.png")
//   processedFileName    : string (ex: "chat-traite.png")
//   originalFileData     : string (base64 SANS préfixe data:... OU complet)
//   processedFileData    : string (base64 SANS préfixe data:... OU complet)
//   originalFileMime     : string (ex: "image/png") — optionnel, défaut: "image/png"
//   processedFileMime    : string (ex: "image/png" | "image/svg+xml") — optionnel
//   fileSize             : number (octets de l'original) — optionnel
//   status               : 'completed' | 'failed' | 'processing' — optionnel
//   creditsUsed          : number — optionnel, défaut: 1
//   metadata             : object — optionnel
// ---------------------------------------------------------------------------

/**
 * Normalise un base64 en retirant le préfixe data URI si présent.
 * Retourne { pureBase64, mime }
 */
function parseBase64(raw: string | undefined, fallbackMime = 'image/png'): { data: string; mime: string } {
  if (!raw) return { data: '', mime: fallbackMime };
  // Détecte "data:image/png;base64,iVBOR..."
  const match = raw.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { data: match[2], mime: match[1] };
  }
  // Déjà du base64 pur
  return { data: raw, mime: fallbackMime };
}

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
    const { data: originalFileData, mime: originalFileMime } = parseBase64(rawOriginal, mimeOrig || 'image/png');
    const { data: processedFileData, mime: processedFileMime } = parseBase64(rawProcessed, mimeProc || 'image/png');

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

    console.log(
      `[ProjectAPI] Projet ${project._id} enregistré pour ${email} (${toolType}) - ` +
        `original: ${originalFileData ? Math.round(originalFileData.length / 1024) + 'KB' : 'vide'}, ` +
        `processed: ${processedFileData ? Math.round(processedFileData.length / 1024) + 'KB' : 'vide'}`
    );

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
