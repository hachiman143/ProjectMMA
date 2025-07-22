
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const homeController = require('../controllers/home.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/homes', homeController.getQuickStats);

module.exports = router;
