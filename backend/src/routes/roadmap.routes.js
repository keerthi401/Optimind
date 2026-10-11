import express from 'express';
import { generateRoadmap, getCurrentRoadmap, updateMilestone } from '../controllers/roadmap.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/generate', optionalAuth, generateRoadmap);
router.get('/current', optionalAuth, getCurrentRoadmap);
router.patch('/:id/milestones/:milestoneId', optionalAuth, updateMilestone);

export default router;
