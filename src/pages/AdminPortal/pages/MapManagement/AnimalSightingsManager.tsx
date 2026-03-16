import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  User, 
  ShieldCheck, 
  ShieldAlert,
  MapPin,
  X,
  Search,
  Filter,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { cn } from '../../utils';
import { ToastType } from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';

interface Sighting {
  id: string;
  animalType: string;
  location: string;
  reportedTime: string;
  source: 'Driver' | 'Guide' | 'Admin';
  verified: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  lat: number;
  lng: number;
}

export default function AnimalSightingsManager({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSighting, setPreviewSighting] = useState<Sighting | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchSightings = async () => {
    setLoading(true);
    try {
      const data = await api.getAnimalSightings();
      setSightings(data.sightings);
    } catch (error) {
      showToast('Failed to fetch sightings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSightings();
  }, []);

   const handleAction = async (id: string, action: 'approve' | 'verify' | 'delete') => {
    try {
      if (action === 'delete') {
        await api.deleteAnimalSighting(id);
        showToast('Sighting removed');
      } else if (action === 'approve') {
        await api.updateAnimalSighting(id, { status: 'Approved' });
        showToast('Sighting approved');
      } else if (action === 'verify') {
        await api.updateAnimalSighting(id, { verified: true });
        showToast('Sighting marked as verified');
      }
      fetchSightings();
    } catch (error) {
      showToast('Action failed', 'error');
    }
  };

  const filteredSightings = sightings.filter(s => 
    s.animalType.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Animal Sightings</h1>
          <p className="text-slate-500 text-sm">Real-time wildlife reports from the last 24 hours</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Auto-expires in 24h</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by animal or location..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Animal Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reported Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification</th>
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
              ) : filteredSightings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No active sightings reported in the last 24 hours.
                  </td>
                </tr>
              ) : (
                filteredSightings.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{s.animalType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-safari-gold" />
                        <span className="text-sm">{s.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{new Date(s.reportedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">{s.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        s.status === 'Approved' ? "bg-emerald-50 text-emerald-600" :
                        s.status === 'Pending' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {s.verified ? (
                        <div className="flex items-center gap-1 text-blue-600">
                          <ShieldCheck className="w-4 h-4" />
                          <span className="text-xs font-bold">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <ShieldAlert className="w-4 h-4" />
                          <span className="text-xs font-bold">Unverified</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setPreviewSighting(s); setIsPreviewOpen(true); }}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-safari-gold transition-colors"
                          title="View on Map"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {s.status === 'Pending' && (
                          <button 
                            onClick={() => handleAction(s.id, 'approve')}
                            className="p-2 rounded-lg hover:bg-slate-100 text-emerald-500 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {!s.verified && (
                          <button 
                            onClick={() => handleAction(s.id, 'verify')}
                            className="p-2 rounded-lg hover:bg-slate-100 text-blue-500 transition-colors"
                            title="Mark as Verified"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                         <button 
                          onClick={() => setConfirmDeleteId(s.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove"
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
      </div>

      {/* Map Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && previewSighting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-safari-dark/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-video relative bg-slate-100">
                {/* Mock Map */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative"
                  >
                    <MapPin className="w-12 h-12 text-rose-500 drop-shadow-xl" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      {previewSighting.animalType} Sighted!
                    </div>
                  </motion.div>
                </div>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">{previewSighting.animalType}</h3>
                  <span className="text-xs text-slate-500 font-mono">{previewSighting.lat}, {previewSighting.lng}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm font-medium text-slate-700">{previewSighting.location}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reported By</p>
                    <p className="text-sm font-medium text-slate-700">{previewSighting.source}</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Close Preview
                  </button>
                  {previewSighting.status === 'Pending' && (
                    <button 
                      onClick={() => { handleAction(previewSighting.id, 'approve'); setIsPreviewOpen(false); }}
                      className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Approve Sighting
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleAction(confirmDeleteId, 'delete')}
        title="Remove Sighting"
        message="Are you sure you want to remove this animal sighting report? This will remove it from the public map."
        confirmLabel="Remove Sighting"
        variant="danger"
      />
    </div>
  );
}
