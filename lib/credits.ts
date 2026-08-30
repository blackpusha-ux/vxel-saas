import { connectDB } from './db';
import User from '@/models/User';

export async function getCreditBalance(clerkId: string): Promise<number> {
  await connectDB();
  const user = await User.findOne({ clerkId });
  if (!user) return 0;
  return user.credits || 0;
}

export async function addCredits(clerkId: string, amount: number): Promise<number> {
  await connectDB();
  const user = await User.findOneAndUpdate(
    { clerkId },
    { $inc: { credits: amount } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return user.credits;
}

export async function deductCredits(clerkId: string, amount: number): Promise<{ success: boolean; creditsRemaining: number }> {
  await connectDB();
  const user = await User.findOne({ clerkId });
  if (!user || user.credits < amount) {
    return { success: false, creditsRemaining: user ? user.credits : 0 };
  }

  user.credits -= amount;
  await user.save();
  return { success: true, creditsRemaining: user.credits };
}
