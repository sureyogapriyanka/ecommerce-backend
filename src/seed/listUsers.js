import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const listUsers = async () => {
    try {
        await connectDB();

        // List all users
        const users = await User.find({});

        console.log('Users in database:');
        users.forEach(user => {
            console.log(`- ${user.username} (${user.email}) - ${user.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error listing users:', error);
        process.exit(1);
    }
};

listUsers();