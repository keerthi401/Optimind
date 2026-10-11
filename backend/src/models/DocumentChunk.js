import mongoose from 'mongoose';
import { createStore } from './store.js';

const DocumentChunkSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    pageNumber: { type: Number, default: 1 },
    embedding: { type: [Number], default: [] },
  },
  { timestamps: true }
);

const MongooseChunkModel = mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', DocumentChunkSchema);
export const DocumentChunk = createStore('DocumentChunk', MongooseChunkModel);
export default DocumentChunk;
