import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Users, Smartphone, Search, Calendar, User } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../utils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function NotificationModal({ isOpen, onClose, onSuccess }: NotificationModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Users');
  const [targetingOptions, setTargetingOptions] = useState({
    allTourists: true,
    specificTourist: false,
    dateRange: false,
    touristId: '',
    startDate: '',
    endDate: ''
  });
  const [tourists, setTourists] = useState<any[]>([]);
  const [touristSearch, setTouristSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (targetingOptions.specificTourist) {
      const fetchTourists = async () => {
        try {
          const data = await api.getTourists(touristSearch);
          setTourists(data.tourists);
        } catch (err) {
          console.error(err);
        }
      };
      fetchTourists();
    }
  }, [targetingOptions.specificTourist, touristSearch]);

  const handleSend = async () => {
    if (!title || !message) return;
    setLoading(true);
    try {
      await api.sendNotification({
        title,
        message,
        targetAudience,
        targetingOptions: targetAudience === 'Tourists' ? targetingOptions : undefined
      });
      onSuccess('Notification broadcasted successfully!');
      onClose();
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[80vh]"
      >
        {/* Form Section */}
        <div className="flex-1 p-8 overflow-y-auto border-r border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Broadcast Notification</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notification Title</label>
              <input 
                type="text" 
                placeholder="e.g. Park Closure Update"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Body</label>
              <textarea 
                rows={4}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Audience</label>
              <div className="grid grid-cols-2 gap-3">
                {['All Users', 'Drivers', 'Guides', 'Management Staff', 'Tourists'].map((audience) => (
                  <button
                    key={audience}
                    onClick={() => setTargetAudience(audience)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left flex items-center gap-3",
                      targetAudience === audience 
                        ? "bg-safari-gold/10 border-safari-gold text-safari-dark" 
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      targetAudience === audience ? "bg-safari-gold" : "bg-slate-300"
                    )} />
                    {audience}
                  </button>
                ))}
              </div>
            </div>

            {targetAudience === 'Tourists' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-slate-100"
              >
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={targetingOptions.allTourists} 
                      onChange={() => setTargetingOptions({ ...targetingOptions, allTourists: true, specificTourist: false, dateRange: false })}
                      className="w-4 h-4 text-safari-gold focus:ring-safari-gold"
                    />
                    <span className="text-sm text-slate-700 font-medium">Send to all tourists</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={targetingOptions.specificTourist} 
                      onChange={() => setTargetingOptions({ ...targetingOptions, allTourists: false, specificTourist: true, dateRange: false })}
                      className="w-4 h-4 text-safari-gold focus:ring-safari-gold"
                    />
                    <span className="text-sm text-slate-700 font-medium">Send to specific tourist</span>
                  </label>

                  {targetingOptions.specificTourist && (
                    <div className="pl-7 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search tourist name..."
                          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                          value={touristSearch}
                          onChange={(e) => setTouristSearch(e.target.value)}
                        />
                      </div>
                      <select 
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        value={targetingOptions.touristId}
                        onChange={(e) => setTargetingOptions({ ...targetingOptions, touristId: e.target.value })}
                      >
                        <option value="">Select a tourist</option>
                        {tourists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  )}

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={targetingOptions.dateRange} 
                      onChange={() => setTargetingOptions({ ...targetingOptions, allTourists: false, specificTourist: false, dateRange: true })}
                      className="w-4 h-4 text-safari-gold focus:ring-safari-gold"
                    />
                    <span className="text-sm text-slate-700 font-medium">Send to tourists within date range</span>
                  </label>

                  {targetingOptions.dateRange && (
                    <div className="pl-7 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                          value={targetingOptions.startDate}
                          onChange={(e) => setTargetingOptions({ ...targetingOptions, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                          value={targetingOptions.endDate}
                          onChange={(e) => setTargetingOptions({ ...targetingOptions, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-12">
            <button 
              onClick={handleSend}
              disabled={loading || !title || !message}
              className="w-full py-4 bg-safari-gold text-safari-dark rounded-2xl font-bold text-lg shadow-xl shadow-safari-gold/20 hover:bg-safari-gold/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-safari-dark/30 border-t-safari-dark rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Broadcast Notification
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="w-full md:w-[320px] bg-slate-50 p-8 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h3 className="font-bold text-slate-900">Mobile Preview</h3>
            <p className="text-xs text-slate-500">How it appears to users</p>
          </div>

          <div className="relative w-[240px] h-[480px] bg-slate-900 rounded-[40px] border-[6px] border-slate-800 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-10" />
            
            <div className="h-full w-full bg-cover bg-center p-4 pt-12" style={{ backgroundImage: 'url(https://picsum.photos/seed/yala/400/800)' }}>
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
              
              <motion.div 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                key={title + message}
                className="relative z-20 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-safari-gold flex items-center justify-center">
                    <Smartphone className="w-3 h-3 text-safari-dark" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">YALA360 • NOW</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 truncate">{title || 'Notification Title'}</h4>
                <p className="text-xs text-slate-600 line-clamp-3 mt-1 leading-relaxed">{message || 'Your message will appear here...'}</p>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-slate-400">
            <Smartphone className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Preview</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
