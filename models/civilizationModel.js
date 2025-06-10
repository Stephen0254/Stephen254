// backend/models/civilizationModel.js
import mongoose from 'mongoose';

const civilizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  location: String,
  image: String,
}, { timestamps: true });

// ✅ Capitalized model name to match Mongoose convention
const Civilization = mongoose.model('Civilization', civilizationSchema);

export default Civilization;
