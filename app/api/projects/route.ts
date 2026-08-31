import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Project from '@/models/Project';

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress || 'inconnu@vexel.dtf';

    await connectDB();
    const body = await req.json();

    const {
      toolType,
      originalFileName,
      originalFileUrl,
      processedFileName,
      processedFileUrl,
      fileSize,
      status,
      creditsUsed,
      metadata,
    } = body;

    const project = await Project.create({
      clerkId: user.id,
      userEmail: email,
      toolType: toolType || 'dtf-studio',
      originalFileName: originalFileName || 'visuel-source.png',
      originalFileUrl: originalFileUrl || '',
      processedFileName: processedFileName || 'visuel-traite.png',
      processedFileUrl: processedFileUrl || '',
      fileSize: fileSize || 0,
      status: status || 'completed',
      creditsUsed: typeof creditsUsed === 'number' ? creditsUsed : 1,
      metadata: metadata || {},
      createdAt: new Date(),
    });

    console.log(`[ProjectAPI] Projet enregistré avec succès : ${project._id} pour ${email} (${toolType})`);

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: any) {
    console.error('Erreur enregistrement projet :', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
