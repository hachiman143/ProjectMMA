const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Tên phải từ 2 đến 50 ký tự'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email không hợp lệ'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email không hợp lệ'),
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu là bắt buộc')
];

const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Tên phải từ 2 đến 50 ký tự'),
    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Mật khẩu hiện tại là bắt buộc'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
];

// get me 
 const getProfileValidation = [
    body('id')
        .isMongoId()
        .withMessage('ID người dùng không hợp lệ')
 ]; 
 
// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, updateProfileValidation, authController.updateProfile);
router.put('/change-password', protect, changePasswordValidation, authController.changePassword);

module.exports = router; 