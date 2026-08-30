import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Project from '@/models/Project';
import User from '@/models/User';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
    const isAdmin = email === 'contact.tbalbiza@gmail.com' || email === 'contact@vexel.com';

    await connectDB();

    // If Admin, list all projects. If normal user, list only their projects.
    const query = isAdmin ? {} : { clerkId: userId };
    const projects = await Project.find(query).sort({ createdAt: -1 }).limit(50).lean();

    // Map user emails if admin
    const usersMap: Record<string, string> = {};
    if (isAdmin) {
      const users = await User.find({}, 'clerkId email').lean();
      users.forEach((u: any) => {
        usersMap[u.clerkId] = u.email;
      });
    }

    const formattedProjects = projects.map((p: any) => ({
      ...p,
      userEmail: usersMap[p.clerkId] || (p.clerkId === userId ? email : p.clerkId),
    }));

    return NextResponse.json({ success: true, projects: formattedProjects });
  } catch (e: any) {
    console.error('Erreur API admin/projects:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
