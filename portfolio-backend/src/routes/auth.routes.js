const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, verifyRefreshToken } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(schemas.login), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post('/refresh', verifyRefreshToken, authController.refreshToken);

/**
 * @route   POST /api/auth/setup
 * @desc    Create initial admin user (only if no admin exists)
 * @access  Public
 */
router.post('/setup', authController.setupAdmin);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, authController.updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
router.put('/password', protect, authController.changePassword);

module.exports = router;