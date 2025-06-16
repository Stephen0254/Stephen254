import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import Weapon from '../models/weaponModel.js';
import { protect } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import validateObjectId from '../middleware/validateObjectIdMiddleware.js';

const router = express.Router();

// Enable __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Multer storage config — save to backend/uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

/**
 * @route   GET /api/weapons
 * @desc    Get all weapons
 */
router.get('/', async (req, res) => {
  try {
    const weapons = await Weapon.find();
    res.json(weapons);
  } catch (error) {
    console.error('Error fetching weapons:', error);
    res.status(500).json({ message: 'Server error fetching weapons' });
  }
});

/**
 * @route   GET /api/weapons/:id
 * @desc    Get weapon by ID
 */
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const weapon = await Weapon.findById(req.params.id);
    if (!weapon) {
      return res.status(404).json({ message: 'Weapon not found' });
    }
    res.json(weapon);
  } catch (error) {
    console.error('Error fetching weapon:', error);
    res.status(500).json({ message: 'Server error fetching weapon' });
  }
});

/**
 * @route   POST /api/weapons
 * @desc    Create new weapon
 */
router.post(
  '/',
  protect,
  adminMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Weapon name is required' });
      }

      const image = req.file ? req.file.filename : '';
      const newWeapon = new Weapon({ name, description, image });
      await newWeapon.save();

      res.status(201).json({ message: 'Weapon created', weapon: newWeapon });
    } catch (error) {
      console.error('Error creating weapon:', error);
      res.status(500).json({ message: 'Server error creating weapon' });
    }
  }
);

/**
 * @route   PUT /api/weapons/:id
 * @desc    Update weapon by ID
 */
router.put(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const updateFields = { name, description };

      if (req.file) {
        updateFields.image = req.file.filename;
      }

      const updatedWeapon = await Weapon.findByIdAndUpdate(req.params.id, updateFields, {
        new: true,
      });

      if (!updatedWeapon) {
        return res.status(404).json({ message: 'Weapon not found' });
      }

      res.json({ message: 'Weapon updated', weapon: updatedWeapon });
    } catch (error) {
      console.error('Error updating weapon:', error);
      res.status(500).json({ message: 'Server error updating weapon' });
    }
  }
);

/**
 * @route   DELETE /api/weapons/:id
 * @desc    Delete weapon by ID
 */
router.delete(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  async (req, res) => {
    try {
      const weapon = await Weapon.findByIdAndDelete(req.params.id);
      if (!weapon) {
        return res.status(404).json({ message: 'Weapon not found' });
      }

      res.json({ message: 'Weapon deleted' });
    } catch (error) {
      console.error('Error deleting weapon:', error);
      res.status(500).json({ message: 'Server error deleting weapon' });
    }
  }
);

export default router;
