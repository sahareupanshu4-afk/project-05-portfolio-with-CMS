const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/about
 * @desc    Get about information (public)
 * @access  Public
 */
router.get('/', aboutController.getAbout);

/**
 * @route   GET /api/about/admin
 * @desc    Get about information (admin)
 * @access  Private
 */
router.get('/admin', protect, aboutController.getAboutAdmin);

/**
 * @route   PUT /api/about
 * @desc    Create or update about information
 * @access  Private
 */
router.put('/', protect, validate(schemas.about), aboutController.upsertAbout);

/**
 * @route   DELETE /api/about/:id
 * @desc    Delete about information
 * @access  Private
 */
router.delete('/:id', protect, aboutController.deleteAbout);

module.exports = router;