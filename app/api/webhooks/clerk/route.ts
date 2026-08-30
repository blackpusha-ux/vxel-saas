import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const evtType = payload.type;

    if (evtType === 'user.created') {
      const data = payload.data;
      const clerkId = data.id;
      const primaryEmail = data.email_addresses?.[0]?.email_address || '';
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      const name = `${firstName} ${lastName}`.trim();

      await connectDB();

      await User.findOneAndUpdate(
        { clerkId },
        {
          clerkId,
          email: primaryEmail,
          name,
          $setOnInsert: { credits: 10, isBanned: false, role: 'user', plan: 'free' },
        },
        { upsert: true, new: true }
      );

      console.log(`Utilisateur Clerk ${clerkId} (${primaryEmail}) synchronisé dans MongoDB avec 10 crédits.`);
    }

    return NextResponse.json({ success: true, message: 'Webhook traité avec succès' });
  } catch (e: any) {
    console.error('Erreur Webhook Clerk:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
