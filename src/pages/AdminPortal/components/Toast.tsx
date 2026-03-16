import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '../utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl",
        type === 'success' ? "bg-emerald-50/90 border-emerald-200 text-emerald-800" :
        type === 'error' ? "bg-rose-50/90 border-rose-200 text-rose-800" :
        "bg-blue-50/90 border-blue-200 text-blue-800"
      )}
    >
      {type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-black/5 rounded-full transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
