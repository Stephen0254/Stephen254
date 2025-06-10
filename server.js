// backend/server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import connectDB from './config/db.js';

import characterRoutes from './routes/characterRoutes.js';
import titleRoutes from './routes/titleRoutes.js';
import speciesRoutes from './routes/speciesRoutes.js';
import userRoutes from './routes/userRoutes.js';
import civilizationRoutes from './routes/civilizationRoutes.js';
import weaponRoutes from './routes/weaponRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

// Get __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === Logging ===
app.use((req, res, next) => {
  console.log('🔍 Request:', req.method, req.url);
  next();
});

// === ENV check ===
['MONGO_URI', 'JWT_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required ENV var: ${key}`);
    process.exit(1);
  }
});

// === DB Connection ===
connectDB()
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// === Security ===
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: '⚠️ Too many requests from this IP, please try again later.',
}));

// === CORS ===
const allowedOrigins = [
  'http://localhost:4173', // added your frontend port here
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Serve static files ===
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  dotfiles: 'deny',
  maxAge: '1d',
}));

// === API Routes ===
app.use('/api/characters', characterRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/civilizations', civilizationRoutes);
app.use('/api/weapons', weaponRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/search', searchRoutes);

// === Health & Test Routes ===
app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.post('/test', (req, res) => {
  console.log('🧪 POST /test hit');
  res.json({ body: req.body });
});

// === Fallback for unknown routes ===
app.use((req, res, next) => {
  console.log('⚠️ Unmatched route:', req.method, req.originalUrl);
  next();
});

// === Error Handling ===
app.use(notFound);
app.use(errorHandler);

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
