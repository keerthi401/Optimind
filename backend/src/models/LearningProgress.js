import mongoose from 'mongoose';
import { createStore } from './store.js';

const LearningProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    activityType: {
      type: String,
      enum: ['concept_lesson', 'visual_simulation', 'quiz_evaluation', 'rag_document'],
      required: true,
    },
    durationMinutes: { type: Number, default: 15 },
    masteryScore: { type: Number, default: 80 },
  },
  { timestamps: true }
);

const MongooseProgressModel = mongoose.models.LearningProgress || mongoose.model('LearningProgress', LearningProgressSchema);
export const LearningProgress = createStore('LearningProgress', MongooseProgressModel);
export default LearningProgress;
