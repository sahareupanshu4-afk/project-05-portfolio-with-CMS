const { supabase } = require('../config/database');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

/**
 * Get about information
 * GET /api/about
 */
const getAbout = asyncHandler(async (req, res) => {
  const { data: about, error } = await supabase
    .from('about')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new ApiError(500, 'Failed to fetch about information');
  }

  res.status(200).json({
    success: true,
    data: about || null
  });
});

/**
 * Get about information (admin - includes inactive)
 * GET /api/about/admin
 */
const getAboutAdmin = asyncHandler(async (req, res) => {
  const { data: about, error } = await supabase
    .from('about')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, 'Failed to fetch about information');
  }

  res.status(200).json({
    success: true,
    data: about[0] || null
  });
});

/**
 * Create or update about information
 * PUT /api/about
 */
const upsertAbout = asyncHandler(async (req, res) => {
  const aboutData = {
    ...req.body,
    updated_at: new Date().toISOString()
  };

  // Check if about exists
  const { data: existing } = await supabase
    .from('about')
    .select('id')
    .limit(1)
    .single();

  let result;
  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('about')
      .update(aboutData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new ApiError(500, 'Failed to update about information');
    result = data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('about')
      .insert(aboutData)
      .select()
      .single();

    if (error) throw new ApiError(500, 'Failed to create about information');
    result = data;
  }

  res.status(200).json({
    success: true,
    message: 'About information saved successfully',
    data: result
  });
});

/**
 * Delete about information
 * DELETE /api/about/:id
 */
const deleteAbout = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('about')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'Failed to delete about information');
  }

  res.status(200).json({
    success: true,
    message: 'About information deleted successfully'
  });
});

module.exports = {
  getAbout,
  getAboutAdmin,
  upsertAbout,
  deleteAbout
};