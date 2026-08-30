import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  clerkId: string;
  fileName: string;
  type: 'optimization' | 'planche';
  status: string;
  creditsUsed: number;
  fileUrl?: string;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    clerkId: { type: String, required: true },
    fileName: { type: String, required: true },
    type: { type: String, enum: ['optimization', 'planche'], default: 'optimization' },
    status: { type: String, default: 'completed' },
    creditsUsed: { type: Number, default: 1 },
    fileUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
