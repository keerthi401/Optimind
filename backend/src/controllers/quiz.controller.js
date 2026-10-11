import { createQuizRecord, evaluateQuizSubmission, sanitizeQuizForStudent } from '../services/quiz.service.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, subject, difficulty, documentId } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Topic is required for quiz generation.' },
    });
  }

  const userId = req.user ? req.user.id : 'guest_anon';

  const sanitizedQuiz = await createQuizRecord({
    userId,
    topic: topic.trim(),
    subject: subject || 'general',
    difficulty: difficulty || 'intermediate',
    documentId: documentId || null,
  });

  res.status(201).json({
    success: true,
    message: 'Quiz generated successfully',
    data: sanitizedQuiz,
  });
});

export const listQuizzes = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : 'guest_anon';
  const quizzes = await Quiz.find({ userId });

  res.status(200).json({
    success: true,
    data: quizzes.map((q) => sanitizeQuizForStudent(q)),
  });
});

export const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quiz = await Quiz.findById(id);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      error: { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found.' },
    });
  }

  res.status(200).json({
    success: true,
    data: sanitizeQuizForStudent(quiz),
  });
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Answers must be an array of selected option indices.' },
    });
  }

  const userId = req.user ? req.user.id : 'guest_anon';

  const evaluation = await evaluateQuizSubmission({
    userId,
    quizId: id,
    answers,
  });

  res.status(200).json({
    success: true,
    message: 'Quiz evaluated successfully',
    data: evaluation,
  });
});

export const getRecentAttempts = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : 'guest_anon';
  const attempts = await QuizAttempt.find({ userId });

  res.status(200).json({
    success: true,
    data: attempts.slice(-10).reverse(),
  });
});
