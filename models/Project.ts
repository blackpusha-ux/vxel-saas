import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  clerkId: string;
  userEmail: string;
  toolType: 'dtf-studio' | 'vectorizer' | 'planche';
  // File metadata
  originalFileName?: string;
  processedFileName?: string;
  fileSize?: number;
  // =====================================================================
  // Base64 file data - stored directly in MongoDB for reliable download
  // originalFileData : base64-encoded source image (PNG/JPG/WEBP)
  // processedFileData: base64-encoded processed file (PNG or SVG)
  // =====================================================================
  originalFileData?: string;
  processedFileData?: string;
  // MIME type for correct Content-Type header on download
  originalFileMime?: string;
  processedFileMime?: string;
  // Legacy URL fields (kept for backwards compatibility, not used for download)
  originalFileUrl?: string;
  processedFileUrl?: string;
  status: 'completed' | 'failed' | 'processing';
  creditsUsed: number;
  metadata?: Record<string, unknown>;
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
    processedFileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    // Base64 encoded file content
    originalFileData: { type: String, default: '' },
    processedFileData: { type: String, default: '' },
    originalFileMime: { type: String, default: 'image/png' },
    processedFileMime: { type: String, default: 'image/png' },
    // Legacy URL fields (no longer used for new projects)
    originalFileUrl: { type: String, default: '' },
    processedFileUrl: { type: String, default: '' },
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

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
