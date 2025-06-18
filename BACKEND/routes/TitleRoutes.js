// backend/routes/titleRoutes.js
import express from 'express';
import multer from 'multer';

import Title from '../models/titleModel.js';
import { protect } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import validateObjectId from '../middleware/validateObjectIdMiddleware.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// @route POST /api/titles - Add a new title (Admin only)
router.post(
  '/',
  protect,
  adminMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { category, name } = req.body;
      const image = req.file ? req.file.filename : '';

      const newTitle = new Title({ category, name, image });
      const savedTitle = await newTitle.save();

      res.status(201).json(savedTitle);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// @route GET /api/titles/:category - Get titles by category
router.get('/:category', async (req, res) => {
  try {
    const titles = await Title.find({ category: req.params.category }).sort({ createdAt: -1 });
    res.json(titles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route PUT /api/titles/:id - Edit a title (Admin only)
router.put(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  upload.single('image'),
  async (req, res) => {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.image = req.file.filename;
      }

      const updatedTitle = await Title.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!updatedTitle) return res.status(404).json({ message: 'Title not found' });

      res.json(updatedTitle);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// @route DELETE /api/titles/:id - Delete a title (Admin only)
router.delete(
  '/:id',
  protect,
  adminMiddleware,
  validateObjectId,
  async (req, res) => {
    try {
      const deleted = await Title.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Title not found' });

      res.json({ message: 'Title deleted' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
