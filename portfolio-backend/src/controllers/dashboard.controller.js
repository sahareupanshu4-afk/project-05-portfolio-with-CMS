const { supabase } = require('../config/database');
const { asyncHandler } = require('../middleware/error.middleware');

/**
 * Get dashboard statistics
 * GET /api/dashboard/stats
 */
const getStats = asyncHandler(async (req, res) => {
  // Get counts from all tables
  const [
    { count: projectsCount },
    { count: blogsCount },
    { count: skillsCount },
    { count: experienceCount },
    { count: testimonialsCount },
    { count: servicesCount },
    { count: messagesCount },
    { data: messagesData }
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('skills').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('experience').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('messages').select('status')
  ]);

  // Calculate message stats
  const messageStats = {
    total: messagesData?.length || 0,
    unread: messagesData?.filter(m => m.status === 'unread').length || 0,
    read: messagesData?.filter(m => m.status === 'read').length || 0,
    replied: messagesData?.filter(m => m.status === 'replied').length || 0
  };

  res.status(200).json({
    success: true,
    data: {
      projects: projectsCount || 0,
      blogs: blogsCount || 0,
      skills: skillsCount || 0,
      experience: experienceCount || 0,
      testimonials: testimonialsCount || 0,
      services: servicesCount || 0,
      messages: messageStats
    }
  });
});

/**
 * Get recent activity
 * GET /api/dashboard/activity
 */
const getRecentActivity = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // Get recent items from various tables
  const [
    { data: recentProjects },
    { data: recentBlogs },
    { data: recentMessages }
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(parseInt(limit)),
    supabase
      .from('blogs')
      .select('id, title, is_published, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(parseInt(limit)),
    supabase
      .from('messages')
      .select('id, name, email, subject, status, created_at')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))
  ]);

  // Combine and sort activities
  const activities = [];

  recentProjects?.forEach(project => {
    activities.push({
      type: 'project',
      action: 'updated',
      id: project.id,
      title: project.title,
      timestamp: project.updated_at || project.created_at
    });
  });

  recentBlogs?.forEach(blog => {
    activities.push({
      type: 'blog',
      action: blog.is_published ? 'published' : 'draft',
      id: blog.id,
      title: blog.title,
      timestamp: blog.updated_at || blog.created_at
    });
  });

  recentMessages?.forEach(message => {
    activities.push({
      type: 'message',
      action: 'received',
      id: message.id,
      title: `Message from ${message.name}`,
      subtitle: message.subject,
      status: message.status,
      timestamp: message.created_at
    });
  });

  // Sort by timestamp
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Limit results
  const limitedActivities = activities.slice(0, parseInt(limit));

  res.status(200).json({
    success: true,
    data: limitedActivities
  });
});

/**
 * Get recent messages
 * GET /api/dashboard/messages
 */
const getRecentMessages = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, name, email, subject, status, created_at')
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  if (error) {
    throw new ApiError(500, 'Failed to fetch recent messages');
  }

  res.status(200).json({
    success: true,
    data: messages
  });
});

module.exports = {
  getStats,
  getRecentActivity,
  getRecentMessages
};