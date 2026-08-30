import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';

    // Verify Admin authorization
    if (email !== 'contact.tbalbiza@gmail.com' && email !== 'contact@vexel.com') {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (e: any) {
    console.error('Erreur API admin/users:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
