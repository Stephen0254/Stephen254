import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js'; // Include `.js` extension in ESM

dotenv.config();

const checkUserPasswordHash = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Look up the user by email
    const user = await User.findOne({ email: 'qrsteve.in@gmail.com' });

    if (user) {
      console.log('✅ Stored password hash for qrsteve.in@gmail.com:', user.password);
    } else {
      console.log('❌ User not found for email qrsteve.in@gmail.com');
    }

    await mongoose.disconnect();
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUserPasswordHash();
