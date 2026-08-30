import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deductCredits } from '@/lib/credits';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const result = await deductCredits(userId, 1);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Crédits insuffisants !' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      creditsRemaining: result.creditsRemaining,
    });
  } catch (e: any) {
    console.error('Erreur consume-credit:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}