// backend/models/worldModel.js
import mongoose from 'mongoose';

const worldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'World/Realm name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
  },
  {
    timestamps: true,
  }
);

const World = mongoose.model('World', worldSchema);
export default World;
