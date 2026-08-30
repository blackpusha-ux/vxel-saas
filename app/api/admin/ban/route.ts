import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';

    if (email !== 'contact.tbalbiza@gmail.com' && email !== 'contact@vexel.com') {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    const { clerkId: targetClerkId, isBanned } = body;

    if (!targetClerkId || typeof isBanned !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Paramètres invalides' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { clerkId: targetClerkId },
      { $set: { isBanned } },
      { new: true }
    );

    return NextResponse.json({ success: true, isBanned: user?.isBanned });
  } catch (e: any) {
    console.error('Erreur API admin/ban:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
