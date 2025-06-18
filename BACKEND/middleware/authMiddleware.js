import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 Token received:', token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🧬 Decoded token payload:', decoded);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        console.warn('❌ User not found for decoded ID');
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('✅ User authenticated:', req.user.email);
      next();
    } catch (error) {
      console.error('❌ JWT verification failed:', error.message);
      const errorMessage =
        error.name === 'TokenExpiredError'
          ? 'Token expired, please log in again.'
          : 'Invalid token, not authorized.';
      return res.status(401).json({ message: errorMessage });
    }
  } else {
    console.warn('⚠️ No authorization token provided');
    return res.status(401).json({ message: 'No token, not authorized' });
  }
};

const admin = (req, res, next) => {
  console.log('🔍 Checking admin access for user:', req.user?.email);
  if (req.user?.isAdmin) {
    console.log('✅ Admin access granted');
    next();
  } else {
    console.warn('⛔ Admin access denied');
    return res.status(403).json({ message: 'Admin access only' });
  }
};

export { protect, admin };