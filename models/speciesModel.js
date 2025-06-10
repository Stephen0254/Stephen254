import mongoose from 'mongoose';

const speciesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
});

// ✅ Correct ES Module Export
const Species = mongoose.model('Species', speciesSchema);
export default Species;