const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const createClubValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên quán phải từ 2 đến 100 ký tự'),
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Địa chỉ là bắt buộc'),
    body('phone')
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email không hợp lệ'),
    body('pricePerHour')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Giá thuê phải là số dương'),
    body('location.coordinates')
        .isArray({ min: 2, max: 2 })
        .withMessage('Tọa độ phải có 2 giá trị [longitude, latitude]'),
    body('location.coordinates.*')
        .isNumeric()
        .withMessage('Tọa độ phải là số')
];

const updateClubValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên quán phải từ 2 đến 100 ký tự'),
    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email không hợp lệ'),
    body('pricePerHour')
        .optional()
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Giá thuê phải là số dương')
];

const rateClubValidation = [
    body('rating')
        .isNumeric()
        .isFloat({ min: 1, max: 5 })
        .withMessage('Đánh giá phải từ 1 đến 5')
];

// Public routes
router.get('/', clubController.getAllClubs);
router.get('/:id', clubController.getClub);

// Protected routes
router.post('/', protect, authorize('admin', 'club_owner'), createClubValidation, clubController.createClub);
router.put('/:id', protect, authorize('admin', 'club_owner'), updateClubValidation, clubController.updateClub);
router.delete('/:id', protect, authorize('admin', 'club_owner'), clubController.deleteClub);
router.post('/:id/rate', protect, rateClubValidation, clubController.rateClub);

module.exports = router; 