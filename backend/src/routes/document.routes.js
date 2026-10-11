import express from 'express';
import { uploadDocument, listDocuments, getDocumentById, deleteDocument } from '../controllers/document.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/upload', optionalAuth, upload.single('file'), uploadDocument);
router.get('/', optionalAuth, listDocuments);
router.get('/:id', optionalAuth, getDocumentById);
router.delete('/:id', optionalAuth, deleteDocument);

export default router;
