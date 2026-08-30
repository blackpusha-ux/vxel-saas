import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { addCredits } from '@/lib/credits';

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
    const { clerkId: targetClerkId, amount } = body;

    if (!targetClerkId || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: 'Paramètres invalides' }, { status: 400 });
    }

    const newCredits = await addCredits(targetClerkId, amount);

    return NextResponse.json({ success: true, credits: newCredits });
  } catch (e: any) {
    console.error('Erreur API admin/credits:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
