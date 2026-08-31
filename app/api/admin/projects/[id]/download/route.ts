import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import { verifyAdminServer } from '@/lib/admin-auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authCheck = await verifyAdminServer();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status || 403 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    await connectDB();
    const project = await Project.findById(projectId);

    if (!project) {
      return NextResponse.json({ success: false, error: 'Projet introuvable' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'processed';

    const targetUrl = type === 'original' ? project.originalFileUrl : project.processedFileUrl;
    const targetName = type === 'original' ? project.originalFileName : project.processedFileName;

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: 'Fichier indisponible ou non hébergé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      downloadUrl: targetUrl,
      fileName: targetName || 'fichier-export.png',
      toolType: project.toolType,
    });
  } catch (error: any) {
    console.error('Erreur API Admin Download Project :', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
