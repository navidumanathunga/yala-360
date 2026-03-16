import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal, 
  Eye, 
  UserMinus, 
  XCircle,
  Download,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { cn } from '../utils';
import { BookingStatus } from '../types';
import { ToastType } from '../components/Toast';
import FilterPanel from '../components/FilterPanel';
import ExportModal from '../components/ExportModal';
import ConfirmationModal from '../components/ConfirmationModal';

const STATUS_COLORS: Record<BookingStatus | string, string> = {
  'Confirmed': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
  'Completed': 'bg-blue-50 text-blue-600 border-blue-100',
  'Cancelled': 'bg-rose-50 text-rose-600 border-rose-100',
  'On Safari': 'bg-purple-50 text-purple-600 border-purple-100',
};

export default function Bookings({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    safariType: 'All',
    startDate: '',
    endDate: '',
    driverId: '',
    guideId: '',
    paymentStatus: 'All',
    status: 'All'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getBookings({ 
        page, 
        search: searchTerm, 
        ...filters
      });
      setBookings(data.bookings);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, searchTerm, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleAutoReassign = async (id: string) => {
    setReassigningId(id);
    try {
      const res = await api.autoReassignDriver(id);
      showToast(res.message);
      fetchBookings();
    } catch (error) {
      showToast('Failed to automatically reassign driver', 'error');
    } finally {
      setReassigningId(null);
    }
  };

   const handleCancel = async (id: string) => {
    try {
      await api.cancelBooking(id);
      showToast('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      showToast('Failed to cancel booking', 'error');
    }
  };

  const handleExport = (format: string, range: any) => {
    showToast(`Exporting bookings as ${format}...`);
    setIsExportOpen(false);
    setTimeout(() => {
      showToast(`${format} export complete!`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 w-full md:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID or name..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-100 transition-colors"
          >
            <Filter className="w-4 h-4" />
            More Filters
            {(filters.safariType !== 'All' || filters.status !== 'All' || filters.paymentStatus !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-safari-gold"></span>
            )}
          </button>
          
          <button 
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-safari-gold text-safari-dark rounded-xl text-sm font-bold hover:bg-safari-gold/90 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tourist Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Safari Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Visitors</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safari-gold"></div>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No bookings found.
                  </td>
                </tr>
              ) : bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-safari-gold font-bold">{booking.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-safari-gold border border-slate-200">
                        {booking.touristName?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{booking.touristName || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{booking.safariType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {booking.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{booking.visitors} Persons</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider",
                      STATUS_COLORS[booking.status] || "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleAutoReassign(booking.id)}
                        disabled={reassigningId === booking.id}
                        className={cn(
                          "p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-safari-gold hover:bg-safari-gold/10 transition-all",
                          reassigningId === booking.id && "animate-spin text-safari-gold"
                        )}
                        title="Auto Reassign Driver"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-100 transition-all" 
                        title="Cancel Booking"
                        onClick={() => setConfirmCancelId(booking.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => showToast('Booking details and history will be available in the next update.')}
                        className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing <span className="text-slate-900 font-medium">{bookings.length}</span> of <span className="text-slate-900 font-medium">{total}</span> bookings
          </p>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-500 hover:text-slate-900 disabled:opacity-50" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <button 
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-500 hover:text-slate-900 disabled:opacity-50"
              disabled={bookings.length < 10}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <FilterPanel 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        onApply={(f) => { setFilters(f); setPage(1); }}
        initialFilters={filters}
      />

      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
      />

      <ConfirmationModal
        isOpen={!!confirmCancelId}
        onClose={() => setConfirmCancelId(null)}
        onConfirm={() => confirmCancelId && handleCancel(confirmCancelId)}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action will notify the tourist and the assigned driver."
        confirmLabel="Cancel Booking"
        variant="danger"
      />

      <AnimatePresence>
        {reassigningId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <RefreshCw className="w-4 h-4 animate-spin text-safari-gold" />
            <span className="text-sm font-medium">Finding best available driver...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
