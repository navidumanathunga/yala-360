import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, Calendar, ExternalLink, X } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../utils';
import { ToastType } from '../components/Toast';

export default function Gallery({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTitle, setNewImageTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const data = await api.getGallery();
      setImages(data.images);
    } catch (error) {
      showToast('Failed to fetch gallery images', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    setAdding(true);
    try {
      await api.addGalleryImage({ url: newImageUrl, title: newImageTitle });
      showToast('Image added to gallery successfully!');
      setNewImageUrl('');
      setNewImageTitle('');
      setIsModalOpen(false);
      fetchGallery();
    } catch (error) {
      showToast('Failed to add image', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveImage = async (id: string) => {
    if (!confirm('Are you sure you want to remove this image from the gallery?')) return;

    try {
      await api.removeGalleryImage(id);
      showToast('Image removed from gallery');
      fetchGallery();
    } catch (error) {
      showToast('Failed to remove image', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safari-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Park Gallery</h2>
          <p className="text-slate-500 text-sm">Manage promotional and sighting photos for the guest app</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-safari-gold text-safari-dark rounded-xl font-bold shadow-lg shadow-safari-gold/20 hover:bg-safari-gold/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Photo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((img) => (
          <div key={img.id} className="glass-card overflow-hidden group">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                  onClick={() => window.open(img.url, '_blank')}
                  className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleRemoveImage(img.id)}
                  className="p-2 rounded-full bg-rose-500/20 backdrop-blur-md text-rose-500 hover:bg-rose-500/40 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900 line-clamp-1">{img.title}</h3>
              <div className="flex items-center gap-2 mt-2 text-slate-500">
                <Calendar className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{img.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-safari-dark/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add Gallery Photo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Photo URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/photo.jpg" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Title / Caption</label>
                <input 
                  type="text" 
                  placeholder="e.g. Majestic Leopard at Sunset" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
                  value={newImageTitle}
                  onChange={(e) => setNewImageTitle(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={adding || !newImageUrl.trim()}
                  className="w-full py-4 bg-safari-gold text-safari-dark rounded-xl font-bold text-lg hover:bg-safari-gold/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {adding ? (
                    <div className="w-5 h-5 border-2 border-safari-dark/30 border-t-safari-dark rounded-full animate-spin"></div>
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
