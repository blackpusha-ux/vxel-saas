import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscription extends Document {
  clerkId: string;
  stripeId?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: string;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    clerkId: { type: String, required: true },
    stripeId: { type: String },
    plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], required: true },
    status: { type: String, required: true },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
export default Subscription;
