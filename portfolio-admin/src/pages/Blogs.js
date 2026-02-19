import React, { useEffect, useState } from 'react';
import { blogsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Search, Calendar } from 'lucide-react';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    category: '',
    tags: [],
    read_time: 5,
    is_published: false,
    is_featured: false,
    meta_title: '',
    meta_description: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const response = await blogsAPI.getAdmin();
      setBlogs(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({ ...blog, tags: blog.tags || [] });
    } else {
      setEditingBlog(null);
      setFormData({
        title: '', slug: '', excerpt: '', content: '', cover_image_url: '',
        category: '', tags: [], read_time: 5, is_published: false, is_featured: false,
        meta_title: '', meta_description: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingBlog(null); setTagInput(''); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'title' && !editingBlog) {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBlog) {
        await blogsAPI.update(editingBlog.id, formData);
        toast.success('Blog updated successfully');
      } else {
        await blogsAPI.create(formData);
        toast.success('Blog created successfully');
      }
      closeModal();
      fetchBlogs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await blogsAPI.delete(id);
      toast.success('Blog deleted');
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blogs</h1>
          <p className="text-slate-500">Manage your blog posts</p>
        </div>
        <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-lg hover:opacity-90">
          <Plus className="w-5 h-5" /> Add Blog
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Search blogs..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-600 hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-600 hidden lg:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBlogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {blog.cover_image_url && <img src={blog.cover_image_url} alt="" className="w-12 h-8 object-cover rounded" />}
                    <div>
                      <p className="font-medium text-slate-800">{blog.title}</p>
                      <p className="text-sm text-slate-500">{blog.excerpt?.substring(0, 50)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{blog.category}</td>
                <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${blog.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {blog.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openModal(blog)} className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 rounded-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(blog.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBlogs.length === 0 && <div className="p-8 text-center text-slate-500">No blogs found</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-800">{editingBlog ? 'Edit Blog' : 'Add Blog'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Slug *</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Excerpt</label>
                <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Content</label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={8}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Read Time (min)</label>
                  <input type="number" name="read_time" value={formData.read_time} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Add tag..." />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_published" checked={formData.is_published} onChange={handleChange} className="rounded border-slate-300" />
                  <span className="text-sm text-slate-600">Published</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="rounded border-slate-300" />
                  <span className="text-sm text-slate-600">Featured</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingBlog ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;