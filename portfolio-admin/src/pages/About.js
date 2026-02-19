import React, { useEffect, useState } from 'react';
import { aboutAPI, mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Save, Loader2, Upload, User, MapPin, Mail, Phone, Globe } from 'lucide-react';

const About = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    bio: '',
    resume_url: '',
    avatar_url: '',
    location: '',
    email: '',
    phone: '',
    social_links: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      youtube: '',
      website: '',
    },
  });

  useEffect(() => {
    fetchAbout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAbout = async () => {
    try {
      const response = await aboutAPI.getAdmin();
      if (response.data.data) {
        setFormData({
          ...formData,
          ...response.data.data,
          social_links: response.data.data.social_links || formData.social_links,
        });
      }
    } catch (error) {
      console.error('Failed to fetch about:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '');
      setFormData({
        ...formData,
        social_links: {
          ...formData.social_links,
          [socialKey]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('folder', 'avatars');

      const response = await mediaAPI.upload(uploadFormData);
      setFormData({ ...formData, avatar_url: response.data.data.url });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await aboutAPI.update(formData);
      toast.success('About information saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">About Me</h1>
        <p className="text-slate-500">Manage your profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar upload */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Upanshu Sahare"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Subtitle</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Full Stack Developer"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="I build exceptional digital experiences"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell your story..."
              />
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" /> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                <Mail className="w-4 h-4 inline mr-1" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                <Phone className="w-4 h-4 inline mr-1" /> Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+1 234 567 890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                <Globe className="w-4 h-4 inline mr-1" /> Resume URL
              </label>
              <input
                type="url"
                name="resume_url"
                value={formData.resume_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.social_links).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-600 mb-1 capitalize">
                  {key}
                </label>
                <input
                  type="url"
                  name={`social_${key}`}
                  value={value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={`https://${key}.com/...`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default About;