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
    const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || '';

    await connectDB();

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      user = await User.create({
        clerkId: userId,
        email: primaryEmail,
        name: clerkUser?.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : '',
        credits: 10,
      });
    }

    return NextResponse.json({
      success: true,
      credits: user.credits,
      email: user.email || primaryEmail,
    });
  } catch (e: any) {
    console.error('Erreur API credits:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}