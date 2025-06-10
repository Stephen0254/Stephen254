import Equipment from '../models/equipmentModel.js';

// @desc    Get all equipment
export const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch equipment', error: err.message });
  }
};

// @desc    Get single equipment by ID
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving equipment', error: err.message });
  }
};

// @desc    Create new equipment
export const createEquipment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const newEquipment = new Equipment({
      name,
      description,
      image: req.file ? req.file.filename : '',
    });

    const saved = await newEquipment.save();
    res.status(201).json({ message: 'Equipment created successfully', equipment: saved });
  } catch (err) {
    res.status(400).json({ message: 'Error creating equipment', error: err.message });
  }
};

// @desc    Update equipment by ID
export const updateEquipment = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.image = req.file.filename;
    }

    const equipment = await Equipment.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({ message: 'Equipment updated successfully', equipment });
  } catch (err) {
    res.status(400).json({ message: 'Error updating equipment', error: err.message });
  }
};

// @desc    Delete equipment by ID
export const deleteEquipment = async (req, res) => {
  try {
    const deleted = await Equipment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    res.json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting equipment', error: err.message });
  }
};
