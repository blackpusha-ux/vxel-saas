import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const amount = parseInt(body.amount || body.creditsToAdd) || 0;

    if (amount <= 0) {
      return NextResponse.json({ success: false, error: 'Nombre de crédits invalide' }, { status: 400 });
    }

    const db = await connectDB();
    const usersCol = db.collection('users');

    const result = await usersCol.findOneAndUpdate(
      { $or: [{ clerkId: userId }, { userId: userId }] },
      {
        $inc: { credits: amount },
        $set: { updatedAt: new Date().toISOString() },
        $setOnInsert: { clerkId: userId, userId: userId, createdAt: new Date().toISOString() }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const updatedCredits = result?.credits ?? amount;

    return NextResponse.json({
      success: true,
      credits: updatedCredits,
      creditsRemaining: updatedCredits,
      creditsAdded: amount,
    });
  } catch (e: any) {
    console.error('Erreur add-credits:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}