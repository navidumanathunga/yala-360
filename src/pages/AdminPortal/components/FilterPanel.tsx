import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Filter, RotateCcw } from 'lucide-react';
import { cn } from '../utils';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  initialFilters: any;
}

export default function FilterPanel({ isOpen, onClose, onApply, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState(initialFilters);

  const handleReset = () => {
    const reset = {
      safariType: 'All',
      startDate: '',
      endDate: '',
      driverId: '',
      guideId: '',
      paymentStatus: 'All',
      status: 'All'
    };
    setFilters(reset);
    onApply(reset);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
              <Filter className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Advanced Filters</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Safari Type */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Safari Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['All', 'Morning', 'Evening', 'Full Day'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilters({ ...filters, safariType: type })}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                    filters.safariType === type 
                      ? "bg-safari-gold text-safari-dark border-safari-gold" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Status</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Paid', 'Pending', 'Failed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilters({ ...filters, paymentStatus: status })}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                    filters.paymentStatus === status 
                      ? "bg-safari-gold text-safari-dark border-safari-gold" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Status */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Status</label>
            <div className="flex flex-wrap gap-2">
              {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilters({ ...filters, status: status })}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                    filters.status === status 
                      ? "bg-safari-gold text-safari-dark border-safari-gold" 
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button 
            onClick={handleReset}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button 
            onClick={() => { onApply(filters); onClose(); }}
            className="flex-[2] py-3 bg-safari-gold text-safari-dark rounded-xl font-bold text-sm hover:bg-safari-gold/90 transition-all shadow-lg shadow-safari-gold/20"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
}
