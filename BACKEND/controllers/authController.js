import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';

// === Login Controller ===
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      role: user.isAdmin ? 'admin' : 'user',
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// === Signup Controller ===
export const signupUser = async (req, res) => {
  const { email, password, role } = req.body;
  console.log('🟢 Signup request received:', { email, password, role });

  try {
    if (!email || !password || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ Email already exists:', email);
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = role === 'admin';

    const newUser = new User({ email, password: hashedPassword, isAdmin });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, role: isAdmin ? 'admin' : 'user' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
