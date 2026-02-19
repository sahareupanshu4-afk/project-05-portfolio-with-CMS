const { supabase } = require('../config/database');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

/**
 * Get all testimonials (public)
 * GET /api/testimonials
 */
const getTestimonials = asyncHandler(async (req, res) => {
  const { limit } = req.query;

  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const { data: testimonials, error } = await query;

  if (error) {
    throw new ApiError(500, 'Failed to fetch testimonials');
  }

  res.status(200).json({
    success: true,
    count: testimonials.length,
    data: testimonials
  });
});

/**
 * Get all testimonials (admin)
 * GET /api/testimonials/admin
 */
const getTestimonialsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('testimonials')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%`);
  }

  const { data: testimonials, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new ApiError(500, 'Failed to fetch testimonials');
  }

  res.status(200).json({
    success: true,
    data: testimonials,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get single testimonial
 * GET /api/testimonials/:id
 */
const getTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: testimonial, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !testimonial) {
    throw new ApiError(404, 'Testimonial not found');
  }

  res.status(200).json({
    success: true,
    data: testimonial
  });
});

/**
 * Create testimonial
 * POST /api/testimonials
 */
const createTestimonial = asyncHandler(async (req, res) => {
  const testimonialData = {
    ...req.body,
    created_at: new Date().toISOString()
  };

  const { data: testimonial, error } = await supabase
    .from('testimonials')
    .insert(testimonialData)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, 'Failed to create testimonial');
  }

  res.status(201).json({
    success: true,
    message: 'Testimonial created successfully',
    data: testimonial
  });
});

/**
 * Update testimonial
 * PUT /api/testimonials/:id
 */
const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateData = {
    ...req.body,
    updated_at: new Date().toISOString()
  };

  const { data: testimonial, error } = await supabase
    .from('testimonials')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !testimonial) {
    throw new ApiError(404, 'Testimonial not found or update failed');
  }

  res.status(200).json({
    success: true,
    message: 'Testimonial updated successfully',
    data: testimonial
  });
});

/**
 * Delete testimonial
 * DELETE /api/testimonials/:id
 */
const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'Failed to delete testimonial');
  }

  res.status(200).json({
    success: true,
    message: 'Testimonial deleted successfully'
  });
});

module.exports = {
  getTestimonials,
  getTestimonialsAdmin,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
};