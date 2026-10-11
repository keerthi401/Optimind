import express from 'express';
import { askDocumentRAG } from '../controllers/rag.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/ask', optionalAuth, askDocumentRAG);

export default router;
