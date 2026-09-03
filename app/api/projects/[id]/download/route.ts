import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

// ---------------------------------------------------------------------------
// GET /api/projects/[id]/download?type=original|processed
// Téléchargement privé et sécurisé du fichier projet par son propriétaire (Anti-IDOR)
// ---------------------------------------------------------------------------
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    if (!projectId || projectId.length < 10) {
      return NextResponse.json({ success: false, error: 'ID projet invalide' }, { status: 400 });
    }

    await connectDB();

    // Vérification stricte de propriété (Anti-BOLA/IDOR)
    const project = await Project.findOne({ _id: projectId, clerkId: user.id }).lean();

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projet introuvable ou accès non autorisé' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'processed';

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

    if (!base64Data || base64Data.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Fichier non disponible pour ce projet' },
        { status: 404 }
      );
    }

    let binaryData: Uint8Array;
    try {
      binaryData = new Uint8Array(Buffer.from(base64Data, 'base64'));
    } catch {
      return NextResponse.json({ success: false, error: 'Données corrompues' }, { status: 500 });
    }

    const headers = new Headers({
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': binaryData.byteLength.toString(),
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    });

    return new Response(binaryData, { status: 200, headers });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('Erreur API Download Project :', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
