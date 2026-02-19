const express = require('express');
const router = express.Router();
const testimonialsController = require('../controllers/testimonials.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams, schemas } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/testimonials
 * @desc    Get all testimonials (public)
 * @access  Public
 */
router.get('/', testimonialsController.getTestimonials);

/**
 * @route   GET /api/testimonials/admin
 * @desc    Get all testimonials (admin)
 * @access  Private
 */
router.get('/admin', protect, testimonialsController.getTestimonialsAdmin);

/**
 * @route   GET /api/testimonials/:id
 * @desc    Get single testimonial
 * @access  Public
 */
router.get('/:id', testimonialsController.getTestimonial);

/**
 * @route   POST /api/testimonials
 * @desc    Create testimonial
 * @access  Private
 */
router.post('/', protect, validate(schemas.testimonial), testimonialsController.createTestimonial);

/**
 * @route   PUT /api/testimonials/:id
 * @desc    Update testimonial
 * @access  Private
 */
router.put('/:id', protect, validateParams(schemas.uuidParam), validate(schemas.testimonial), testimonialsController.updateTestimonial);

/**
 * @route   DELETE /api/testimonials/:id
 * @desc    Delete testimonial
 * @access  Private
 */
router.delete('/:id', protect, validateParams(schemas.uuidParam), testimonialsController.deleteTestimonial);

module.exports = router;