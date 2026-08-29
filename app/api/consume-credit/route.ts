import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const db = await connectDB();
    const usersCol = db.collection('users');

    const result = await usersCol.findOneAndUpdate(
      { $or: [{ clerkId: userId }, { userId: userId }], credits: { $gt: 0 } },
      { $inc: { credits: -1 }, $set: { updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      const exists = await usersCol.findOne({ $or: [{ clerkId: userId }, { userId: userId }] });
      if (!exists) {
        return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      return NextResponse.json({ success: false, error: 'Crédits insuffisants !' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      creditsRemaining: result.credits,
    });
  } catch (e: any) {
    console.error('Erreur consume-credit:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}