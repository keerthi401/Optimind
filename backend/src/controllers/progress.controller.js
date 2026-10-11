import QuizAttempt from '../models/QuizAttempt.js';
import Roadmap from '../models/Roadmap.js';
import Document from '../models/Document.js';
import Explanation from '../models/Explanation.js';
import LearningProgress from '../models/LearningProgress.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { v4 as uuidv4 } from 'uuid';

export const getProgressSummary = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : 'guest_anon';

  // 1. Fetch user records
  const user = await User.findById(userId);
  const quizAttempts = await QuizAttempt.find({ userId });
  const roadmaps = await Roadmap.find({ userId });
  const documents = await Document.find({ userId });
  const explanations = await Explanation.find({ userId });
  const activities = await LearningProgress.find({ userId });

  // 2. Compute measured metrics
  const totalQuizzes = quizAttempts.length;
  const avgQuizScore = totalQuizzes > 0
    ? Math.round(quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
    : 0;

  // Collect weak topics from actual incorrect quiz answers
  const weakTopicsSet = new Set();
  quizAttempts.forEach((attempt) => {
    (attempt.weakTopics || []).forEach((t) => weakTopicsSet.add(t));
  });
  const weakTopics = Array.from(weakTopicsSet);

  // Derive revision recommendations strictly from weak topics
  const revisionRecommendations = weakTopics.map((topic) => ({
    topic,
    reason: 'Identified from incorrect answers in diagnostic assessments',
    action: `Review foundational concepts and retake quiz for ${topic}`,
  }));

  const activeRoadmap = roadmaps.length > 0 ? roadmaps[roadmaps.length - 1] : null;

  // Calculate estimated study hours
  const activityHours = (activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0) / 60);
  const baseHours = user ? user.totalHoursStudied : 0;
  const totalHoursStudied = Number((baseHours + activityHours + totalQuizzes * 0.25).toFixed(1));

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalHoursStudied,
        learningStreakDays: user ? user.learningStreakDays : 1,
        completedLessonsCount: explanations.length + (activeRoadmap ? activeRoadmap.milestones.filter((m) => m.status === 'completed').length : 0),
        averageQuizScore: avgQuizScore,
        totalQuizzesTaken: totalQuizzes,
        documentsIngestedCount: documents.length,
      },
      activeRoadmap: activeRoadmap
        ? {
            id: activeRoadmap._id || activeRoadmap.id,
            goal: activeRoadmap.goal,
            overallProgress: activeRoadmap.overallProgress,
            totalMilestones: activeRoadmap.milestones.length,
            completedMilestones: activeRoadmap.milestones.filter((m) => m.status === 'completed').length,
          }
        : null,
      weakTopics,
      revisionRecommendations,
      recentAttempts: quizAttempts.slice(-5).reverse().map((a) => ({
        id: a._id || a.id,
        title: a.title,
        score: a.score,
        totalQuestions: a.totalQuestions,
        percentage: a.percentage,
        completedAt: a.createdAt,
      })),
      recentActivities: activities.slice(-10).reverse().map((act) => ({
        id: act._id || act.id,
        topic: act.topic,
        activityType: act.activityType,
        durationMinutes: act.durationMinutes,
        masteryScore: act.masteryScore,
        date: act.createdAt,
      })),
    },
  });
});

export const logActivity = asyncHandler(async (req, res) => {
  const { topic, activityType, durationMinutes = 15, masteryScore = 80 } = req.body;

  if (!topic || !activityType) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Topic and activityType are required.' },
    });
  }

  const userId = req.user ? req.user.id : 'guest_anon';

  const entry = await LearningProgress.create({
    id: uuidv4(),
    userId,
    topic,
    activityType,
    durationMinutes: Number(durationMinutes) || 15,
    masteryScore: Number(masteryScore) || 80,
  });

  res.status(201).json({
    success: true,
    message: 'Learning activity logged',
    data: entry,
  });
});
