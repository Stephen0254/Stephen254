// backend/models/equipmentModel.js
import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    image: String,
  },
  { timestamps: true }
);

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;
