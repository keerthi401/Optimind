import express from 'express';
import { explainConcept, generateVisual, saveExplanation, getSavedExplanations } from '../controllers/ai.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/explain', optionalAuth, explainConcept);
router.post('/visualize', optionalAuth, generateVisual);
router.post('/save-explanation', optionalAuth, saveExplanation);
router.get('/saved', optionalAuth, getSavedExplanations);

export default router;
