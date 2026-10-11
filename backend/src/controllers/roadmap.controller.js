import { generateRoadmapPlan, updateMilestoneStatus } from '../services/roadmap.service.js';
import Roadmap from '../models/Roadmap.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const generateRoadmap = asyncHandler(async (req, res) => {
  const { goal, subject, skillLevel, hoursPerWeek, targetDurationWeeks } = req.body;

  if (!goal || !goal.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Learning goal is required.' },
    });
  }

  const userId = req.user ? req.user.id : 'guest_anon';

  const roadmap = await generateRoadmapPlan({
    userId,
    goal: goal.trim(),
    subject: subject || 'General Engineering',
    skillLevel: skillLevel || 'intermediate',
    hoursPerWeek: Number(hoursPerWeek) || 6,
    targetDurationWeeks: Number(targetDurationWeeks) || 4,
  });

  res.status(201).json({
    success: true,
    message: 'Roadmap created successfully',
    data: roadmap,
  });
});

export const getCurrentRoadmap = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : 'guest_anon';
  const roadmaps = await Roadmap.find({ userId });

  if (!roadmaps || roadmaps.length === 0) {
    return res.status(200).json({
      success: true,
      data: null,
    });
  }

  const latest = roadmaps[roadmaps.length - 1];
  res.status(200).json({
    success: true,
    data: latest,
  });
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const { id, milestoneId } = req.params;
  const { status } = req.body;

  if (!['not_started', 'in_progress', 'completed'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid milestone status.' },
    });
  }

  const userId = req.user ? req.user.id : 'guest_anon';

  const updated = await updateMilestoneStatus({
    userId,
    roadmapId: id,
    milestoneId,
    status,
  });

  res.status(200).json({
    success: true,
    message: 'Milestone updated successfully',
    data: updated,
  });
});
