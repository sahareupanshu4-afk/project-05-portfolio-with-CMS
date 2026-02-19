import { supabase } from './supabase';

// About API
export const aboutAPI = {
  get: async () => {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .eq('is_active', true)
      .single();
    if (error) return { data: { data: null } };
    return { data: { data } };
  }
};

// Skills API
export const skillsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) return { data: { data: [] } };
    return { data: { data } };
  }
};

// Projects API
export const projectsAPI = {
  getAll: async (params) => {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    const { data, error } = await query;
    if (error) return { data: { data: [] } };
    return { data: { data } };
  },
  getFeatured: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .eq('featured', true)
      .order('display_order', { ascending: true });
    if (error) return { data: { data: [] } };
    return { data: { data } };
  },
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    if (error) return { data: { data: null } };
    return { data: { data } };
  }
};

// Blogs API
export const blogsAPI = {
  getAll: async (params) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    if (error) return { data: { data: [] } };
    return { data: { data } };
  },
  getFeatured: async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('published_at', { ascending: false });
    if (error) return { data: { data: [] } };
    return { data: { data } };
  },
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    if (error) return { data: { data: null } };
    return { data: { data } };
  }
};

// Experience API
export const experienceAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) return { data: { data: [] } };
    return { data: { data } };
  }
};

// Testimonials API
export const testimonialsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) return { data: { data: [] } };
    return { data: { data } };
  }
};

// Services API
export const servicesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) return { data: { data: [] } };
    return { data: { data } };
  }
};

// Contact API
export const contactAPI = {
  submit: async (formData) => {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'unread'
      }])
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message || 'Failed to send message');
    }
    
    return { data: { data } };
  }
};

export default { aboutAPI, skillsAPI, projectsAPI, blogsAPI, experienceAPI, testimonialsAPI, servicesAPI, contactAPI };