import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';

import Character from '../models/characterModel.js';
import { protect } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import validateObjectId from '../middleware/validateObjectIdMiddleware.js';

const router = express.Router();

// 🔧 Multer Setup for Image Uploads
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

// 🟢 GET all characters
router.get('/', async (req, res) => {
  try {
    const characters = await Character.find()
      .populate('weapons')
      .populate('equipment');
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching characters' });
  }
});

// 🟢 GET single character by ID
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('weapons')
      .populate('equipment');

    if (!character) return res.status(404).json({ message: 'Character not found' });
    res.json(character);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching character' });
  }
});

// 🟢 POST: Create new character
router.post(
  '/',
  protect,
  adminMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, role, description, weapons, equipment } = req.body;
      if (!name || !role || !req.file) {
        return res.status(400).json({ message: 'Name, role, and image are required.' });
      }

      const newCharacter = new Character({
        name,
        role,
        description: description || '',
        weapons: weapons ? weapons.split(',') : [],
        equipment: equipment ? equipment.split(',') : [],
        image: `/uploads/${req.file.filename}`
      });

      await newCharacter.save();
      res.status(201).json({ message: 'Character created', character: newCharacter });
    } catch (error) {
      res.status(500).json({ message: 'Server error while creating character' });
    }
  }
);

// 🟢 PUT: Update character by ID
router.put(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, role, description, weapons, equipment } = req.body;

      const updatedFields = {
        name,
        role,
        description,
        weapons: weapons ? weapons.split(',') : [],
        equipment: equipment ? equipment.split(',') : [],
      };

      if (req.file) {
        updatedFields.image = `/uploads/${req.file.filename}`;
      }

      const updatedCharacter = await Character.findByIdAndUpdate(
        req.params.id,
        updatedFields,
        { new: true }
      );

      if (!updatedCharacter) return res.status(404).json({ message: 'Character not found' });
      res.json({ message: 'Character updated', character: updatedCharacter });
    } catch (error) {
      res.status(500).json({ message: 'Server error updating character' });
    }
  }
);

// 🟢 DELETE: Delete character
router.delete(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  async (req, res) => {
    try {
      const character = await Character.findByIdAndDelete(req.params.id);
      if (!character) return res.status(404).json({ message: 'Character not found' });
      res.json({ message: 'Character deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error deleting character' });
    }
  }
);

// 🧪 Test: Create character without image
router.post('/test-json', async (req, res) => {
  try {
    const { name, role, description, weapons, equipment } = req.body;
    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required.' });
    }

    const newCharacter = new Character({
      name,
      role,
      description: description || '',
      weapons: weapons ? weapons.split(',') : [],
      equipment: equipment ? equipment.split(',') : [],
      image: ''
    });

    await newCharacter.save();
    res.status(201).json({ message: 'Character created (test JSON only)', character: newCharacter });
  } catch (error) {
    res.status(500).json({ message: 'Server error in /test-json route' });
  }
});

export default router;