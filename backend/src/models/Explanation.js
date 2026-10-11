import mongoose from 'mongoose';
import { createStore } from './store.js';

const ExplanationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    subject: { type: String, default: 'general' },
    difficulty: { type: String, default: 'intermediate' },
    format: { type: String, default: 'step_by_step' },
    summary: { type: String, required: true },
    steps: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
    terminology: [
      {
        term: { type: String, required: true },
        definition: { type: String, required: true },
      },
    ],
    analogy: { type: String, default: '' },
    isSaved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MongooseExpModel = mongoose.models.Explanation || mongoose.model('Explanation', ExplanationSchema);
export const Explanation = createStore('Explanation', MongooseExpModel);
export default Explanation;
