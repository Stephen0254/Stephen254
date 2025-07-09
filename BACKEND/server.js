// ✅ Fixed Express server.js with safe preflight handler and full CORS support
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import connectDB from './config/db.js';

// Import Routes
import characterRoutes from './routes/CharacterRoutes.js';
import titleRoutes from './routes/TitleRoutes.js';
import speciesRoutes from './routes/SpeciesRoutes.js';
import userRoutes from './routes/userRoutes.js';
import civilizationRoutes from './routes/CivilizationRoutes.js';
import weaponRoutes from './routes/WeaponRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import searchRoutes from './routes/SearchRoutes.js';
import worldRoutes from './routes/WorldRoutes.js';
import authRoutes from './routes/authRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// === Security Middleware ===
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: '⚠️ Too many requests from this IP, please try again later.',
  })
);

// === CORS Setup ===
const allowedOrigins = [
  'http://localhost:5173',
  'https://stephen-fawn.vercel.app',
  'https://stephen-95sgvaxk8-stephen0254s-projects.vercel.app',
  'https://stephen-nfkxrkgjy-stephen0254s-projects.vercel.app',
  'https://dream-comics-universe.vercel.app',
  'https://dcu-frontend-mtkk-hwfwuxytu-stephen0254s-projects.vercel.app', // ✅ added
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

// ✅ Handle preflight OPTIONS requests globally
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  return res.sendStatus(204);
});

// === Body Parsers ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Logging ===
app.use((req, res, next) => {
  console.log('🔍 Request:', req.method, req.url);
  next();
});

// === Static Uploads Folder ===
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// === Health Check Routes ===
app.get('/', (req, res) => res.send('🌍 DREAM COMICS API is running'));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.post('/test', (req, res) => {
  console.log('🧪 POST /test hit');
  res.json({ body: req.body });
});

// === API Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/civilizations', civilizationRoutes);
app.use('/api/weapons', weaponRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/worlds', worldRoutes);

// === Error Handling ===
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
