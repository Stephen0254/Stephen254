import Species from '../models/speciesModel.js';

// @desc    Get all species
export const getAllSpecies = async (req, res) => {
  try {
    const species = await Species.find();
    res.json(species);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch species', error: err.message });
  }
};

// @desc    Create new species
export const createSpecies = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newSpecies = new Species({
      name,
      description,
      image: req.file ? req.file.filename : '',
    });

    const saved = await newSpecies.save();
    res.status(201).json({ message: 'Species created successfully', species: saved });
  } catch (err) {
    res.status(400).json({ message: 'Error creating species', error: err.message });
  }
};

// @desc    Update species by ID
export const updateSpecies = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.image = req.file.filename;
    }

    const species = await Species.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!species) {
      return res.status(404).json({ message: 'Species not found' });
    }

    res.json({ message: 'Species updated successfully', species });
  } catch (err) {
    res.status(400).json({ message: 'Error updating species', error: err.message });
  }
};

// @desc    Delete species by ID
export const deleteSpecies = async (req, res) => {
  try {
    const deleted = await Species.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Species not found' });
    }

    res.json({ message: 'Species deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting species', error: err.message });
  }
};
