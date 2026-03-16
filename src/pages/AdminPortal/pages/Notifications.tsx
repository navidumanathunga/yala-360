import React, { useState } from 'react';
import { Bell, Send, AlertTriangle, Info, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../utils';

export default function Notifications({ initialType }: { initialType?: string }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState(initialType || 'info');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  React.useEffect(() => {
    if (initialType) {
      setType(initialType);
    }
  }, [initialType]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    setStatus(null);
    try {
      await api.sendNotification({
        title,
        message,
        targetAudience: 'All'
      });
      setStatus({ type: 'success', text: 'Notification broadcasted successfully!' });
      setTitle('');
      setMessage('');
    } catch (error) {
      setStatus({ type: 'error', text: 'Failed to broadcast notification.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-safari-gold" />
            Broadcast Notification
          </h2>

          {status && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <p className="text-sm font-medium">{status.text}</p>
            </div>
          )}
          
          <form onSubmit={handleSend} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Notification Type</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'info', label: 'Information', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { id: 'alert', label: 'Critical Alert', icon: Bell, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                      type === t.id ? "border-safari-gold bg-safari-gold/5" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", t.bg, t.color)}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Title</label>
              <input 
                type="text" 
                placeholder="e.g. High Park Congestion Alert" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">Message Content</label>
              <textarea 
                rows={4}
                placeholder="Enter the message you want to send to all active users..." 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={sending || !message.trim()}
              className="w-full py-4 bg-safari-gold text-safari-dark rounded-xl font-bold text-lg hover:bg-safari-gold/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-safari-dark/30 border-t-safari-dark rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              Send Broadcast
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-6">Recent Broadcasts</h3>
          <div className="space-y-4">
            {[
              { title: 'Block 2 Entry Delay', time: '2 hours ago', type: 'warning' },
              { title: 'New Leopard Spotting', time: '5 hours ago', type: 'info' },
              { title: 'Park Closure: Heavy Rain', time: '1 day ago', type: 'alert' },
            ].map((b, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex gap-4">
                <div className={cn(
                  "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                  b.type === 'warning' ? "bg-amber-500/10 text-amber-600" : 
                  b.type === 'alert' ? "bg-rose-500/10 text-rose-600" : "bg-blue-500/10 text-blue-600"
                )}>
                  {b.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
                   b.type === 'alert' ? <Bell className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{b.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">System Status</h3>
          </div>
          <p className="text-sm text-slate-600">
            All notification services are operational. Push notifications are reaching 98.4% of active devices.
          </p>
        </div>
      </div>
    </div>
  );
}
