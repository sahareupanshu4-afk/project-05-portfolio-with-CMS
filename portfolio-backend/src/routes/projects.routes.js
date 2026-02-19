const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams, schemas } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/projects
 * @desc    Get all projects (public)
 * @access  Public
 */
router.get('/', projectsController.getProjects);

/**
 * @route   GET /api/projects/featured
 * @desc    Get featured projects
 * @access  Public
 */
router.get('/featured', projectsController.getFeaturedProjects);

/**
 * @route   GET /api/projects/admin
 * @desc    Get all projects (admin)
 * @access  Private
 */
router.get('/admin', protect, projectsController.getProjectsAdmin);

/**
 * @route   GET /api/projects/slug/:slug
 * @desc    Get project by slug
 * @access  Public
 */
router.get('/slug/:slug', projectsController.getProjectBySlug);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project
 * @access  Public
 */
router.get('/:id', projectsController.getProject);

/**
 * @route   POST /api/projects
 * @desc    Create project
 * @access  Private
 */
router.post('/', protect, validate(schemas.project), projectsController.createProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put('/:id', protect, validateParams(schemas.uuidParam), validate(schemas.project), projectsController.updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:id', protect, validateParams(schemas.uuidParam), projectsController.deleteProject);

module.exports = router;