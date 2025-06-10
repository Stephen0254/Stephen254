// backend/routes/civilizationRoutes.js
import express from 'express';
import multer from 'multer';

import Civilization from '../models/civilizationModel.js';
import { protect } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import validateObjectId from '../middleware/validateObjectIdMiddleware.js';

const router = express.Router();

// 🔧 Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueSuffix);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// 🟢 GET all civilizations
router.get('/', async (req, res) => {
  try {
    const civilizations = await Civilization.find();
    res.json(civilizations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching civilizations' });
  }
});

// 🟢 GET single civilization by ID
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const civilization = await Civilization.findById(req.params.id);

    if (!civilization) {
      return res.status(404).json({ message: 'Civilization not found' });
    }

    res.json(civilization);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching civilization' });
  }
});

// 🟢 POST: Create a new civilization
router.post('/', protect, adminMiddleware, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Image upload error', error: err.message });
    }

    const { name, description, location } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const image = req.file ? req.file.filename : '';

    try {
      const newCivilization = new Civilization({
        name,
        description,
        location,
        image
      });
      await newCivilization.save();
      res.status(201).json({ message: 'Civilization created', civilization: newCivilization });
    } catch (error) {
      res.status(500).json({ message: 'Error creating civilization' });
    }
  });
});

// 🟢 PUT: Update a civilization by ID
router.put(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, description, location } = req.body;
      const updatedFields = { name, description, location };

      if (req.file) {
        updatedFields.image = req.file.filename;
      }

      const updatedCivilization = await Civilization.findByIdAndUpdate(
        req.params.id,
        updatedFields,
        { new: true }
      );

      if (!updatedCivilization) {
        return res.status(404).json({ message: 'Civilization not found' });
      }

      res.json({ message: 'Civilization updated', civilization: updatedCivilization });
    } catch (error) {
      res.status(500).json({ message: 'Error updating civilization' });
    }
  }
);

// 🟢 DELETE: Delete a civilization by ID
router.delete(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  async (req, res) => {
    try {
      const deleted = await Civilization.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Civilization not found' });
      }
      res.json({ message: 'Civilization deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting civilization' });
    }
  }
);

export default router;
