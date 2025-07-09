// backend/routes/speciesRoutes.js
import express from 'express';
import multer from 'multer';

import Species from '../models/speciesModel.js';
import { protect } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import validateObjectId from '../middleware/validateObjectIdMiddleware.js';

const router = express.Router();

// 🔧 Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  }
});

// 🔍 GET all species
router.get('/', async (req, res) => {
  try {
    const species = await Species.find().sort({ createdAt: -1 });
    res.json(species);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching species' });
  }
});

// 🔍 GET species by ID
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const species = await Species.findById(req.params.id);
    if (!species) return res.status(404).json({ message: 'Species not found' });
    res.json(species);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching species' });
  }
});

// ➕ POST new species (Admin only)
router.post(
  '/',
  protect,
  adminMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Name is required.' });
      }

      const newSpecies = new Species({
        name,
        description,
        image: req.file ? req.file.filename : null,
      });

      await newSpecies.save();
      res.status(201).json({ message: 'Species created', species: newSpecies });
    } catch (err) {
      res.status(500).json({ message: 'Failed to create species' });
    }
  }
);

// ✏️ PUT update species by ID (Admin only)
router.put(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  upload.single('image'),
  async (req, res) => {
    try {
      const species = await Species.findById(req.params.id);
      if (!species) return res.status(404).json({ message: 'Species not found' });

      species.name = req.body.name || species.name;
      species.description = req.body.description || species.description;
      if (req.file) species.image = req.file.filename;

      await species.save();
      res.json({ message: 'Species updated', species });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update species' });
    }
  }
);

// ❌ DELETE species (Admin only)
router.delete(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  async (req, res) => {
    try {
      const species = await Species.findByIdAndDelete(req.params.id);
      if (!species) return res.status(404).json({ message: 'Species not found' });

      res.json({ message: 'Species deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete species' });
    }
  }
);

export default router;
