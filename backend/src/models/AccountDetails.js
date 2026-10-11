import mongoose from 'mongoose';
import { createStore } from './store.js';

const AccountDetailsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String, default: '' },
    institution: { type: String, default: '' },
    major: { type: String, default: '' },
    academicLevel: { type: String, default: 'Undergraduate' },
    bio: { type: String, default: '' },
    country: { type: String, default: '' },
    timezone: { type: String, default: 'UTC' },
    preferredLanguage: { type: String, default: 'en' },
    socialLinks: {
      type: Object,
      default: { github: '', linkedin: '', twitter: '', website: '' },
    },
    learningPreferences: {
      type: Object,
      default: {
        theme: 'system',
        dailyGoalMinutes: 30,
        preferredStyle: 'visual_step_by_step',
        audioNarrationSpeed: 1.0,
        soundEffects: true,
      },
    },
    notificationSettings: {
      type: Object,
      default: {
        emailDigest: true,
        streakReminders: true,
        quizRecommendations: true,
        productUpdates: false,
      },
    },
  },
  { timestamps: true }
);

const MongooseAccountDetailsModel =
  mongoose.models.AccountDetails || mongoose.model('AccountDetails', AccountDetailsSchema);

export const AccountDetails = createStore('AccountDetails', MongooseAccountDetailsModel);
export default AccountDetails;
