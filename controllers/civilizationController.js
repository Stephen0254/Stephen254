import Civilization from '../models/civilizationModel.js';

// @desc    Get all civilizations (Supports search by name)
export const getAllCivilizations = async (req, res) => {
  try {
    const { name } = req.query;
    let query = {};

    if (name) {
      query.name = new RegExp(name, 'i'); // Case-insensitive search
    }

    const civilizations = await Civilization.find(query);
    res.json(civilizations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch civilizations', error: err.message });
  }
};

// @desc    Get single civilization by ID
export const getCivilizationById = async (req, res) => {
  try {
    const civilization = await Civilization.findById(req.params.id);
    if (!civilization) {
      return res.status(404).json({ message: 'Civilization not found' });
    }
    res.json(civilization);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching civilization', error: err.message });
  }
};

// @desc    Create a new civilization
export const createCivilization = async (req, res) => {
  try {
    const { name, description, location } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newCivilization = new Civilization({
      name,
      description,
      location,
      image: req.file ? req.file.filename : '',
    });

    const saved = await newCivilization.save();
    res.status(201).json({ message: 'Civilization created successfully', civilization: saved });
  } catch (err) {
    res.status(400).json({ message: 'Error creating civilization', error: err.message });
  }
};

// @desc    Update civilization by ID
export const updateCivilization = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.image = req.file.filename;
    }

    const updated = await Civilization.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Civilization not found' });
    }

    res.json({ message: 'Civilization updated successfully', civilization: updated });
  } catch (err) {
    res.status(400).json({ message: 'Error updating civilization', error: err.message });
  }
};

// @desc    Delete civilization by ID
export const deleteCivilization = async (req, res) => {
  try {
    const deleted = await Civilization.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Civilization not found' });
    }

    res.json({ message: 'Civilization deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting civilization', error: err.message });
  }
};