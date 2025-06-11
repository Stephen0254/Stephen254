// backend/routes/searchRoutes.js
import express from 'express';

import Character from '../models/characterModel.js';
import Weapon from '../models/weaponModel.js';
import Species from '../models/speciesModel.js';
import Civilization from '../models/civilizationModel.js';
import Title from '../models/titleModel.js';
import Equipment from '../models/equipmentModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const query = req.query.q?.trim();
  console.log(`🔍 Search query received: "${query}"`);

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    const regex = new RegExp(query, 'i'); // case-insensitive regex

    const [characters, weapons, species, civilizations, titles, equipment] = await Promise.all([
      Character.find({ name: regex }).sort('name'),
      Weapon.find({ name: regex }).sort('name'),
      Species.find({ name: regex }).sort('name'),
      Civilization.find({ name: regex }).sort('name'),
      Title.find({ name: regex }).sort('name'),
      Equipment.find({ name: regex }).sort('name'),
    ]);

    console.log(`✅ Search Results:
      Characters: ${characters.length}
      Weapons: ${weapons.length}
      Species: ${species.length}
      Civilizations: ${civilizations.length}
      Titles: ${titles.length}
      Equipment: ${equipment.length}
    `);

    res.json({
      characters,
      weapons,
      species,
      civilizations,
      titles,
      equipment,
    });
  } catch (error) {
    console.error('❌ Error during search:', error.message);
    res.status(500).json({ message: 'Internal server error during search.' });
  }
});

export default router;
