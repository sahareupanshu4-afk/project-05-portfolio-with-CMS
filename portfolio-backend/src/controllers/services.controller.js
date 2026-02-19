const { supabase } = require('../config/database');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

/**
 * Get all services (public)
 * GET /api/services
 */
const getServices = asyncHandler(async (req, res) => {
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    throw new ApiError(500, 'Failed to fetch services');
  }

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

/**
 * Get all services (admin)
 * GET /api/services/admin
 */
const getServicesAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('services')
    .select('*', { count: 'exact' })
    .order('display_order', { ascending: true });

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: services, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new ApiError(500, 'Failed to fetch services');
  }

  res.status(200).json({
    success: true,
    data: services,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get single service
 * GET /api/services/:id
 */
const getService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !service) {
    throw new ApiError(404, 'Service not found');
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

/**
 * Create service
 * POST /api/services
 */
const createService = asyncHandler(async (req, res) => {
  const serviceData = {
    ...req.body,
    created_at: new Date().toISOString()
  };

  const { data: service, error } = await supabase
    .from('services')
    .insert(serviceData)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, 'Failed to create service');
  }

  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    data: service
  });
});

/**
 * Update service
 * PUT /api/services/:id
 */
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateData = {
    ...req.body,
    updated_at: new Date().toISOString()
  };

  const { data: service, error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !service) {
    throw new ApiError(404, 'Service not found or update failed');
  }

  res.status(200).json({
    success: true,
    message: 'Service updated successfully',
    data: service
  });
});

/**
 * Delete service
 * DELETE /api/services/:id
 */
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'Failed to delete service');
  }

  res.status(200).json({
    success: true,
    message: 'Service deleted successfully'
  });
});

module.exports = {
  getServices,
  getServicesAdmin,
  getService,
  createService,
  updateService,
  deleteService
};