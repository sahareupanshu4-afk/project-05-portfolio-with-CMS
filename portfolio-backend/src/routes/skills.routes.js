const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams, schemas } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/skills
 * @desc    Get all skills (public)
 * @access  Public
 */
router.get('/', skillsController.getSkills);

/**
 * @route   GET /api/skills/categories
 * @desc    Get skill categories
 * @access  Public
 */
router.get('/categories', skillsController.getCategories);

/**
 * @route   GET /api/skills/admin
 * @desc    Get all skills (admin)
 * @access  Private
 */
router.get('/admin', protect, skillsController.getSkillsAdmin);

/**
 * @route   GET /api/skills/:id
 * @desc    Get single skill
 * @access  Public
 */
router.get('/:id', skillsController.getSkill);

/**
 * @route   POST /api/skills
 * @desc    Create skill
 * @access  Private
 */
router.post('/', protect, validate(schemas.skill), skillsController.createSkill);

/**
 * @route   PUT /api/skills/:id
 * @desc    Update skill
 * @access  Private
 */
router.put('/:id', protect, validateParams(schemas.uuidParam), validate(schemas.skill), skillsController.updateSkill);

/**
 * @route   DELETE /api/skills/:id
 * @desc    Delete skill
 * @access  Private
 */
router.delete('/:id', protect, validateParams(schemas.uuidParam), skillsController.deleteSkill);

module.exports = router;