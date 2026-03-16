import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, FileText, Table } from 'lucide-react';
import { cn } from '../utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'CSV' | 'Excel', dateRange: { start: string; end: string }) => void;
}

export default function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<'CSV' | 'Excel'>('CSV');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Export Bookings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Format</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormat('CSV')}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                  format === 'CSV' ? "border-safari-gold bg-safari-gold/5" : "border-slate-100 hover:border-slate-200"
                )}
              >
                <FileText className={cn("w-8 h-8", format === 'CSV' ? "text-safari-gold" : "text-slate-300")} />
                <span className={cn("text-sm font-bold", format === 'CSV' ? "text-safari-dark" : "text-slate-500")}>CSV</span>
              </button>
              <button
                onClick={() => setFormat('Excel')}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                  format === 'Excel' ? "border-safari-gold bg-safari-gold/5" : "border-slate-100 hover:border-slate-200"
                )}
              >
                <Table className={cn("w-8 h-8", format === 'Excel' ? "text-safari-gold" : "text-slate-300")} />
                <span className={cn("text-sm font-bold", format === 'Excel' ? "text-safari-dark" : "text-slate-500")}>Excel</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">From</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">To</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => onExport(format, dateRange)}
            className="w-full py-4 bg-safari-gold text-safari-dark rounded-2xl font-bold text-lg shadow-xl shadow-safari-gold/20 hover:bg-safari-gold/90 transition-all flex items-center justify-center gap-3"
          >
            <Download className="w-5 h-5" />
            Download {format}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
