const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogs.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams, schemas } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/blogs
 * @desc    Get all blogs (public - published only)
 * @access  Public
 */
router.get('/', blogsController.getBlogs);

/**
 * @route   GET /api/blogs/featured
 * @desc    Get featured blogs
 * @access  Public
 */
router.get('/featured', blogsController.getFeaturedBlogs);

/**
 * @route   GET /api/blogs/categories
 * @desc    Get blog categories
 * @access  Public
 */
router.get('/categories', blogsController.getCategories);

/**
 * @route   GET /api/blogs/tags
 * @desc    Get blog tags
 * @access  Public
 */
router.get('/tags', blogsController.getTags);

/**
 * @route   GET /api/blogs/admin
 * @desc    Get all blogs (admin)
 * @access  Private
 */
router.get('/admin', protect, blogsController.getBlogsAdmin);

/**
 * @route   GET /api/blogs/slug/:slug
 * @desc    Get blog by slug
 * @access  Public
 */
router.get('/slug/:slug', blogsController.getBlogBySlug);

/**
 * @route   GET /api/blogs/:id
 * @desc    Get single blog
 * @access  Public
 */
router.get('/:id', blogsController.getBlog);

/**
 * @route   POST /api/blogs
 * @desc    Create blog
 * @access  Private
 */
router.post('/', protect, validate(schemas.blog), blogsController.createBlog);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update blog
 * @access  Private
 */
router.put('/:id', protect, validateParams(schemas.uuidParam), validate(schemas.blog), blogsController.updateBlog);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete blog
 * @access  Private
 */
router.delete('/:id', protect, validateParams(schemas.uuidParam), blogsController.deleteBlog);

module.exports = router;