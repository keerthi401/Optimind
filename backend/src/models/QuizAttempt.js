import mongoose from 'mongoose';
import { createStore } from './store.js';

const QuestionResultSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    selectedOptionIndex: { type: Number, required: true },
    correctOptionIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    explanation: { type: String, required: true },
    topic: { type: String, required: true },
  },
  { _id: false }
);

const QuizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    quizId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    weakTopics: [{ type: String }],
    questionResults: [QuestionResultSchema],
  },
  { timestamps: true }
);

const MongooseAttemptModel = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', QuizAttemptSchema);
export const QuizAttempt = createStore('QuizAttempt', MongooseAttemptModel);
export default QuizAttempt;
