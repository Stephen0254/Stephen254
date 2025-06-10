// backend/routes/userRoutes.js
import express from 'express';
const router = express.Router();

import {
  signupUser,
  loginUser,
  getUserProfile,
  resetPassword,
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

// @route   POST /api/users/signup
// @desc    Signup new user
router.post('/signup', signupUser);

// @route   POST /api/users/login
// @desc    Login user (with debug log)
router.post('/login', (req, res, next) => {
  console.log('🔐 /api/users/login route hit');
  next();
}, loginUser);

// @route   GET /api/users/profile
// @desc    Get logged-in user's profile (protected)
router.get('/profile', protect, getUserProfile);

// @route   POST /api/users/reset-password
// @desc    Reset user password (dev/test only)
router.post('/reset-password', resetPassword);

export default router;
