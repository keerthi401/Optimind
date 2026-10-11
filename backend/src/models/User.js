import mongoose from 'mongoose';
import { createStore } from './store.js';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isGuest: { type: Boolean, default: false },
    avatarUrl: { type: String, default: '' },
    learningStreakDays: { type: Number, default: 1 },
    totalHoursStudied: { type: Number, default: 0 },
    completedLessonsCount: { type: Number, default: 0 },
    averageQuizScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const MongooseUserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const User = createStore('User', MongooseUserModel);
export default User;
