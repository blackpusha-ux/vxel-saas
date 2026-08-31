import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  clerkId: string;
  userEmail: string;
  toolType: 'dtf-studio' | 'vectorizer' | 'planche';
  originalFileName?: string;
  originalFileUrl?: string;
  processedFileName?: string;
  processedFileUrl?: string;
  fileSize?: number;
  status: 'completed' | 'failed' | 'processing';
  creditsUsed: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

const ProjectSchema: Schema<IProject> = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, index: true },
    toolType: {
      type: String,
      enum: ['dtf-studio', 'vectorizer', 'planche'],
      required: true,
    },
    originalFileName: { type: String, default: '' },
    originalFileUrl: { type: String, default: '' },
    processedFileName: { type: String, default: '' },
    processedFileUrl: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['completed', 'failed', 'processing'],
      default: 'completed',
    },
    creditsUsed: { type: Number, default: 1 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
