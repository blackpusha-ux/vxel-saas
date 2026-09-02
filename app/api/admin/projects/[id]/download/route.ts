import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import { verifyAdminServer } from '@/lib/admin-auth';

// ---------------------------------------------------------------------------
// GET /api/admin/projects/[id]/download?type=original|processed
//
// Retourne le fichier réel en binaire (blob) à partir des données base64
// stockées dans MongoDB. Plus besoin d'hébergement externe.
//
// Réponse : fichier binaire avec headers Content-Type + Content-Disposition
// ---------------------------------------------------------------------------
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // --- Vérification admin ---
    const authCheck = await verifyAdminServer();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status || 403 }
      );
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    if (!projectId || projectId.length < 10) {
      return NextResponse.json({ success: false, error: 'ID projet invalide' }, { status: 400 });
    }

    await connectDB();

    // Récupère le projet — inclut les champs base64 (potentiellement larges)
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return NextResponse.json({ success: false, error: 'Projet introuvable' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'processed';

    // --- Sélection du fichier selon le type ---
    const isOriginal = type === 'original';
    const base64Data: string = isOriginal
      ? (project.originalFileData || '')
      : (project.processedFileData || '');
    const mime: string = isOriginal
      ? (project.originalFileMime || 'image/png')
      : (project.processedFileMime || 'image/png');
    const fileName: string = isOriginal
      ? (project.originalFileName || 'original.png')
      : (project.processedFileName || 'export.png');

    // --- Vérification disponibilité ---
    if (!base64Data || base64Data.length < 10) {
      // Fichier manquant — peut être un ancien projet sans base64
      return NextResponse.json(
        {
          success: false,
          error: 'Fichier non disponible pour ce projet (projet antérieur à la mise à jour)',
          legacy: true,
        },
        { status: 404 }
      );
    }

    // --- Décodage base64 → buffer binaire ---
    let binaryData: Uint8Array;
    try {
      binaryData = new Uint8Array(Buffer.from(base64Data, 'base64'));
    } catch {
      return NextResponse.json({ success: false, error: 'Données fichier corrompues' }, { status: 500 });
    }

    // --- Construction de la réponse binaire ---
    const headers = new Headers({
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': binaryData.byteLength.toString(),
      'Cache-Control': 'no-store',
    });

    console.log(
      `[AdminDownload] Projet ${projectId} — type=${type}, mime=${mime}, ` +
        `taille=${Math.round(binaryData.byteLength / 1024)}KB, fichier=${fileName}`
    );

    return new Response(binaryData, { status: 200, headers });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('Erreur API Admin Download Project :', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
