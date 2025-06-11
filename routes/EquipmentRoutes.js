// backend/routes/equipmentRoutes.js
import express from 'express';
import multer from 'multer';

import Equipment from '../models/equipmentModel.js';
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

// GET all equipment
router.get('/', async (req, res) => {
  try {
    const equipmentList = await Equipment.find();
    res.json(equipmentList);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching equipment' });
  }
});

// GET equipment by ID
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching equipment' });
  }
});

// POST create new equipment
router.post('/', protect, adminMiddleware, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Image upload error', error: err.message });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const image = req.file ? req.file.filename : '';

    try {
      const newEquipment = new Equipment({ name, description, image });
      await newEquipment.save();
      res.status(201).json({ message: 'Equipment created', equipment: newEquipment });
    } catch (error) {
      res.status(500).json({ message: 'Error creating equipment' });
    }
  });
});

// PUT update equipment by ID
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

      const updatedEquipment = await Equipment.findByIdAndUpdate(req.params.id, updateFields, {
        new: true,
      });

      if (!updatedEquipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }

      res.json({ message: 'Equipment updated', equipment: updatedEquipment });
    } catch (error) {
      res.status(500).json({ message: 'Error updating equipment' });
    }
  }
);

// DELETE equipment by ID
router.delete(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  async (req, res) => {
    try {
      const deleted = await Equipment.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      res.json({ message: 'Equipment deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting equipment' });
    }
  }
);

export default router;
