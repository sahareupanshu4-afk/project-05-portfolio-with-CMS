const { supabase } = require('../config/database');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');
const { sendContactEmail, sendReplyEmail } = require('../services/email.service');

/**
 * Submit contact form
 * POST /api/contact
 */
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message, phone } = req.body;

  // Get client info
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  // Save message to database
  const { data: contactMessage, error } = await supabase
    .from('messages')
    .insert({
      name,
      email,
      subject: subject || 'No Subject',
      message,
      phone: phone || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      status: 'unread',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, 'Failed to save message');
  }

  // Send email notification (async, don't wait for it)
  sendContactEmail({
    name,
    email,
    subject: subject || 'No Subject',
    message,
    phone
  }).catch(err => {
    console.error('Failed to send contact email:', err.message);
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully! I will get back to you soon.',
    data: {
      id: contactMessage.id
    }
  });
});

/**
 * Get all messages (admin)
 * GET /api/contact
 */
const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
  }

  const { data: messages, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new ApiError(500, 'Failed to fetch messages');
  }

  res.status(200).json({
    success: true,
    data: messages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get single message
 * GET /api/contact/:id
 */
const getMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: message, error } = await supabase
    .from('messages')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !message) {
    throw new ApiError(404, 'Message not found');
  }

  // Mark as read if unread
  if (message.status === 'unread') {
    await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('id', id);
    message.status = 'read';
  }

  res.status(200).json({
    success: true,
    data: message
  });
});

/**
 * Update message status
 * PUT /api/contact/:id
 */
const updateMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reply_notes } = req.body;

  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (status) {
    updateData.status = status;
  }

  if (reply_notes) {
    updateData.reply_notes = reply_notes;
    updateData.replied_at = new Date().toISOString();
  }

  const { data: message, error } = await supabase
    .from('messages')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !message) {
    throw new ApiError(404, 'Message not found or update failed');
  }

  res.status(200).json({
    success: true,
    message: 'Message updated successfully',
    data: message
  });
});

/**
 * Delete message
 * DELETE /api/contact/:id
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'Failed to delete message');
  }

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
});

/**
 * Get message stats
 * GET /api/contact/stats
 */
const getMessageStats = asyncHandler(async (req, res) => {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('status');

  if (error) {
    throw new ApiError(500, 'Failed to fetch message stats');
  }

  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Reply to a message
 * POST /api/contact/:id/reply
 */
const replyToMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage || replyMessage.trim() === '') {
    throw new ApiError(400, 'Reply message is required');
  }

  // Get the original message
  const { data: message, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !message) {
    throw new ApiError(404, 'Message not found');
  }

  // Send reply email
  try {
    await sendReplyEmail({
      to: message.email,
      name: message.name,
      subject: message.subject || 'Your message',
      replyMessage,
      originalMessage: message.message
    });
  } catch (emailError) {
    console.error('Failed to send reply email:', emailError);
    throw new ApiError(500, 'Failed to send reply email. Please check your email configuration.');
  }

  // Update message status and save reply
  const { data: updatedMessage, error: updateError } = await supabase
    .from('messages')
    .update({
      status: 'replied',
      reply_notes: replyMessage,
      replied_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw new ApiError(500, 'Failed to update message status');
  }

  res.status(200).json({
    success: true,
    message: 'Reply sent successfully!',
    data: updatedMessage
  });
});

module.exports = {
  submitContact,
  getMessages,
  getMessage,
  updateMessage,
  deleteMessage,
  getMessageStats,
  replyToMessage
};
