const { supabase } = require('../config/database');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

/**
 * Get all projects (public)
 * GET /api/projects
 */
const getProjects = asyncHandler(async (req, res) => {
  const { category, featured, limit } = req.query;

  let query = supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (featured === 'true') {
    query = query.eq('featured', true);
  }

  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const { data: projects, error } = await query;

  if (error) {
    throw new ApiError(500, 'Failed to fetch projects');
  }

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

/**
 * Get all projects (admin)
 * GET /api/projects/admin
 */
const getProjectsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: projects, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new ApiError(500, 'Failed to fetch projects');
  }

  res.status(200).json({
    success: true,
    data: projects,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get single project by ID
 * GET /api/projects/:id
 */
const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !project) {
    throw new ApiError(404, 'Project not found');
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

/**
 * Get project by slug
 * GET /api/projects/slug/:slug
 */
const getProjectBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !project) {
    throw new ApiError(404, 'Project not found');
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

/**
 * Create project
 * POST /api/projects
 */
const createProject = asyncHandler(async (req, res) => {
  const projectData = {
    ...req.body,
    created_at: new Date().toISOString()
  };

  const { data: project, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'Project with this slug already exists');
    }
    throw new ApiError(500, 'Failed to create project');
  }

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project
  });
});

/**
 * Update project
 * PUT /api/projects/:id
 */
const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateData = {
    ...req.body,
    updated_at: new Date().toISOString()
  };

  const { data: project, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'Project with this slug already exists');
    }
    throw new ApiError(404, 'Project not found or update failed');
  }

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: project
  });
});

/**
 * Delete project
 * DELETE /api/projects/:id
 */
const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'Failed to delete project');
  }

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully'
  });
});

/**
 * Get featured projects
 * GET /api/projects/featured
 */
const getFeaturedProjects = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_active', true)
    .eq('featured', true)
    .order('display_order', { ascending: true })
    .limit(parseInt(limit));

  if (error) {
    throw new ApiError(500, 'Failed to fetch featured projects');
  }

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

module.exports = {
  getProjects,
  getProjectsAdmin,
  getProject,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  getFeaturedProjects
};