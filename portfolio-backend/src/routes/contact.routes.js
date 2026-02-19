const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, validateParams, schemas } = require('../middleware/validate.middleware');

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post('/', validate(schemas.contact), contactController.submitContact);

/**
 * @route   GET /api/contact/stats
 * @desc    Get message statistics
 * @access  Private
 */
router.get('/stats', protect, contactController.getMessageStats);

/**
 * @route   GET /api/contact
 * @desc    Get all messages (admin)
 * @access  Private
 */
router.get('/', protect, contactController.getMessages);

/**
 * @route   GET /api/contact/:id
 * @desc    Get single message
 * @access  Private
 */
router.get('/:id', protect, validateParams(schemas.uuidParam), contactController.getMessage);

/**
 * @route   POST /api/contact/:id/reply
 * @desc    Reply to a message
 * @access  Private
 */
router.post('/:id/reply', protect, validateParams(schemas.uuidParam), contactController.replyToMessage);

/**
 * @route   PUT /api/contact/:id
 * @desc    Update message status
 * @access  Private
 */
router.put('/:id', protect, validateParams(schemas.uuidParam), contactController.updateMessage);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete message
 * @access  Private
 */
router.delete('/:id', protect, validateParams(schemas.uuidParam), contactController.deleteMessage);

module.exports = router;