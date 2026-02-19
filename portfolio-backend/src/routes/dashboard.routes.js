const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', protect, dashboardController.getStats);

/**
 * @route   GET /api/dashboard/activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/activity', protect, dashboardController.getRecentActivity);

/**
 * @route   GET /api/dashboard/messages
 * @desc    Get recent messages
 * @access  Private
 */
router.get('/messages', protect, dashboardController.getRecentMessages);

module.exports = router;