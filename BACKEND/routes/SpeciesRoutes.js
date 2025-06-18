// backend/routes/speciesRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';

import Species from '../models/speciesModel.js';
import { protect } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import validateObjectId from '../middleware/validateObjectIdMiddleware.js';

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const upload = multer({ storage });

// @route GET /api/species - Public
router.get('/', async (req, res) => {
  const species = await Species.find().sort({ createdAt: -1 });
  res.json(species);
});

// @route GET /api/species/:id - Public
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const species = await Species.findById(req.params.id);
    if (!species) return res.status(404).json({ message: 'Species not found' });
    res.json(species);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/species - Admin only
router.post(
  '/',
  protect,
  adminMiddleware,
  upload.single('image'),
  async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });

    const newSpecies = new Species({
      name,
      description,
      image: req.file ? req.file.filename : null,
    });

    await newSpecies.save();
    res.status(201).json(newSpecies);
  }
);

// @route PUT /api/species/:id - Admin only
router.put(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  upload.single('image'),
  async (req, res) => {
    const species = await Species.findById(req.params.id);
    if (!species) return res.status(404).json({ message: 'Species not found' });

    species.name = req.body.name || species.name;
    species.description = req.body.description || species.description;
    if (req.file) species.image = req.file.filename;

    await species.save();
    res.json(species);
  }
);

// @route DELETE /api/species/:id - Admin only
router.delete(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  async (req, res) => {
    const species = await Species.findByIdAndDelete(req.params.id);
    if (!species) return res.status(404).json({ message: 'Species not found' });

    res.json({ message: 'Species deleted' });
  }
);

export default router;
