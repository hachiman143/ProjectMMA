const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/bookings', protect, userController.getUserBookings);
router.get('/tournaments', protect, userController.getUserTournaments);

// Admin routes
router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.get('/:id', protect, authorize('admin'), userController.getUser);
router.put('/:id', protect, authorize('admin'), userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router; 