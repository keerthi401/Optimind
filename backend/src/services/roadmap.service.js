import { v4 as uuidv4 } from 'uuid';
import Roadmap from '../models/Roadmap.js';
import { env } from '../config/env.js';

export async function generateRoadmapPlan({ userId, goal, subject, skillLevel = 'intermediate', hoursPerWeek = 6, targetDurationWeeks = 4 }) {
  let milestones = [];

  if (env.GEMINI_API_KEY) {
    try {
      const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const systemPrompt = `You are the OptiMind AI Curriculum Architect.
Generate a structured, progressive learning roadmap.
Return STRICTLY valid JSON formatted as:
{
  "milestones": [
    {
      "title": "Milestone title",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "estimatedHours": 8
    }
  ]
}`;

      const prompt = `Goal: "${goal}"
Subject: "${subject}"
Current Level: "${skillLevel}"
Hours per week: ${hoursPerWeek}
Duration: ${targetDurationWeeks} weeks

Design 3-4 progressive milestones covering foundational mastery to advanced synthesis.`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
            milestones = parsed.milestones.map((m, idx) => ({
              id: `ms_${idx + 1}_${uuidv4().substring(0, 6)}`,
              title: m.title,
              topics: m.topics || [],
              estimatedHours: Number(m.estimatedHours) || Math.round(hoursPerWeek),
              status: idx === 0 ? 'in_progress' : 'not_started',
              progressPercentage: idx === 0 ? 25 : 0,
            }));
          }
        }
      }
    } catch (e) {
      console.warn(`[Roadmap Gemini Error] ${e.message}`);
    }
  }

  // Pedagogical fallback
  if (milestones.length === 0) {
    milestones = synthesizeMilestones(goal, subject, hoursPerWeek, targetDurationWeeks);
  }

  const initialProgress = Math.round(
    milestones.reduce((acc, m) => acc + m.progressPercentage, 0) / Math.max(1, milestones.length)
  );

  const roadmap = await Roadmap.create({
    id: uuidv4(),
    userId,
    goal,
    subject,
    skillLevel,
    hoursPerWeek,
    targetDurationWeeks,
    overallProgress: initialProgress,
    milestones,
  });

  return roadmap;
}

function synthesizeMilestones(goal, subject, hoursPerWeek, weeks) {
  const hoursPerMilestone = Math.max(4, Math.round((hoursPerWeek * weeks) / 4));
  return [
    {
      id: `ms_1_${uuidv4().substring(0, 6)}`,
      title: 'Phase 1: Foundations & Core Invariants',
      topics: ['Theoretical Pre-requisites', 'Basic Syntax & Memory Models', 'Baseline Problem Formulation'],
      estimatedHours: hoursPerMilestone,
      status: 'in_progress',
      progressPercentage: 50,
    },
    {
      id: `ms_2_${uuidv4().substring(0, 6)}`,
      title: 'Phase 2: Algorithmic Mechanics & Visual Tracing',
      topics: ['State Progression Visualization', 'Step-by-step Transformation Tracing', 'Complexity Analysis'],
      estimatedHours: hoursPerMilestone,
      status: 'not_started',
      progressPercentage: 0,
    },
    {
      id: `ms_3_${uuidv4().substring(0, 6)}`,
      title: 'Phase 3: Applied Problem Solving & Edge Cases',
      topics: ['Corner Case Handling', 'Diagnostic Assessment Testing', 'Multi-step Synthesis'],
      estimatedHours: hoursPerMilestone,
      status: 'not_started',
      progressPercentage: 0,
    },
    {
      id: `ms_4_${uuidv4().substring(0, 6)}`,
      title: 'Phase 4: Advanced Mastery & Real-World Projects',
      topics: ['Comprehensive Synthesis', 'Performance Benchmarking', 'Self-evaluation & Review'],
      estimatedHours: hoursPerMilestone,
      status: 'not_started',
      progressPercentage: 0,
    },
  ];
}

/**
 * Update milestone status (e.g. toggle completed) and recalculate overall progress
 */
export async function updateMilestoneStatus({ userId, roadmapId, milestoneId, status }) {
  const roadmap = await Roadmap.findById(roadmapId);
  if (!roadmap) {
    throw new Error('Roadmap not found');
  }

  if (String(roadmap.userId) !== String(userId)) {
    throw new Error('Unauthorized access to roadmap');
  }

  const updatedMilestones = roadmap.milestones.map((m) => {
    if (m.id === milestoneId) {
      let progress = 0;
      if (status === 'completed') progress = 100;
      else if (status === 'in_progress') progress = 50;
      return { ...m, status, progressPercentage: progress };
    }
    return m;
  });

  const overallProgress = Math.round(
    updatedMilestones.reduce((acc, m) => acc + m.progressPercentage, 0) / Math.max(1, updatedMilestones.length)
  );

  const updated = await Roadmap.findByIdAndUpdate(roadmapId, {
    milestones: updatedMilestones,
    overallProgress,
  });

  return updated;
}
