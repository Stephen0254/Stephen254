import Weapon from '../models/weaponModel.js';

// @desc    Get all weapons
export const getAllWeapons = async (req, res) => {
  try {
    const weapons = await Weapon.find();
    res.json(weapons);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch weapons', error: err.message });
  }
};

// ✅ NEW: Get weapon by ID
export const getWeaponById = async (req, res) => {
  try {
    const weapon = await Weapon.findById(req.params.id);
    if (!weapon) {
      return res.status(404).json({ message: 'Weapon not found' });
    }
    res.json(weapon);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching weapon', error: err.message });
  }
};

// @desc    Create new weapon
export const createWeapon = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newWeapon = new Weapon({
      name,
      description,
      image: req.file ? req.file.filename : '',
    });

    const saved = await newWeapon.save();
    res.status(201).json({ message: 'Weapon created successfully', weapon: saved });
  } catch (err) {
    res.status(400).json({ message: 'Error creating weapon', error: err.message });
  }
};

// @desc    Update weapon by ID
export const updateWeapon = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.image = req.file.filename;
    }

    const weapon = await Weapon.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!weapon) {
      return res.status(404).json({ message: 'Weapon not found' });
    }

    res.json({ message: 'Weapon updated successfully', weapon });
  } catch (err) {
    res.status(400).json({ message: 'Error updating weapon', error: err.message });
  }
};

// @desc    Delete weapon by ID
export const deleteWeapon = async (req, res) => {
  try {
    const deleted = await Weapon.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Weapon not found' });
    }

    res.json({ message: 'Weapon deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting weapon', error: err.message });
  }
};
