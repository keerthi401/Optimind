import mongoose from 'mongoose';
import { createStore } from './store.js';

const MilestoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    topics: [{ type: String }],
    estimatedHours: { type: Number, required: true },
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
    progressPercentage: { type: Number, default: 0 },
  },
  { _id: false }
);

const RoadmapSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    goal: { type: String, required: true },
    subject: { type: String, required: true },
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    hoursPerWeek: { type: Number, default: 5 },
    targetDurationWeeks: { type: Number, default: 4 },
    overallProgress: { type: Number, default: 0 },
    milestones: [MilestoneSchema],
  },
  { timestamps: true }
);

const MongooseRoadmapModel = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);
export const Roadmap = createStore('Roadmap', MongooseRoadmapModel);
export default Roadmap;
