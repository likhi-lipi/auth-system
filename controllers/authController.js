const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: Generate JWT ─────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ─── Helper: Send token response ─────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
// ─── @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Prevent students from self-assigning admin role
    const assignedRole = role === 'admin' ? 'student' : role || 'student';

    const user = await User.create({ name, email, password, role: assignedRole });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
// ─── @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// ─── @access Private (any authenticated user)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
