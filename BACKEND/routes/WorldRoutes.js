// backend/routes/worldRoutes.js
import express from 'express';
import {
  getWorlds,
  getWorldById,
  createWorld,
  updateWorld,
  deleteWorld,
} from '../controllers/worldController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getWorlds)
  .post(protect, admin, upload.single('image'), createWorld);

router.route('/:id')
  .get(getWorldById)
  .put(protect, admin, upload.single('image'), updateWorld)
  .delete(protect, admin, deleteWorld);

export default router;
