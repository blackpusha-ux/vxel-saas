import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || '';

    const db = await connectDB();
    const usersCol = db.collection('users');

    let user = await usersCol.findOne({
      $or: [{ clerkId: userId }, { userId: userId }],
    });

    if (!user) {
      const newUser = {
        clerkId: userId,
        userId: userId,
        email: primaryEmail,
        credits: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await usersCol.insertOne(newUser);
      return NextResponse.json({ success: true, credits: 10, email: primaryEmail });
    }

    const currentCredits = typeof user.credits === 'number' ? user.credits : 10;
    return NextResponse.json({
      success: true,
      credits: currentCredits,
      email: user.email || primaryEmail,
    });
  } catch (e: any) {
    console.error('Erreur API credits:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}