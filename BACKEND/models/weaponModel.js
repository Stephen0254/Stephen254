// backend/models/weaponModel.js
import mongoose from 'mongoose';

const weaponSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

const Weapon = mongoose.model('Weapon', weaponSchema);

export default Weapon;
