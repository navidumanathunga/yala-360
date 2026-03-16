import React, { useEffect, useState } from 'react';
import { 
  Star, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  BarChart3,
  MoreVertical,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../utils';
import { ToastType } from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

const STATUS_BADGES: Record<string, string> = {
  'Available': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'On Safari': 'bg-purple-50 text-purple-600 border-purple-100',
  'Offline': 'bg-slate-50 text-slate-500 border-slate-200',
};

export default function Drivers({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'suspend' | 'remove' } | null>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await api.getDrivers();
      setDrivers(data.drivers);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.approveDriver(id);
      showToast('Driver approved successfully');
      fetchDrivers();
    } catch (error) {
      showToast('Failed to approve driver', 'error');
    }
  };

   const handleSuspend = async (id: string) => {
    try {
      await api.suspendDriver(id);
      showToast('Driver suspended');
      fetchDrivers();
    } catch (error) {
      showToast('Failed to suspend driver', 'error');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await api.removeDriver(id);
      showToast('Driver account removed permanently');
      fetchDrivers();
    } catch (error) {
      showToast('Failed to remove driver', 'error');
    }
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search drivers..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => showToast('Driver registration form will be available in the next update.')}
          className="px-6 py-2 bg-safari-gold text-safari-dark rounded-xl font-bold hover:bg-safari-gold/90 transition-all shadow-sm"
        >
          Register New Driver
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Driver Info</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rating</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Vehicle</th>
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
            ) : filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No drivers found.
                </td>
              </tr>
            ) : filteredDrivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-safari-gold border border-slate-200 font-bold">
                      {driver.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{driver.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">ID: {driver.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-safari-gold fill-safari-gold" />
                    <span className="text-sm font-bold text-slate-900">{driver.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-700">{driver.vehicleType}</p>
                      <p className="text-xs text-slate-500">Cap: {driver.vehicleCapacity}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700 font-medium">{driver.totalSafaris}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider",
                    STATUS_BADGES[driver.status] || "bg-slate-100 text-slate-600 border-slate-200"
                  )}>
                    {driver.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      className="p-2 rounded-lg bg-slate-100 text-emerald-600 hover:bg-emerald-50 transition-all" 
                      title="Approve"
                      onClick={() => handleApprove(driver.id)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-50 transition-all" 
                      title="Remove Account"
                      onClick={() => setConfirmAction({ id: driver.id, type: 'remove' })}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => showToast('Driver profile editing will be available in the next update.')}
                      className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.type === 'remove') handleRemove(confirmAction.id);
          if (confirmAction?.type === 'suspend') handleSuspend(confirmAction.id);
        }}
        title={confirmAction?.type === 'remove' ? "Remove Driver Account" : "Suspend Driver"}
        message={confirmAction?.type === 'remove' 
          ? "WARNING: Are you sure you want to remove this driver account permanently? This action cannot be undone."
          : "Are you sure you want to suspend this driver? They will not be able to accept new bookings."}
        confirmLabel={confirmAction?.type === 'remove' ? "Remove Permanently" : "Suspend Driver"}
        variant="danger"
      />
    </div>
  );
}
