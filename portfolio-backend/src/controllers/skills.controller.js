const { supabase } = require('../config/database');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

/**
 * Get all skills (public)
 * GET /api/skills
 */
const getSkills = asyncHandler(async (req, res) => {
  const { category } = req.query;

  let query = supabase
    .from('skills')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data: skills, error } = await query;

  if (error) {
    console.error('Supabase error fetching skills:', error);
    throw new ApiError(500, `Failed to fetch skills: ${error.message}`);
  }

  res.status(200).json({
    success: true,
    count: skills.length,
    data: skills
  });
});

/**
 * Get all skills (admin)
 * GET /api/skills/admin
 */
const getSkillsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('skills')
    .select('*', { count: 'exact' })
    .order('display_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data: skills, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new ApiError(500, 'Failed to fetch skills');
  }

  res.status(200).json({
    success: true,
    data: skills,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get single skill
 * GET /api/skills/:id
 */
const getSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: skill, error } = await supabase
    .from('skills')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !skill) {
    throw new ApiError(404, 'Skill not found');
  }

  res.status(200).json({
    success: true,
    data: skill
  });
});

/**
 * Create skill
 * POST /api/skills
 */
const createSkill = asyncHandler(async (req, res) => {
  const skillData = {
    ...req.body,
    created_at: new Date().toISOString()
  };

  const { data: skill, error } = await supabase
    .from('skills')
    .insert(skillData)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, 'Failed to create skill');
  }

  res.status(201).json({
    success: true,
    message: 'Skill created successfully',
    data: skill
  });
});

/**
 * Update skill
 * PUT /api/skills/:id
 */
const updateSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateData = {
    ...req.body,
    updated_at: new Date().toISOString()
  };

  const { data: skill, error } = await supabase
    .from('skills')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !skill) {
    throw new ApiError(404, 'Skill not found or update failed');
  }

  res.status(200).json({
    success: true,
    message: 'Skill updated successfully',
    data: skill
  });
});

/**
 * Delete skill
 * DELETE /api/skills/:id
 */
const deleteSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'Failed to delete skill');
  }

  res.status(200).json({
    success: true,
    message: 'Skill deleted successfully'
  });
});

/**
 * Get skill categories
 * GET /api/skills/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('skills')
    .select('category')
    .eq('is_active', true);

  if (error) {
    throw new ApiError(500, 'Failed to fetch categories');
  }

  const categories = [...new Set(data.map(item => item.category).filter(Boolean))];

  res.status(200).json({
    success: true,
    data: categories
  });
});

module.exports = {
  getSkills,
  getSkillsAdmin,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  getCategories
};