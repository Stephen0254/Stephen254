import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import connectDB from './config/db.js';

import characterRoutes from './routes/CharacterRoutes.js';
import titleRoutes from './routes/TitleRoutes.js';
import speciesRoutes from './routes/SpeciesRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import civilizationRoutes from './routes/CivilizationRoutes.js';
import weaponRoutes from './routes/WeaponRoutes.js';
import equipmentRoutes from './routes/EquipmentRoutes.js';
import searchRoutes from './routes/SearchRoutes.js';
import worldRoutes from './routes/WorldRoutes.js';

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
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: '⚠️ Too many requests from this IP, please try again later.',
  })
);

// === CORS ===
const allowedOrigins = [
  'http://localhost:5173',
  'https://stephen-fawn.vercel.app',
  'https://stephen-95sgvaxk8-stephen0254s-projects.vercel.app', // ✅ NEW FRONTEND URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('🌐 CORS Origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`❌ CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Static Uploads Folder ===
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// === API Routes ===
app.use('/api/characters', characterRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/civilizations', civilizationRoutes);
app.use('/api/weapons', weaponRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/worlds', worldRoutes);

// === Health/Test Routes ===
app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.post('/test', (req, res) => {
  console.log('🧪 POST /test hit');
  res.json({ body: req.body });
});

// === Fallback & Error Handling ===
app.use((req, res, next) => {
  console.log('⚠️ Unmatched route:', req.method, req.originalUrl);
  next();
});
app.use(notFound);
app.use(errorHandler);

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
