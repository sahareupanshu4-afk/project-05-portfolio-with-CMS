const { supabase } = require('../config/database');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

/**
 * Get all blogs (public - published only)
 * GET /api/blogs
 */
const getBlogs = asyncHandler(async (req, res) => {
  const { category, tag, limit } = req.query;

  let query = supabase
    .from('blogs')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      category,
      tags,
      read_time,
      published_at,
      is_featured,
      meta_title,
      meta_description,
      created_at
    `)
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (tag) {
    query = query.contains('tags', [tag]);
  }

  if (limit) {
    query = query.limit(parseInt(limit));
  }

  const { data: blogs, error } = await query;

  if (error) {
    throw new ApiError(500, 'Failed to fetch blogs');
  }

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});

/**
 * Get all blogs (admin)
 * GET /api/blogs/admin
 */
const getBlogsAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status, search } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('blogs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (status === 'published') {
    query = query.eq('is_published', true);
  } else if (status === 'draft') {
    query = query.eq('is_published', false);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  const { data: blogs, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new ApiError(500, 'Failed to fetch blogs');
  }

  res.status(200).json({
    success: true,
    data: blogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

/**
 * Get single blog by ID
 * GET /api/blogs/:id
 */
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !blog) {
    throw new ApiError(404, 'Blog not found');
  }

  res.status(200).json({
    success: true,
    data: blog
  });
});

/**
 * Get blog by slug
 * GET /api/blogs/slug/:slug
 */
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const { data: blog, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !blog) {
    throw new ApiError(404, 'Blog not found');
  }

  res.status(200).json({
    success: true,
    data: blog
  });
});

/**
 * Create blog
 * POST /api/blogs
 */
const createBlog = asyncHandler(async (req, res) => {
  const blogData = {
    ...req.body,
    author_id: req.user?.id,
    created_at: new Date().toISOString()
  };

  // Set published_at if is_published is true
  if (blogData.is_published && !blogData.published_at) {
    blogData.published_at = new Date().toISOString();
  }

  const { data: blog, error } = await supabase
    .from('blogs')
    .insert(blogData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'Blog with this slug already exists');
    }
    throw new ApiError(500, 'Failed to create blog');
  }

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    data: blog
  });
});

/**
 * Update blog
 * PUT /api/blogs/:id
 */
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateData = {
    ...req.body,
    updated_at: new Date().toISOString()
  };

  // Set published_at if is_published is being set to true for the first time
  if (updateData.is_published) {
    const { data: existingBlog } = await supabase
      .from('blogs')
      .select('is_published, published_at')
      .eq('id', id)
      .single();

    if (existingBlog && !existingBlog.is_published && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data: blog, error } = await supabase
    .from('blogs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'Blog with this slug already exists');
    }
    throw new ApiError(404, 'Blog not found or update failed');
  }

  res.status(200).json({
    success: true,
    message: 'Blog updated successfully',
    data: blog
  });
});

/**
 * Delete blog
 * DELETE /api/blogs/:id
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    throw new ApiError(500, 'Failed to delete blog');
  }

  res.status(200).json({
    success: true,
    message: 'Blog deleted successfully'
  });
});

/**
 * Get featured blogs
 * GET /api/blogs/featured
 */
const getFeaturedBlogs = asyncHandler(async (req, res) => {
  const { limit = 3 } = req.query;

  const { data: blogs, error } = await supabase
    .from('blogs')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      category,
      tags,
      read_time,
      published_at
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(parseInt(limit));

  if (error) {
    throw new ApiError(500, 'Failed to fetch featured blogs');
  }

  res.status(200).json({
    success: true,
    count: blogs.length,
    data: blogs
  });
});

/**
 * Get blog categories
 * GET /api/blogs/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('blogs')
    .select('category')
    .eq('is_published', true)
    .not('category', 'is', null);

  if (error) {
    throw new ApiError(500, 'Failed to fetch categories');
  }

  const categories = [...new Set(data.map(item => item.category).filter(Boolean))];

  res.status(200).json({
    success: true,
    data: categories
  });
});

/**
 * Get blog tags
 * GET /api/blogs/tags
 */
const getTags = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('blogs')
    .select('tags')
    .eq('is_published', true);

  if (error) {
    throw new ApiError(500, 'Failed to fetch tags');
  }

  const allTags = data.flatMap(item => item.tags || []);
  const uniqueTags = [...new Set(allTags)];

  res.status(200).json({
    success: true,
    data: uniqueTags
  });
});

module.exports = {
  getBlogs,
  getBlogsAdmin,
  getBlog,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
  getCategories,
  getTags
};