import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance for backend API (optional, for media uploads etc.)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired, sign out
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to get current session token
const getAuthToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Auth API (using Supabase directly)
export const authAPI = {
  login: async (credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return { data: { data: data.user } };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { data: { message: 'Logged out' } };
  },
  getProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      return { data: { data: userData } };
    }
    return { data: { data: null } };
  },
  updateProfile: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return { data: { data: updatedUser } };
    }
  },
  changePassword: async (data) => {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    });
    if (error) throw error;
    return { data: { message: 'Password changed' } };
  },
};

// About API (using Supabase directly)
export const aboutAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .eq('is_active', true)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  getAdmin: async () => {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  update: async (updateData) => {
    const { data: existing } = await supabase
      .from('about')
      .select('id')
      .single();
    
    if (existing) {
      const { data, error } = await supabase
        .from('about')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return { data: { data } };
    } else {
      const { data, error } = await supabase
        .from('about')
        .insert(updateData)
        .select()
        .single();
      if (error) throw error;
      return { data: { data } };
    }
  },
};

// Skills API (using Supabase directly)
export const skillsAPI = {
  getAll: async (params) => {
    let query = supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  getAdmin: async (params) => {
    let query = supabase
      .from('skills')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  getOne: async (id) => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  create: async (skillData) => {
    const { data, error } = await supabase
      .from('skills')
      .insert(skillData)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  update: async (id, skillData) => {
    const { data, error } = await supabase
      .from('skills')
      .update(skillData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: { message: 'Deleted successfully' } };
  },
  getCategories: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('category')
      .not('category', 'is', null);
    if (error) throw error;
    const categories = [...new Set(data.map(item => item.category))];
    return { data: { data: categories } };
  },
};

// Projects API (using Supabase directly)
export const projectsAPI = {
  getAll: async (params) => {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  getAdmin: async (params) => {
    let query = supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  getOne: async (id) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  create: async (projectData) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  update: async (id, projectData) => {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: { message: 'Deleted successfully' } };
  },
  getFeatured: async (params) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .eq('featured', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return { data: { data } };
  },
};

// Blogs API (using Supabase directly)
export const blogsAPI = {
  getAll: async (params) => {
    let query = supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  getAdmin: async (params) => {
    let query = supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  getOne: async (id) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  create: async (blogData) => {
    const { data, error } = await supabase
      .from('blogs')
      .insert(blogData)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  update: async (id, blogData) => {
    const { data, error } = await supabase
      .from('blogs')
      .update(blogData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: { message: 'Deleted successfully' } };
  },
  getFeatured: async (params) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('published_at', { ascending: false });
    if (error) throw error;
    return { data: { data } };
  },
  getCategories: async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('category')
      .not('category', 'is', null);
    if (error) throw error;
    const categories = [...new Set(data.map(item => item.category))];
    return { data: { data: categories } };
  },
  getTags: async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('tags');
    if (error) throw error;
    const allTags = data.flatMap(item => item.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return { data: { data: uniqueTags } };
  },
};

// Experience API (using Supabase directly)
export const experienceAPI = {
  getAll: async (params) => {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return { data: { data } };
  },
  getAdmin: async (params) => {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return { data: { data } };
  },
  getOne: async (id) => {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  create: async (expData) => {
    const { data, error } = await supabase
      .from('experience')
      .insert(expData)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  update: async (id, expData) => {
    const { data, error } = await supabase
      .from('experience')
      .update(expData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('experience')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: { message: 'Deleted successfully' } };
  },
};

// Testimonials API (using Supabase directly)
export const testimonialsAPI = {
  getAll: async (params) => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return { data: { data } };
  },
  getAdmin: async (params) => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return { data: { data } };
  },
  getOne: async (id) => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  create: async (testimonialData) => {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonialData)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  update: async (id, testimonialData) => {
    const { data, error } = await supabase
      .from('testimonials')
      .update(testimonialData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: { message: 'Deleted successfully' } };
  },
};

// Services API (using Supabase directly)
export const servicesAPI = {
  getAll: async (params) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return { data: { data } };
  },
  getAdmin: async (params) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return { data: { data } };
  },
  getOne: async (id) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  create: async (serviceData) => {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  update: async (id, serviceData) => {
    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: { message: 'Deleted successfully' } };
  },
};

// Contact/Messages API (using Supabase directly)
export const contactAPI = {
  submit: async (formData) => {
    const { data, error } = await supabase
      .from('messages')
      .insert(formData)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  getAll: async (params) => {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  getOne: async (id) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  update: async (id, updateData) => {
    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  delete: async (id) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: { message: 'Deleted successfully' } };
  },
  getStats: async () => {
    const { data: total } = await supabase
      .from('messages')
      .select('id', { count: 'exact' });
    
    const { data: unread } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('status', 'unread');
    
    return {
      data: {
        data: {
          total: total?.length || 0,
          unread: unread?.length || 0,
        }
      }
    };
  },
};

// Media API (using Supabase storage)
export const mediaAPI = {
  upload: async (formData) => {
    const file = formData.get('file');
    const folder = formData.get('folder') || 'general';
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);
    
    // Save to media table
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert({
        filename: fileName,
        original_name: file.name,
        mime_type: file.type,
        size: file.size,
        url: urlData.publicUrl,
        folder: folder,
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    return { data: { data: mediaRecord } };
  },
  uploadMultiple: async (formData) => {
    const files = formData.getAll('files');
    const folder = formData.get('folder') || 'general';
    const results = [];
    
    for (const file of files) {
      const fileName = `${folder}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, file);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);
      
      const { data: mediaRecord, error: dbError } = await supabase
        .from('media')
        .insert({
          filename: fileName,
          original_name: file.name,
          mime_type: file.type,
          size: file.size,
          url: urlData.publicUrl,
          folder: folder,
        })
        .select()
        .single();
      
      if (!dbError) {
        results.push(mediaRecord);
      }
    }
    
    return { data: { data: results } };
  },
  getAll: async (params) => {
    let query = supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (params?.folder) {
      query = query.eq('folder', params.folder);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  getOne: async (id) => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  update: async (id, updateData) => {
    const { data, error } = await supabase
      .from('media')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: { data } };
  },
  delete: async (id) => {
    // Get media record first
    const { data: media } = await supabase
      .from('media')
      .select('filename')
      .eq('id', id)
      .single();
    
    if (media) {
      // Delete from storage
      await supabase.storage
        .from('media')
        .remove([media.filename]);
    }
    
    // Delete from database
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { data: { message: 'Deleted successfully' } };
  },
  getFolders: async () => {
    const { data, error } = await supabase
      .from('media')
      .select('folder')
      .not('folder', 'is', null);
    if (error) throw error;
    const folders = [...new Set(data.map(item => item.folder))];
    return { data: { data: folders } };
  },
};

// Dashboard API (using Supabase directly)
export const dashboardAPI = {
  getStats: async () => {
    try {
      const [
        projectsRes,
        blogsRes,
        skillsRes,
        messagesRes,
        experienceRes,
        testimonialsRes,
        servicesRes,
      ] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('blogs').select('id', { count: 'exact' }),
        supabase.from('skills').select('id', { count: 'exact' }),
        supabase.from('messages').select('id', { count: 'exact' }),
        supabase.from('experience').select('id', { count: 'exact' }),
        supabase.from('testimonials').select('id', { count: 'exact' }),
        supabase.from('services').select('id', { count: 'exact' }),
      ]);
      
      return {
        data: {
          data: {
            projects: projectsRes.count || 0,
            blogs: blogsRes.count || 0,
            skills: skillsRes.count || 0,
            messages: messagesRes.count || 0,
            experience: experienceRes.count || 0,
            testimonials: testimonialsRes.count || 0,
            services: servicesRes.count || 0,
          }
        }
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        data: {
          data: {
            projects: 0,
            blogs: 0,
            skills: 0,
            messages: 0,
            experience: 0,
            testimonials: 0,
            services: 0,
          }
        }
      };
    }
  },
  getActivity: async (params) => {
    try {
      const [projects, blogs, messages] = await Promise.all([
        supabase.from('projects').select('id, title, updated_at').order('updated_at', { ascending: false }).limit(5),
        supabase.from('blogs').select('id, title, updated_at').order('updated_at', { ascending: false }).limit(5),
        supabase.from('messages').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
      ]);
      
      return {
        data: {
          data: {
            projects: projects.data || [],
            blogs: blogs.data || [],
            messages: messages.data || [],
          }
        }
      };
    } catch (error) {
      console.error('Error fetching activity:', error);
      return {
        data: {
          data: {
            projects: [],
            blogs: [],
            messages: [],
          }
        }
      };
    }
  },
  getMessages: async (params) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(params?.limit || 5);
      if (error) throw error;
      return { data: { data } };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { data: { data: [] } };
    }
  },
};

export default api;