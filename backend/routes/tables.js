const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const createTableValidation = [
    body('number')
        .isNumeric()
        .isInt({ min: 1 })
        .withMessage('Số bàn phải là số nguyên dương'),
    body('type')
        .isIn(['Standard', 'VIP', 'Tournament'])
        .withMessage('Loại bàn không hợp lệ'),
    body('pricePerHour')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Giá thuê phải là số dương'),
    body('club')
        .isMongoId()
        .withMessage('ID quán không hợp lệ'),
    body('description')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Mô tả không được quá 200 ký tự')
];

const updateTableValidation = [
    body('number')
        .optional()
        .isNumeric()
        .isInt({ min: 1 })
        .withMessage('Số bàn phải là số nguyên dương'),
    body('type')
        .optional()
        .isIn(['Standard', 'VIP', 'Tournament'])
        .withMessage('Loại bàn không hợp lệ'),
    body('pricePerHour')
        .optional()
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Giá thuê phải là số dương'),
    body('status')
        .optional()
        .isIn(['available', 'occupied', 'maintenance', 'reserved'])
        .withMessage('Trạng thái không hợp lệ')
];

// Public routes
router.get('/club/:clubId', tableController.getClubTables);
router.get('/:id', tableController.getTable);

// Protected routes
router.post('/', protect, authorize('admin', 'club_owner'), createTableValidation, tableController.createTable);
router.put('/:id', protect, authorize('admin', 'club_owner'), updateTableValidation, tableController.updateTable);
router.delete('/:id', protect, authorize('admin', 'club_owner'), tableController.deleteTable);
router.put('/:id/status', protect, authorize('admin', 'club_owner'), tableController.updateTableStatus);

module.exports = router; 