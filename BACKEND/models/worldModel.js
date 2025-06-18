// backend/models/worldModel.js
import mongoose from 'mongoose';

const worldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const World = mongoose.model('World', worldSchema);
export default World;
