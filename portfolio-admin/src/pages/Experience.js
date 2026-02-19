import React, { useEffect, useState } from 'react';
import { experienceAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Search, Calendar, Building } from 'lucide-react';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company: '', position: '', location: '', description: '',
    responsibilities: [], technologies: [], start_date: '', end_date: '',
    is_current: false, company_logo_url: '', company_url: '', is_active: true,
  });
  const [respInput, setRespInput] = useState('');
  const [techInput, setTechInput] = useState('');

  useEffect(() => { fetchExperience(); }, []);

  const fetchExperience = async () => {
    try {
      const response = await experienceAPI.getAdmin();
      setExperiences(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch experience');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (exp = null) => {
    if (exp) {
      setEditingExp(exp);
      setFormData({ ...exp, responsibilities: exp.responsibilities || [], technologies: exp.technologies || [] });
    } else {
      setEditingExp(null);
      setFormData({
        company: '', position: '', location: '', description: '',
        responsibilities: [], technologies: [], start_date: '', end_date: '',
        is_current: false, company_logo_url: '', company_url: '', is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingExp(null); setRespInput(''); setTechInput(''); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const addResp = () => {
    if (respInput.trim()) {
      setFormData({ ...formData, responsibilities: [...formData.responsibilities, respInput.trim()] });
      setRespInput('');
    }
  };

  const addTech = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({ ...formData, technologies: [...formData.technologies, techInput.trim()] });
      setTechInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingExp) {
        await experienceAPI.update(editingExp.id, formData);
        toast.success('Experience updated');
      } else {
        await experienceAPI.create(formData);
        toast.success('Experience created');
      }
      closeModal();
      fetchExperience();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await experienceAPI.delete(id);
      toast.success('Experience deleted');
      fetchExperience();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Experience</h1>
          <p className="text-slate-500">Manage your work experience</p>
        </div>
        <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-lg hover:opacity-90">
          <Plus className="w-5 h-5" /> Add Experience
        </button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="bg-white rounded-xl p-6 shadow-soft border border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                  {exp.company?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{exp.position}</h3>
                  <p className="text-primary-600">{exp.company}</p>
                  <p className="text-sm text-slate-500">{exp.location}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {' '}
                    {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(exp)} className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {exp.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {exp.technologies.map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{tech}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {experiences.length === 0 && <div className="text-center py-12 text-slate-500">No experience found</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-800">{editingExp ? 'Edit Experience' : 'Add Experience'}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Company *</label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Position *</label>
                  <input type="text" name="position" value={formData.position} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Start Date *</label>
                  <input type="date" name="start_date" value={formData.start_date?.substring(0, 10)} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">End Date</label>
                  <input type="date" name="end_date" value={formData.end_date?.substring(0, 10)} onChange={handleChange} disabled={formData.is_current} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Technologies</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Add technology..." />
                  <button type="button" onClick={addTech} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded">
                      {tech}
                      <button type="button" onClick={() => setFormData({ ...formData, technologies: formData.technologies.filter(t => t !== tech) })}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_current" checked={formData.is_current} onChange={handleChange} className="rounded border-slate-300" />
                  <span className="text-sm text-slate-600">Currently working here</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="rounded border-slate-300" />
                  <span className="text-sm text-slate-600">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingExp ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experience;