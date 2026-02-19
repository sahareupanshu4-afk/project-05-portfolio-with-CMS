const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/services.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams, schemas } = require('../middleware/validate.middleware');

/**
 * @route   GET /api/services
 * @desc    Get all services (public)
 * @access  Public
 */
router.get('/', servicesController.getServices);

/**
 * @route   GET /api/services/admin
 * @desc    Get all services (admin)
 * @access  Private
 */
router.get('/admin', protect, servicesController.getServicesAdmin);

/**
 * @route   GET /api/services/:id
 * @desc    Get single service
 * @access  Public
 */
router.get('/:id', servicesController.getService);

/**
 * @route   POST /api/services
 * @desc    Create service
 * @access  Private
 */
router.post('/', protect, validate(schemas.service), servicesController.createService);

/**
 * @route   PUT /api/services/:id
 * @desc    Update service
 * @access  Private
 */
router.put('/:id', protect, validateParams(schemas.uuidParam), validate(schemas.service), servicesController.updateService);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete service
 * @access  Private
 */
router.delete('/:id', protect, validateParams(schemas.uuidParam), servicesController.deleteService);

module.exports = router;