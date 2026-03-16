import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Star,
  ExternalLink,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { cn } from '../../utils';
import { ToastType } from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';

interface Location {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  status: 'Active' | 'Inactive' | 'Featured';
  verified: boolean;
  lastUpdated: string;
  description: string;
  type: 'attraction' | 'hotel' | 'restaurant';
  externalLink?: string;
  imageUrl?: string;
}

interface MapLocationManagerProps {
  type: 'attraction' | 'hotel' | 'restaurant';
  title: string;
  showToast: (msg: string, type?: ToastType) => void;
}

export default function MapLocationManager({ type, title, showToast }: MapLocationManagerProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLocation, setPreviewLocation] = useState<Location | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lat: 6.3500,
    lng: 81.4000,
    category: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Featured',
    verified: false,
    externalLink: '',
    imageUrl: ''
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await api.getMapLocations({ type, search, status: statusFilter });
      setLocations(data.locations);
    } catch (error) {
      showToast('Failed to fetch locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [type, search, statusFilter]);

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        description: location.description,
        lat: location.lat,
        lng: location.lng,
        category: location.category,
        status: location.status,
        verified: location.verified,
        externalLink: location.externalLink || '',
        imageUrl: location.imageUrl || ''
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        description: '',
        lat: 6.3500,
        lng: 81.4000,
        category: type.charAt(0).toUpperCase() + type.slice(1),
        status: 'Active',
        verified: false,
        externalLink: '',
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await api.updateMapLocation(editingLocation.id, { ...formData, type });
        showToast('Location updated successfully');
      } else {
        await api.addMapLocation({ ...formData, type });
        showToast('Location added successfully');
      }
      setIsModalOpen(false);
      fetchLocations();
    } catch (error) {
      showToast('Operation failed', 'error');
    }
  };

   const handleDelete = async (id: string) => {
    try {
      await api.deleteMapLocation(id);
      showToast('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      showToast('Failed to delete location', 'error');
    }
  };

  const toggleStatus = async (location: Location) => {
    const newStatus = location.status === 'Inactive' ? 'Active' : 'Inactive';
    try {
      await api.updateMapLocation(location.id, { status: newStatus });
      showToast(`Location ${newStatus === 'Active' ? 'enabled' : 'disabled'}`);
      fetchLocations();
    } catch (error) {
      showToast('Status update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 text-sm">Manage {type}s displayed on the public map</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-safari-gold text-safari-dark rounded-xl font-bold shadow-lg shadow-safari-gold/20 hover:bg-safari-gold/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Location
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Featured">Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Coordinates</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safari-gold"></div>
                    </div>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No locations found matching your criteria.
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-safari-gold">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{loc.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{loc.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{loc.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-slate-500">
                        <p>{loc.lat.toFixed(4)}° N</p>
                        <p>{loc.lng.toFixed(4)}° E</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        loc.status === 'Active' ? "bg-emerald-50 text-emerald-600" :
                        loc.status === 'Featured' ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {loc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {loc.verified ? (
                        <div className="flex items-center gap-1 text-blue-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-bold">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs font-bold">Unverified</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{loc.lastUpdated}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setPreviewLocation(loc); setIsPreviewOpen(true); }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-safari-gold transition-colors"
                          title="View on Map"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(loc)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleStatus(loc)}
                          className={cn(
                            "p-2 rounded-lg hover:bg-slate-100 transition-colors",
                            loc.status === 'Inactive' ? "text-emerald-500" : "text-amber-500"
                          )}
                          title={loc.status === 'Inactive' ? "Enable" : "Disable"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(loc.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing {locations.length} results</p>
          <div className="flex gap-2">
            <button 
              onClick={() => showToast('Pagination will be available in the next update.')}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => showToast('Pagination will be available in the next update.')}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action will remove it from the public map."
        confirmLabel="Delete Location"
        variant="danger"
      />

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-safari-dark/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{editingLocation ? 'Edit Location' : 'Add New Location'}</h3>
                  <p className="text-slate-500 text-sm">Fill in the details for the {type} map entry</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Location Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Description</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Latitude</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Longitude</label>
                      <input 
                        type="number" 
                        step="0.000001"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Category</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Status</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Featured">Featured</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Verified Location</p>
                      <p className="text-xs text-slate-500">Enable to show the verified badge on the map</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, verified: !formData.verified })}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        formData.verified ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        formData.verified ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Map Preview & Coordinate Picker</label>
                    <div className="aspect-square bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 relative overflow-hidden group cursor-crosshair"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top) / rect.height;
                        // Map 0-1 to some park coordinates
                        const newLat = 6.4 + (1 - y) * 0.1;
                        const newLng = 81.4 + x * 0.1;
                        setFormData({ ...formData, lat: parseFloat(newLat.toFixed(6)), lng: parseFloat(newLng.toFixed(6)) });
                      }}
                    >
                      {/* Mock Map Background */}
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-slate-300 font-bold text-4xl uppercase tracking-widest opacity-30 rotate-45">YALA PARK MAP</div>
                      </div>
                      
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
                        {Array.from({ length: 100 }).map((_, i) => (
                          <div key={i} className="border-[0.5px] border-slate-200/50"></div>
                        ))}
                      </div>

                      {/* Current Marker */}
                      <motion.div 
                        animate={{ 
                          left: `${((formData.lng - 81.4) / 0.1) * 100}%`,
                          top: `${(1 - (formData.lat - 6.4) / 0.1) * 100}%`
                        }}
                        className="absolute w-8 h-8 -ml-4 -mt-8 pointer-events-none"
                      >
                        <MapPin className="w-8 h-8 text-safari-gold fill-safari-gold/20 drop-shadow-lg" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-safari-dark text-white text-[8px] rounded whitespace-nowrap font-bold">
                          {formData.lat}, {formData.lng}
                        </div>
                      </motion.div>

                      <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-xl border border-white/20 text-[10px] text-slate-500 font-medium text-center">
                        Click anywhere on the grid to pick coordinates
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Image Management</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-video bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 group relative overflow-hidden">
                        {formData.imageUrl ? (
                          <>
                            <img src={formData.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              onClick={() => setFormData({ ...formData, imageUrl: '' })}
                              className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Upload Photo</span>
                            <input 
                              type="text" 
                              placeholder="Paste Image URL"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                          </>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">External Link</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="url" 
                            placeholder="Website URL"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-safari-gold/50"
                            value={formData.externalLink}
                            onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-4 bg-safari-gold text-safari-dark rounded-xl font-bold hover:bg-safari-gold/90 transition-all shadow-lg shadow-safari-gold/20"
                    >
                      {editingLocation ? 'Update Location' : 'Save Location'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && previewLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-safari-dark/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-video relative">
                {/* Mock Map Preview */}
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
                  <MapPin className="w-12 h-12 text-safari-gold drop-shadow-xl" />
                </div>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{previewLocation.name}</h4>
                    <p className="text-xs text-slate-500">{previewLocation.lat}, {previewLocation.lng}</p>
                  </div>
                  <div className="flex gap-2">
                    {previewLocation.externalLink && (
                      <a 
                        href={previewLocation.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-safari-gold text-safari-dark hover:bg-safari-gold/90 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    {previewLocation.category}
                  </span>
                  {previewLocation.verified && (
                    <div className="flex items-center gap-1 text-blue-600 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{previewLocation.description}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
