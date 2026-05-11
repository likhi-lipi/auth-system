const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes below require authentication
router.use(protect);

// GET /api/users — Admin only
router.get('/', authorize('admin'), getAllUsers);

// GET /api/users/:id — Admin: any user | Student: own profile only
router.get('/:id', getUserById);

// PUT /api/users/:id — Admin: any user | Student: own profile only
router.put('/:id', updateUser);

// DELETE /api/users/:id — Admin only
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
