import React, { useEffect, useState } from 'react';
import { mediaAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Upload, Trash2, X, Loader2, Image, Search, FolderOpen } from 'lucide-react';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    try {
      const response = await mediaAPI.getAll();
      setMedia(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', 'general');
        await mediaAPI.upload(formData);
      }
      toast.success(`${files.length} file(s) uploaded successfully`);
      fetchMedia();
    } catch (error) {
      toast.error('Failed to upload file(s)');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await mediaAPI.delete(id);
      toast.success('Media deleted');
      setSelectedImage(null);
      fetchMedia();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const filteredMedia = media.filter(item =>
    item.original_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-800">Media Library</h1><p className="text-slate-500">Manage your uploaded images</p></div>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-lg hover:opacity-90">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {uploading ? 'Uploading...' : 'Upload Images'}
          </span>
        </label>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.map((item) => (
          <div key={item.id} onClick={() => setSelectedImage(item)}
            className="aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all group relative">
            <img src={item.url} alt={item.original_name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Image className="w-8 h-8 text-white" />
            </div>
          </div>
        ))}
      </div>
      {filteredMedia.length === 0 && <div className="text-center py-12 text-slate-500"><FolderOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />No media found</div>}

      {/* Image detail modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Image Details</h2>
              <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="p-4">
              <img src={selectedImage.url} alt={selectedImage.original_name} className="w-full rounded-lg mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Filename:</span><span className="text-slate-700">{selectedImage.original_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Size:</span><span className="text-slate-700">{(selectedImage.size / 1024).toFixed(1)} KB</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Uploaded:</span><span className="text-slate-700">{new Date(selectedImage.created_at).toLocaleDateString()}</span></div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-slate-500 mb-1">URL</label>
                <div className="flex gap-2">
                  <input type="text" value={selectedImage.url} readOnly className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm" />
                  <button onClick={() => copyUrl(selectedImage.url)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">Copy</button>
                </div>
              </div>
              <button onClick={() => handleDelete(selectedImage.id)} className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;