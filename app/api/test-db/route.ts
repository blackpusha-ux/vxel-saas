import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
  const rawUri = process.env.MONGO_URI || 'NON_DEFINI';
  const safeUri = rawUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');

  try {
    const db = await connectDB();
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Connexion MongoDB OK',
      uriUsed: safeUri,
      collections: collections.map(c => c.name)
    });
  } catch (e: any) {
    console.error('Erreur MongoDB:', e);
    return NextResponse.json({ 
      success: false, 
      uriUsed: safeUri,
      error: e.message 
    }, { status: 500 });
  }
}