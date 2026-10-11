import mongoose from 'mongoose';
import { createStore } from './store.js';

const DocumentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    originalFilename: { type: String, required: true },
    fileType: { type: String, required: true, enum: ['pdf', 'txt', 'png', 'jpg', 'jpeg'] },
    sizeBytes: { type: Number, required: true },
    storagePath: { type: String, required: true },
    status: { type: String, enum: ['ready', 'processing', 'error'], default: 'processing' },
    chunkCount: { type: Number, default: 0 },
    extractedSnippet: { type: String, default: '' },
    fullText: { type: String, default: '' },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

const MongooseDocModel = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
export const Document = createStore('Document', MongooseDocModel);
export default Document;
