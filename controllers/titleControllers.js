import Title from '../models/titleModel.js';

// @desc    Get all titles, optionally filtered by category
export const getAllTitles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const titles = await Title.find(filter);
    res.json(titles);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch titles', error: err.message });
  }
};

// @desc    Get single title by ID
export const getTitleById = async (req, res) => {
  try {
    const title = await Title.findById(req.params.id);
    if (!title) {
      return res.status(404).json({ message: 'Title not found' });
    }
    res.json(title);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching title', error: err.message });
  }
};

// @desc    Create new title
export const createTitle = async (req, res) => {
  try {
    const { category, name } = req.body;

    if (!category || !name) {
      return res.status(400).json({ message: 'Category and name are required' });
    }

    const allowedCategories = ['species', 'civilization', 'weapon', 'equipment', 'extra'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const newTitle = new Title({
      category,
      name,
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const saved = await newTitle.save();
    res.status(201).json({ message: 'Title created', title: saved });
  } catch (err) {
    res.status(400).json({ message: 'Error creating title', error: err.message });
  }
};

// @desc    Update title by ID
export const updateTitle = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    if (updates.category) {
      const allowedCategories = ['species', 'civilization', 'weapon', 'equipment', 'extra'];
      if (!allowedCategories.includes(updates.category)) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    const updated = await Title.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Title not found' });
    }

    res.json({ message: 'Title updated', title: updated });
  } catch (err) {
    res.status(400).json({ message: 'Error updating title', error: err.message });
  }
};

// @desc    Delete title by ID
export const deleteTitle = async (req, res) => {
  try {
    const deleted = await Title.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Title not found' });
    }

    res.json({ message: 'Title deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting title', error: err.message });
  }
};
