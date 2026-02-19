const { supabase } = require('../config/database');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

/**
 * Get all experience (public)
 * GET /api/experience
 */
const getExperience = asyncHandler(async (req, res) => {
  const { data: experience, error } = await supabase
    .from('experience')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('start_date', { ascending: false });

  if (error) {
    throw new ApiError(500, 'Failed to fetch experience');
  }

  res.status(200).json({
    success: true,
    count: experience.length,
    data: experience
  });
});

/**
 * Get all experience (admin)
 * GET /api/experience/admin
 */
const getExperienceAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('experience')
    .select('*', { count: 'exact' })
    .order('start_date', { ascending: false });

  if (search) {
    query = query.or(`company.ilike.%${search}%,position.ilike.%${search}%`);
  }

  const { data: experience, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new ApiError(500, 'Failed to fetch experience');
  }

  res.status(200).json({
    success: true,
    data: experience,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get single experience
 * GET /api/experience/:id
 */
const getExperienceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: experience, error } = await supabase
    .from('experience')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !experience) {
    throw new ApiError(404, 'Experience not found');
  }

  res.status(200).json({
    success: true,
    data: experience
  });
});

/**
 * Create experience
 * POST /api/experience
 */
const createExperience = asyncHandler(async (req, res) => {
  const experienceData = {
    ...req.body,
    created_at: new Date().toISOString()
  };

  const { data: experience, error } = await supabase
    .from('experience')
    .insert(experienceData)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, 'Failed to create experience');
  }

  res.status(201).json({
    success: true,
    message: 'Experience created successfully',
    data: experience
  });
});

/**
 * Update experience
 * PUT /api/experience/:id
 */
const updateExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateData = {
    ...req.body,
    updated_at: new Date().toISOString()
  };

  const { data: experience, error } = await supabase
    .from('experience')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !experience) {
    throw new ApiError(404, 'Experience not found or update failed');
  }

  res.status(200).json({
    success: true,
    message: 'Experience updated successfully',
    data: experience
  });
});

/**
 * Delete experience
 * DELETE /api/experience/:id
 */
const deleteExperience = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('experience')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'Failed to delete experience');
  }

  res.status(200).json({
    success: true,
    message: 'Experience deleted successfully'
  });
});

module.exports = {
  getExperience,
  getExperienceAdmin,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience
};