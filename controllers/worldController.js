// backend/controllers/worldController.js
import World from '../models/worldModel.js';
import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';

// @desc    Get all worlds
// @route   GET /api/worlds
export const getWorlds = asyncHandler(async (req, res) => {
  const worlds = await World.find();
  res.json(worlds);
});

// @desc    Get single world
// @route   GET /api/worlds/:id
export const getWorldById = asyncHandler(async (req, res) => {
  const world = await World.findById(req.params.id);
  if (!world) throw new Error('World not found');
  res.json(world);
});

// @desc    Create new world
// @route   POST /api/worlds
export const createWorld = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const image = req.file ? req.file.filename : '';

  const world = new World({ name, description, image });
  const created = await world.save();
  res.status(201).json(created);
});

// @desc    Update world
// @route   PUT /api/worlds/:id
export const updateWorld = asyncHandler(async (req, res) => {
  const world = await World.findById(req.params.id);
  if (!world) throw new Error('World not found');

  world.name = req.body.name || world.name;
  world.description = req.body.description || world.description;

  if (req.file) {
    // delete old image
    if (world.image) {
      const oldPath = path.join('uploads', world.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    world.image = req.file.filename;
  }

  const updated = await world.save();
  res.json(updated);
});

// @desc    Delete world
// @route   DELETE /api/worlds/:id
export const deleteWorld = asyncHandler(async (req, res) => {
  const world = await World.findById(req.params.id);
  if (!world) throw new Error('World not found');

  if (world.image) {
    const imagePath = path.join('uploads', world.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }

  await world.remove();
  res.json({ message: 'World deleted' });
});
