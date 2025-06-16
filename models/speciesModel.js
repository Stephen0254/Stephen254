import mongoose from 'mongoose';

const speciesSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  image: { type: String }, // ✅ Added this field to store image filename
});

const Species = mongoose.model('Species', speciesSchema);
export default Species;
