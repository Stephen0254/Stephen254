// backend/models/characterModel.js
import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    weapons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weapon', // Capitalized
      },
    ],
    equipment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment', // Capitalized
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Character = mongoose.model('Character', characterSchema);
export default Character;
