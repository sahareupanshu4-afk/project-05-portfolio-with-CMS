import React, { useEffect, useState } from 'react';
import { skillsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Loader2, Search } from 'lucide-react';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    proficiency: 80,
    icon_url: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillsAPI.getAdmin();
      setSkills(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (skill = null) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({ ...skill });
    } else {
      setEditingSkill(null);
      setFormData({
        name: '',
        category: '',
        proficiency: 80,
        icon_url: '',
        description: '',
        display_order: 0,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSkill(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSkill) {
        await skillsAPI.update(editingSkill.id, formData);
        toast.success('Skill updated successfully');
      } else {
        await skillsAPI.create(formData);
        toast.success('Skill created successfully');
      }
      closeModal();
      fetchSkills();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    try {
      await skillsAPI.delete(id);
      toast.success('Skill deleted successfully');
      fetchSkills();
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(search.toLowerCase()) ||
    skill.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Skills</h1>
          <p className="text-slate-500">Manage your technical skills</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-lg hover:opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Skill
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="bg-white rounded-xl p-4 shadow-soft border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {skill.icon_url ? (
                  <img src={skill.icon_url} alt={skill.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                    {skill.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-800">{skill.name}</h3>
                  <p className="text-sm text-slate-500">{skill.category}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openModal(skill)}
                  className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Proficiency</span>
                <span className="font-medium text-slate-700">{skill.proficiency}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                  style={{ width: `${skill.proficiency}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No skills found. Click "Add Skill" to create one.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingSkill ? 'Edit Skill' : 'Add Skill'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Frontend, Backend, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Proficiency: {formData.proficiency}%
                </label>
                <input
                  type="range"
                  name="proficiency"
                  min="0"
                  max="100"
                  value={formData.proficiency}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Icon URL</label>
                <input
                  type="url"
                  name="icon_url"
                  value={formData.icon_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  id="is_active"
                  className="rounded border-slate-300"
                />
                <label htmlFor="is_active" className="text-sm text-slate-600">Active</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSkill ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;