import express from 'express';
import { getProgressSummary, logActivity } from '../controllers/progress.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/summary', optionalAuth, getProgressSummary);
router.post('/log-activity', optionalAuth, logActivity);

export default router;
