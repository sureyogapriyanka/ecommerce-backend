import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  }
];

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany();

    // Create users individually to trigger password hashing middleware
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.username}`);
    }

    console.log('Users seeded successfully');

    // List all users to verify
    const allUsers = await User.find({});
    console.log('Users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();