import React, { useEffect, useState } from 'react';
import { testimonialsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Star } from 'lucide-react';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', position: '', company: '', content: '', avatar_url: '', rating: 5, is_active: true,
  });

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialsAPI.getAdmin();
      setTestimonials(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) { setEditing(item); setFormData({ ...item }); }
    else { setEditing(null); setFormData({ name: '', position: '', company: '', content: '', avatar_url: '', rating: 5, is_active: true }); }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await testimonialsAPI.update(editing.id, formData); toast.success('Testimonial updated'); }
      else { await testimonialsAPI.create(formData); toast.success('Testimonial created'); }
      closeModal(); fetchTestimonials();
    } catch (error) { toast.error(error.response?.data?.error || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await testimonialsAPI.delete(id); toast.success('Testimonial deleted'); fetchTestimonials(); }
    catch (error) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-800">Testimonials</h1><p className="text-slate-500">Manage client testimonials</p></div>
        <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-lg hover:opacity-90">
          <Plus className="w-5 h-5" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-6 shadow-soft border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                  {item.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.position} at {item.company}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-3">"{item.content}"</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {testimonials.length === 0 && <div className="text-center py-12 text-slate-500">No testimonials found</div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-600 mb-1">Position</label>
                  <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-slate-600 mb-1">Company</label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Content *</label>
                <textarea name="content" value={formData.content} onChange={handleChange} rows={4} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Rating: {formData.rating}/5</label>
                <input type="range" name="rating" min="1" max="5" value={formData.rating} onChange={handleChange} className="w-full" /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="rounded border-slate-300" />
                <span className="text-sm text-slate-600">Active</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}{editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;