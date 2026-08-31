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
    const { clerkId, amount, action } = await req.json();

    if (!clerkId || typeof amount !== 'number') {
      return NextResponse.json({ success: false, error: 'Paramètres clerkId ou amount invalides' }, { status: 400 });
    }

    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId,
        email: 'user@vexel.dtf',
        credits: 0,
      });
    }

    if (action === 'set') {
      user.credits = Math.max(0, amount);
    } else {
      // Default: add
      user.credits = Math.max(0, (user.credits || 0) + amount);
    }

    await user.save();

    console.log(`[AdminAPI] Crédits mis à jour pour ${clerkId} : ${user.credits} (action: ${action || 'add'}, val: ${amount})`);

    return NextResponse.json({
      success: true,
      credits: user.credits,
      message: `Crédits mis à jour avec succès : ${user.credits} crédits`,
    });
  } catch (error: any) {
    console.error('Erreur API Admin Credits :', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
