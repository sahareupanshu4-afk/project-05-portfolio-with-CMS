const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateParams, schemas } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/media/upload
 * @desc    Upload single image
 * @access  Private
 */
router.post('/upload', protect, mediaController.uploadImage);

/**
 * @route   POST /api/media/upload-multiple
 * @desc    Upload multiple images
 * @access  Private
 */
router.post('/upload-multiple', protect, mediaController.uploadImages);

/**
 * @route   GET /api/media/folders
 * @desc    Get all folders
 * @access  Private
 */
router.get('/folders', protect, mediaController.getFolders);

/**
 * @route   GET /api/media
 * @desc    Get all media
 * @access  Private
 */
router.get('/', protect, mediaController.getMedia);

/**
 * @route   GET /api/media/:id
 * @desc    Get single media
 * @access  Private
 */
router.get('/:id', protect, validateParams(schemas.uuidParam), mediaController.getMediaById);

/**
 * @route   PUT /api/media/:id
 * @desc    Update media
 * @access  Private
 */
router.put('/:id', protect, validateParams(schemas.uuidParam), mediaController.updateMedia);

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete media
 * @access  Private
 */
router.delete('/:id', protect, validateParams(schemas.uuidParam), mediaController.deleteMedia);

module.exports = router;