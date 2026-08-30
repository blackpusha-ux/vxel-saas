import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié. Veuillez vous connecter.' }, { status: 401 });
    }

    const body = await req.json();
    const { plan, credits, price } = body;
    const addedCredits = parseInt(credits) || 0;

    if (addedCredits <= 0) {
      return NextResponse.json({ success: false, error: 'Nombre de crédits invalide' }, { status: 400 });
    }

    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
    const name = clerkUser?.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : 'Utilisateur';

    await connectDB();

    // Find or create user
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      user = await User.create({
        clerkId: userId,
        email: primaryEmail,
        name,
        credits: 10 + addedCredits,
        plan: plan || 'free',
      });
    } else {
      user.credits = (user.credits || 0) + addedCredits;
      if (plan && ['starter', 'pro', 'enterprise'].includes(plan)) {
        user.plan = plan;
      }
      await user.save();
    }

    console.log(`✅ Crédits ajoutés pour ${user.email}: +${addedCredits} crédits (Total: ${user.credits})`);

    return NextResponse.json({
      success: true,
      credits: user.credits,
      plan: user.plan,
      message: `${addedCredits} crédits ajoutés avec succès !`,
    });
  } catch (e: any) {
    console.error('Erreur API credits/purchase:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
