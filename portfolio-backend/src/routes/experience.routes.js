const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experience.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams, schemas } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/experience
 * @desc    Get all experience (public)
 * @access  Public
 */
router.get('/', experienceController.getExperience);

/**
 * @route   GET /api/experience/admin
 * @desc    Get all experience (admin)
 * @access  Private
 */
router.get('/admin', protect, experienceController.getExperienceAdmin);

/**
 * @route   GET /api/experience/:id
 * @desc    Get single experience
 * @access  Public
 */
router.get('/:id', experienceController.getExperienceById);

/**
 * @route   POST /api/experience
 * @desc    Create experience
 * @access  Private
 */
router.post('/', protect, validate(schemas.experience), experienceController.createExperience);

/**
 * @route   PUT /api/experience/:id
 * @desc    Update experience
 * @access  Private
 */
router.put('/:id', protect, validateParams(schemas.uuidParam), validate(schemas.experience), experienceController.updateExperience);

/**
 * @route   DELETE /api/experience/:id
 * @desc    Delete experience
 * @access  Private
 */
router.delete('/:id', protect, validateParams(schemas.uuidParam), experienceController.deleteExperience);

module.exports = router;