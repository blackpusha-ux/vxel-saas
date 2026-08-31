import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAdminServer } from '@/lib/admin-auth';

export async function POST(req: Request) {
  try {
    const authCheck = await verifyAdminServer();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: authCheck.status || 403 });
    }

    await connectDB();
    const body = await req.json();
    const { clerkId, amount, action, creditsToAdd, creditsExact } = body;

    if (!clerkId) {
      return NextResponse.json({ success: false, error: 'Paramètre clerkId manquant' }, { status: 400 });
    }

    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId,
        email: 'user@vexel.dtf',
        credits: 0,
      });
    }

    // Determine target calculation
    if (typeof creditsExact === 'number' || action === 'set') {
      const targetVal = typeof creditsExact === 'number' ? creditsExact : amount;
      user.credits = Math.max(0, targetVal);
    } else {
      // Default: add creditsToAdd or amount
      const addVal = typeof creditsToAdd === 'number' ? creditsToAdd : (typeof amount === 'number' ? amount : 10);
      user.credits = Math.max(0, (user.credits || 0) + addVal);
    }

    await user.save();

    console.log(`[AdminAPI] Crédits mis à jour pour ${clerkId} : ${user.credits} (compte: ${user.email})`);

    return NextResponse.json({
      success: true,
      credits: user.credits,
      userEmail: user.email,
      message: `✅ Crédits mis à jour avec succès pour ${user.email} (nouveau solde : ${user.credits} crédits)`,
    });
  } catch (error: any) {
    console.error('Erreur API Admin Credits :', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
