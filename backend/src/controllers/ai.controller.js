import { generateConceptExplanation, generateVisualLesson } from '../services/ai.service.js';
import Explanation from '../models/Explanation.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { v4 as uuidv4 } from 'uuid';

export const explainConcept = asyncHandler(async (req, res) => {
  const { topic, subject = 'general', difficulty = 'intermediate', format = 'step_by_step' } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Topic or question is required.' },
    });
  }

  const result = await generateConceptExplanation({ topic, subject, difficulty, format });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const generateVisual = asyncHandler(async (req, res) => {
  const { topic, subject = 'algorithms', difficulty = 'intermediate' } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Topic is required for visual generation.' },
    });
  }

  const result = await generateVisualLesson({ topic, subject, difficulty });

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const saveExplanation = asyncHandler(async (req, res) => {
  const { topic, subject, difficulty, format, summary, steps, terminology, analogy } = req.body;

  if (!topic || !summary) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Topic and summary are required to save explanation.' },
    });
  }

  const userId = req.user ? req.user.id : 'guest_anon';

  const saved = await Explanation.create({
    id: uuidv4(),
    userId,
    topic,
    subject: subject || 'general',
    difficulty: difficulty || 'intermediate',
    format: format || 'step_by_step',
    summary,
    steps: steps || [],
    terminology: terminology || [],
    analogy: analogy || '',
    isSaved: true,
  });

  res.status(201).json({
    success: true,
    message: 'Explanation saved successfully',
    data: saved,
  });
});

export const getSavedExplanations = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : 'guest_anon';
  const explanations = await Explanation.find({ userId });

  res.status(200).json({
    success: true,
    data: explanations,
  });
});
