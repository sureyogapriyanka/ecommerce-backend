import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../server.js'; // secret loaded in server.js

// Generate JWT
const generateToken = (id) => {
  if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined!');
    throw new Error('JWT secret is missing, cannot generate token');
  }
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, phone, dateOfBirth, gender, bio, street, city, state, zipCode, country } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with address information
    const user = new User({ 
      username, 
      email, 
      password,
      phone: phone || '',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || 'prefer-not-to-say',
      bio: bio || '',
      address: {
        street: street || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        country: country || 'India'
      }
    });
    
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bio: user.bio,
        role: user.role,
        address: user.address
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ $or: [{ email: username }, { username }] });

    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id);

      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          address: user.address
        },
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          bio: user.bio,
          role: user.role,
          address: user.address
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      // Update basic information
      if (req.body.username !== undefined) user.username = req.body.username;
      if (req.body.email !== undefined) user.email = req.body.email;
      if (req.body.password) {
        // Validate password length when updating
        if (req.body.password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        user.password = req.body.password;
      }
      
      // Update personal information
      if (req.body.phone !== undefined) user.phone = req.body.phone;
      if (req.body.dateOfBirth !== undefined) user.dateOfBirth = req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined;
      if (req.body.gender !== undefined) user.gender = req.body.gender;
      if (req.body.bio !== undefined) user.bio = req.body.bio;
      
      // Update address information if provided
      if (req.body.street !== undefined) user.address.street = req.body.street;
      if (req.body.city !== undefined) user.address.city = req.body.city;
      if (req.body.state !== undefined) user.address.state = req.body.state;
      if (req.body.zipCode !== undefined) user.address.zipCode = req.body.zipCode;
      if (req.body.country !== undefined) user.address.country = req.body.country;

      const updatedUser = await user.save();

      res.json({
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
          dateOfBirth: updatedUser.dateOfBirth,
          gender: updatedUser.gender,
          bio: updatedUser.bio,
          role: updatedUser.role,
          address: updatedUser.address
        }
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: error.message || 'Server error during profile update' });
  }
};

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};