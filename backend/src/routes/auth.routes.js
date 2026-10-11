import express from 'express';
import {
  register,
  login,
  getProfile,
  createGuestSession,
  getAccountDetails,
  updateAccountDetails,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest', createGuestSession);
router.get('/profile', requireAuth, getProfile);
router.get('/account', requireAuth, getAccountDetails);
router.put('/account', requireAuth, updateAccountDetails);

export default router;
