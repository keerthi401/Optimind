import mongoose from 'mongoose';
import { createStore } from './store.js';

const QuizQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    topic: { type: String, required: true },
  },
  { _id: false }
);

const QuizSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subject: { type: String, default: 'general' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    source: { type: String, enum: ['topic', 'document'], default: 'topic' },
    documentId: { type: String, default: null },
    questions: [QuizQuestionSchema],
  },
  { timestamps: true }
);

const MongooseQuizModel = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
export const Quiz = createStore('Quiz', MongooseQuizModel);
export default Quiz;
