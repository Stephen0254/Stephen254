import mongoose from 'mongoose';

const titleSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['species', 'civilization', 'weapon', 'equipment', 'extra'],
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Correct ES Module Export
const Title = mongoose.model('Title', titleSchema);
export default Title;