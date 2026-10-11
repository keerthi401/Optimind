import mongoose from 'mongoose';
import { createStore } from './store.js';

const VisualStepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    explanation: { type: String, required: true },
    keyTakeaway: { type: String, required: true },
    visualState: { type: Object, default: {} },
    mermaidDiagram: { type: String, default: '' },
  },
  { _id: false }
);

const LessonSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subject: { type: String, default: 'general' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    overview: { type: String, required: true },
    steps: [VisualStepSchema],
    isSaved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MongooseLessonModel = mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
export const Lesson = createStore('Lesson', MongooseLessonModel);
export default Lesson;
