import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const demoUsers = [
    {
        username: 'Bhetapudi.Manasa',
        email: 'bhetapudi.manasa@example.com',
        password: '231FA07036',
        role: 'user'
    },
    {
        username: 'Sure.Yoga Priyanka',
        email: 'sure.yoga.priyanka@example.com',
        password: '231FA07046',
        role: 'user'
    }
];

const seedDemoUsers = async () => {
    try {
        await connectDB();

        // Clear existing demo users with same usernames or emails
        for (const userData of demoUsers) {
            await User.deleteMany({
                $or: [
                    { username: userData.username },
                    { email: userData.email }
                ]
            });
        }

        // Create demo users individually to trigger password hashing middleware
        for (const userData of demoUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`Created demo user: ${user.username}`);
        }

        console.log('Demo users seeded successfully');

        // List all users to verify
        const allUsers = await User.find({});
        console.log('All users in database:');
        allUsers.forEach(user => {
            console.log(`- ${user.username} (${user.email}) - ${user.role}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding demo users:', error);
        process.exit(1);
    }
};

seedDemoUsers();