import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../server.js'; // Use the loaded secret from server.js

// Generate JWT
const generateToken = (id) => {
    if (!JWT_SECRET) {
        console.error('❌ JWT_SECRET is not defined!');
        throw new Error('JWT secret is missing, cannot generate token');
    }

    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('🟢 Register attempt:', username, email);

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            console.log('⚠️ User already exists:', username, email);
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Create user
        const user = new User({ username, email, password });
        await user.save();
        console.log('🟢 User created:', user._id);

        const token = generateToken(user._id);
        console.log('🟢 Token generated:', token);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Register user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('🟢 Login attempt:', username);

        const user = await User.findOne({
            $or: [{ email: username }, { username }]
        });

        if (user && (await user.comparePassword(password))) {
            console.log('🟢 User authenticated:', user._id);

            const token = generateToken(user._id);
            console.log('🟢 Token generated:', token);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    },
                    token
                }
            });
        } else {
            console.log('⚠️ Invalid credentials for user:', username);
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (user) {
            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            if (req.body.password) user.password = req.body.password;

            const updatedUser = await user.save();

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: {
                        id: updatedUser._id,
                        username: updatedUser.username,
                        email: updatedUser.email,
                        role: updatedUser.role
                    }
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
};
