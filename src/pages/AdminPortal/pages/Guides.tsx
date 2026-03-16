import React, { useEffect, useState } from 'react';
import { 
  Star, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Search
} from 'lucide-react';
import { api } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import { cn } from '../utils';
import { ToastType } from '../components/Toast';

const STATUS_BADGES: Record<string, string> = {
  'Available': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'On Safari': 'bg-purple-50 text-purple-600 border-purple-100',
  'Offline': 'bg-slate-50 text-slate-500 border-slate-200',
};

export default function Guides({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) {
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const data = await api.getGuides();
      setGuides(data.guides);
    } catch (error) {
      console.error("Failed to fetch guides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

   const handleRemove = async (id: string) => {
    try {
      await api.removeGuide(id);
      showToast('Guide account removed permanently');
      fetchGuides();
    } catch (error) {
      showToast('Failed to remove guide', 'error');
    }
  };

  const filteredGuides = guides.filter(guide => 
    guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search guides..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => showToast('Guide registration form will be available in the next update.')}
          className="px-6 py-2 bg-safari-gold text-safari-dark rounded-xl font-bold hover:bg-safari-gold/90 transition-all shadow-sm"
        >
          Add New Guide
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Guide Info</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rating</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Special Skills</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Safaris</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safari-gold"></div>
                  </div>
                </td>
              </tr>
            ) : filteredGuides.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No guides found.
                </td>
              </tr>
            ) : filteredGuides.map((guide) => (
              <tr key={guide.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-safari-gold border border-slate-200 font-bold">
                      {guide.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{guide.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">ID: {guide.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-safari-gold fill-safari-gold" />
                    <span className="text-sm font-bold text-slate-900">{guide.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {guide.specialSkills.map((skill: string) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700 font-medium">{guide.totalSafaris}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider",
                    STATUS_BADGES[guide.status] || "bg-slate-100 text-slate-600 border-slate-200"
                  )}>
                    {guide.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => showToast('Guide approval is handled during registration.')}
                      className="p-2 rounded-lg bg-slate-100 text-emerald-600 hover:bg-emerald-50 transition-all" 
                      title="Approve"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => showToast('Guide profile editing will be available in the next update.')}
                      className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all" 
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-50 transition-all" 
                      title="Remove Account"
                      onClick={() => setConfirmRemoveId(guide.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!confirmRemoveId}
        onClose={() => setConfirmRemoveId(null)}
        onConfirm={() => confirmRemoveId && handleRemove(confirmRemoveId)}
        title="Remove Guide"
        message="Are you sure you want to remove this guide? This action cannot be undone."
        confirmLabel="Remove Guide"
        variant="danger"
      />
    </div>
  );
}
