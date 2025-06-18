import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ✅ Generate JWT with isAdmin
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Signup new user
// @route   POST /api/users/signup
// @access  Public
export const signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      return res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user), // ✅ Pass full user
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 loginUser controller called');
    console.log('Login attempt with:', { email, password });

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.email);
    console.log('🔐 Stored hashed password:', user.password);

    if (!password) {
      console.error('❌ Request body missing password');
      return res.status(400).json({ message: 'Password is required' });
    }

    if (!user.password) {
      console.error('❌ No password stored in user document');
      return res.status(500).json({ message: 'User account is corrupted: no password stored' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔍 Password comparison result:', isMatch);

    if (isMatch) {
      return res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user), // ✅ Pass full user
      });
    } else {
      console.log('❌ Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reset user password (Dev/Test only)
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    console.log(`✅ Password reset for ${email}`);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};