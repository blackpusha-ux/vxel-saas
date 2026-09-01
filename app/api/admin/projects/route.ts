import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';
import { verifyAdminServer } from '@/lib/admin-auth';

export async function GET(req: Request) {
  try {
    const authCheck = await verifyAdminServer();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status || 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const toolType = searchParams.get('toolType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const query: Record<string, unknown> = {};

    if (toolType && toolType !== 'all') {
      query.toolType = toolType;
    }

    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: 'i' } },
        { originalFileName: { $regex: search, $options: 'i' } },
        { processedFileName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Project.countDocuments(query);

    // On inclut les base64 pour afficher les miniatures dans l'admin
    // (limite : max 100 projets par page pour éviter une réponse trop lourde)
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Ajoute des flags booléens pour que le frontend sache si les fichiers existent
    const enriched = projects.map((p) => ({
      ...p,
      hasOriginalFile: !!(p.originalFileData && p.originalFileData.length > 10),
      hasProcessedFile: !!(p.processedFileData && p.processedFileData.length > 10),
    }));

    return NextResponse.json({
      success: true,
      projects: enriched,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('Erreur API Admin GET Projects :', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authCheck = await verifyAdminServer();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status || 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Identifiant de projet manquant' }, { status: 400 });
    }

    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Projet non trouvé' }, { status: 404 });
    }

    console.log(`[AdminAPI] Projet supprimé : ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Projet supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Erreur API Admin DELETE Project :', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
