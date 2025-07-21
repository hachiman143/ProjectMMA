const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const createTournamentValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên giải đấu phải từ 2 đến 100 ký tự'),
    body('club')
        .isMongoId()
        .withMessage('ID quán không hợp lệ'),
    body('startDate')
        .isISO8601()
        .withMessage('Ngày bắt đầu không hợp lệ'),
    body('endDate')
        .isISO8601()
        .withMessage('Ngày kết thúc không hợp lệ'),
    body('startTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Giờ bắt đầu không hợp lệ'),
    body('maxParticipants')
        .isNumeric()
        .isInt({ min: 2, max: 256 })
        .withMessage('Số người tham gia phải từ 2 đến 256'),
    body('entryFee')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Phí tham gia phải là số dương'),
    body('prizePool')
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Tổng giải thưởng phải là số dương'),
    body('tournamentType')
        .optional()
        .isIn(['single_elimination', 'double_elimination', 'round_robin', 'swiss_system'])
        .withMessage('Loại giải đấu không hợp lệ')
];

const updateTournamentValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên giải đấu phải từ 2 đến 100 ký tự'),
    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Ngày bắt đầu không hợp lệ'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('Ngày kết thúc không hợp lệ'),
    body('maxParticipants')
        .optional()
        .isNumeric()
        .isInt({ min: 2, max: 256 })
        .withMessage('Số người tham gia phải từ 2 đến 256'),
    body('entryFee')
        .optional()
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Phí tham gia phải là số dương'),
    body('prizePool')
        .optional()
        .isNumeric()
        .isFloat({ min: 0 })
        .withMessage('Tổng giải thưởng phải là số dương')
];

// Public routes
router.get('/', tournamentController.getAllTournaments);
router.get('/:id', tournamentController.getTournament);

// Protected routes
router.post('/', protect, authorize('admin', 'club_owner'), createTournamentValidation, tournamentController.createTournament);
router.put('/:id', protect, authorize('admin', 'club_owner'), updateTournamentValidation, tournamentController.updateTournament);
router.delete('/:id', protect, authorize('admin', 'club_owner'), tournamentController.deleteTournament);
router.post('/:id/register', protect, tournamentController.registerForTournament);
router.delete('/:id/unregister', protect, tournamentController.unregisterFromTournament);

module.exports = router; 