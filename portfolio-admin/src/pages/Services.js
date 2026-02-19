import React, { useEffect, useState } from 'react';
import { servicesAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Layers } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', icon: '', icon_url: '', features: [], is_active: true,
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAdmin();
      setServices(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) { setEditing(item); setFormData({ ...item, features: item.features || [] }); }
    else { setEditing(null); setFormData({ title: '', description: '', icon: '', icon_url: '', features: [], is_active: true }); }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setFeatureInput(''); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
      setFeatureInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await servicesAPI.update(editing.id, formData); toast.success('Service updated'); }
      else { await servicesAPI.create(formData); toast.success('Service created'); }
      closeModal(); fetchServices();
    } catch (error) { toast.error(error.response?.data?.error || 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await servicesAPI.delete(id); toast.success('Service deleted'); fetchServices(); }
    catch (error) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-800">Services</h1><p className="text-slate-500">Manage your services</p></div>
        <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-lg hover:opacity-90">
          <Plus className="w-5 h-5" /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-6 shadow-soft border border-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 mb-3">{item.description}</p>
            {item.features?.length > 0 && (
              <ul className="text-sm text-slate-600 space-y-1">
                {item.features.slice(0, 3).map((f, i) => <li key={i} className="flex items-center gap-2"><span className="w-1 h-1 bg-primary-500 rounded-full"></span>{f}</li>)}
                {item.features.length > 3 && <li className="text-slate-400">+{item.features.length - 3} more</li>}
              </ul>
            )}
          </div>
        ))}
      </div>
      {services.length === 0 && <div className="text-center py-12 text-slate-500">No services found</div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div><label className="block text-sm font-medium text-slate-600 mb-1">Features</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Add feature..." />
                  <button type="button" onClick={addFeature} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded">
                      {f}
                      <button type="button" onClick={() => setFormData({ ...formData, features: formData.features.filter(x => x !== f) })}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
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

export default Services;