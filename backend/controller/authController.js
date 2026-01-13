const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt =require('bcryptjs')
require('dotenv').config();

// Register user
const register = async (req, res) => {
  try {
    let { name, password, role } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "Name and password required" });
    }

    // ✅ remove gaps (spaces) and normalize username
    name = name.replace(/\s+/g, "").toLowerCase();

    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      role,
      password: await bcrypt.hash(password, 10),
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Login user
const login = async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) return res.status(400).json({ message: 'Name and password required' });

    const user = await User.findOne({ name });
    if (!user) return res.status(400).json({ message: 'user doesnot exists!' });

    const isMatch = await bcrypt.compare(password,user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
