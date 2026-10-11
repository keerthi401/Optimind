import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { processDocumentFile } from '../services/document.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { code: 'FILE_REQUIRED', message: 'No file was provided for upload.' },
    });
  }

  const userId = req.user ? req.user.id : 'guest_anon';
  const file = req.file;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const docId = uuidv4();

  // Create document entry
  const newDoc = await Document.create({
    _id: docId,
    id: docId,
    userId,
    name: file.originalname,
    originalFilename: file.originalname,
    fileType: ext,
    sizeBytes: file.size,
    storagePath: file.path,
    status: 'processing',
    chunkCount: 0,
    extractedSnippet: '',
  });

  // Kick off processing
  try {
    const processedDoc = await processDocumentFile({
      docId,
      filePath: file.path,
      fileType: ext,
      userId,
      originalFilename: file.originalname,
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully',
      data: {
        id: processedDoc._id || processedDoc.id,
        name: processedDoc.name,
        fileType: processedDoc.fileType,
        sizeBytes: processedDoc.sizeBytes,
        status: processedDoc.status,
        chunkCount: processedDoc.chunkCount,
        extractedSnippet: processedDoc.extractedSnippet,
        createdAt: processedDoc.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: {
        code: 'EXTRACTION_FAILED',
        message: `File uploaded but extraction failed: ${err.message}`,
      },
    });
  }
});

export const listDocuments = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : 'guest_anon';
  const docs = await Document.find({ userId });

  const formatted = docs.map((d) => ({
    id: d._id || d.id,
    name: d.name,
    fileType: d.fileType,
    sizeBytes: d.sizeBytes,
    status: d.status,
    chunkCount: d.chunkCount,
    extractedSnippet: d.extractedSnippet,
    uploadedAt: d.createdAt,
  }));

  res.status(200).json({
    success: true,
    data: formatted,
  });
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : 'guest_anon';

  const doc = await Document.findById(id);
  if (!doc) {
    return res.status(404).json({
      success: false,
      error: { code: 'DOC_NOT_FOUND', message: 'Document not found.' },
    });
  }

  if (doc.userId !== userId) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have access to this document.' },
    });
  }

  const chunks = await DocumentChunk.find({ documentId: id, userId });

  res.status(200).json({
    success: true,
    data: {
      ...doc,
      chunks: chunks.map((c) => ({
        chunkIndex: c.chunkIndex,
        content: c.content,
        pageNumber: c.pageNumber,
      })),
    },
  });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : 'guest_anon';

  const doc = await Document.findById(id);
  if (!doc) {
    return res.status(404).json({
      success: false,
      error: { code: 'DOC_NOT_FOUND', message: 'Document not found.' },
    });
  }

  if (doc.userId !== userId) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You cannot delete another user’s document.' },
    });
  }

  // Delete physical file
  if (doc.storagePath && fs.existsSync(doc.storagePath)) {
    try {
      fs.unlinkSync(doc.storagePath);
    } catch (e) {
      console.warn(`[File Unlink Warning] Could not delete ${doc.storagePath}`);
    }
  }

  // Delete chunks and record
  await DocumentChunk.deleteMany({ documentId: id });
  await Document.deleteOne({ _id: id });

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully',
  });
});
