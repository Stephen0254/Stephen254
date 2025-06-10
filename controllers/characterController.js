import Character from '../models/characterModel.js';

// @desc    Get all characters
export const getAllCharacters = async (req, res) => {
  try {
    const characters = await Character.find()
      .populate('weapons')
      .populate('equipment');
    res.json(characters);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch characters', error: err.message });
  }
};

// @desc    Get single character by ID
export const getCharacterById = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('weapons')
      .populate('equipment');
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.json(character);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching character', error: err.message });
  }
};

// @desc    Create new character
export const createCharacter = async (req, res) => {
  try {
    const { name, role, weapons, equipment, description } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required' });
    }

    const newCharacter = new Character({
      name,
      role,
      description: description || '',
      weapons: weapons ? weapons.split(',') : [],
      equipment: equipment ? equipment.split(',') : [],
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const saved = await newCharacter.save();
    res.status(201).json({ message: 'Character created', character: saved });
  } catch (err) {
    res.status(400).json({ message: 'Error creating character', error: err.message });
  }
};

// @desc    Update character by ID
export const updateCharacter = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    if (updates.weapons) {
      updates.weapons = updates.weapons.split(',');
    }

    if (updates.equipment) {
      updates.equipment = updates.equipment.split(',');
    }

    if (!updates.description) {
      updates.description = '';
    }

    const updated = await Character.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json({ message: 'Character updated', character: updated });
  } catch (err) {
    res.status(400).json({ message: 'Error updating character', error: err.message });
  }
};

// @desc    Delete character by ID
export const deleteCharacter = async (req, res) => {
  try {
    const deleted = await Character.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json({ message: 'Character deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting character', error: err.message });
  }
};
