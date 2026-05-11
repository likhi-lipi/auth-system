const User = require('../models/User');

// ─── @route  GET /api/users ───────────────────────────────────────────────────
// ─── @access Private | Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @route  GET /api/users/:id ──────────────────────────────────────────────
// ─── @access Private | Admin (any user), Student (own profile only)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Students can only view their own profile
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.',
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── @route  PUT /api/users/:id ──────────────────────────────────────────────
// ─── @access Private | Admin (any user), Student (own profile only)
const updateUser = async (req, res, next) => {
  try {
    // Students can only update their own profile
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.',
      });
    }

    // Fields a student is allowed to update
    const allowedStudentFields = ['name', 'bio'];
    // Fields an admin is allowed to update
    const allowedAdminFields = ['name', 'bio', 'role'];

    const allowedFields =
      req.user.role === 'admin' ? allowedAdminFields : allowedStudentFields;

    // Filter out disallowed fields from request body
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: `No valid fields to update. Allowed: ${allowedFields.join(', ')}`,
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ─── @route  DELETE /api/users/:id ───────────────────────────────────────────
// ─── @access Private | Admin only
const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User "${user.name}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
