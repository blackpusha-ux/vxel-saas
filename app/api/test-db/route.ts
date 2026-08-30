import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  const rawUri = process.env.MONGO_URI || 'NON_DEFINI';
  const safeUri = rawUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');

  try {
    await connectDB();
    const db = mongoose.connection.db;
    const collections = db ? await db.listCollections().toArray() : [];
    
    return NextResponse.json({ 
      success: true, 
      message: 'Connexion MongoDB Mongoose OK',
      uriUsed: safeUri,
      collections: collections.map((c: any) => c.name)
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