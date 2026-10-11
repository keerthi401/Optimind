import express from 'express';
import { generateQuiz, listQuizzes, getQuizById, submitQuiz, getRecentAttempts } from '../controllers/quiz.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/generate', optionalAuth, generateQuiz);
router.get('/', optionalAuth, listQuizzes);
router.get('/attempts/recent', optionalAuth, getRecentAttempts);
router.get('/:id', optionalAuth, getQuizById);
router.post('/:id/submit', optionalAuth, submitQuiz);

export default router;
