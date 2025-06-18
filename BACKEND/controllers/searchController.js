import Character from '../models/characterModel.js';
import Species from '../models/speciesModel.js';
import Civilization from '../models/civilizationModel.js';
import Weapon from '../models/weaponModel.js';
import Equipment from '../models/equipmentModel.js';

export const searchItems = async (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const regex = new RegExp(query, 'i');

  try {
    const [characters, species, civilizations, weapons, equipment] = await Promise.all([
      Character.find({ name: regex }),
      Species.find({ name: regex }),
      Civilization.find({ name: regex }), // 🔍 likely error here
      Weapon.find({ name: regex }),
      Equipment.find({ name: regex }),
    ]);

    res.json({ characters, species, civilizations, weapons, equipment });
  } catch (error) {
    console.error('Search error stack:', error.stack);  // 🧠 log full stack
    res.status(500).json({ message: 'Internal server error during search.' });
  }
};
