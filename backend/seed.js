import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/UserModel.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGOURI);
    console.log('✅ MongoDB connected');

    // Check if dummy user already exists
    const existingUser = await User.findOne({ email: 'test@university.edu' });
    if (existingUser) {
      console.log('⚠️  Dummy user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create dummy user
    const dummyUser = new User({
      name: 'John Doe',
      email: 'test@university.edu',
      password: hashedPassword,
      college: 'Engineering',
      phone: '+1234567890',
      bio: 'Test user for Campus Connect',
      isActive: true
    });

    await dummyUser.save();
    console.log('✅ Dummy user created successfully');
    console.log({
      id: dummyUser._id,
      name: dummyUser.name,
      email: dummyUser.email,
      message: 'Use these credentials to login: email: test@university.edu, password: password123'
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
