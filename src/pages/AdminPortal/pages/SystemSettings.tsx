import React, { useEffect, useState } from 'react';
import { Settings, Sliders, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { ToastType } from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

export default function SystemSettings({ showToast }: { showToast: (msg: string, type?: ToastType) => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettings(data.settings);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.updateSettings(settings);
      showToast('Settings updated successfully!');
    } catch (error) {
      showToast('Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      const res = await api.clearCache();
      showToast(res.message);
    } catch (error) {
      showToast('Failed to clear system cache', 'error');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safari-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar for settings */}
        <div className="space-y-2">
          {[
            { label: 'Safari Operational Rules', icon: Sliders, active: true },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.active ? 'bg-safari-gold text-safari-dark font-bold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-8">Safari Operational Rules</h2>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">Max Jeeps per Slot</h4>
                    <p className="text-xs text-slate-500">Global limit for park entry</p>
                  </div>
                  <input 
                    type="number" 
                    className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center text-safari-gold font-bold"
                    value={settings.maxJeepsPerSlot}
                    onChange={(e) => setSettings({ ...settings, maxJeepsPerSlot: parseInt(e.target.value) })}
                  />
                </div>
                <div className="h-px bg-slate-200"></div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">Platform Fee (%)</h4>
                    <p className="text-xs text-slate-500">Service charge for each booking</p>
                  </div>
                  <input 
                    type="number" 
                    className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center text-safari-gold font-bold"
                    value={settings.platformFee}
                    onChange={(e) => setSettings({ ...settings, platformFee: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="h-px bg-slate-200"></div>

                <div className="space-y-4">
                   <h4 className="font-bold text-slate-900">Operational Hours</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Opening Time</label>
                      <input 
                        type="time" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-safari-gold" 
                        value={settings.openingTime}
                        onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold">Closing Time</label>
                      <input 
                        type="time" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-safari-gold" 
                        value={settings.closingTime}
                        onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  className="flex-1 py-3 bg-safari-gold text-safari-dark rounded-xl font-bold hover:bg-safari-gold/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-safari-dark/30 border-t-safari-dark rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save Changes
                </button>
                <button 
                  className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  onClick={() => setIsResetModalOpen(true)}
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 bg-rose-50 border-rose-200">
            <h3 className="font-bold text-rose-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-4">Actions here are irreversible and affect the entire platform.</p>
            <div className="flex gap-4">
              <button 
                onClick={handleClearCache}
                disabled={clearing}
                className="px-4 py-2 bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-200 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {clearing && <RefreshCw className="w-3 h-3 animate-spin" />}
                Clear System Cache
              </button>
              <button 
                className="px-4 py-2 bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-200 transition-all"
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              >
                {settings.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          setSettings({
            maxJeepsPerSlot: 50,
            platformFee: 15,
            openingTime: '06:00',
            closingTime: '18:00',
            maintenanceMode: false
          });
          showToast('Settings reset to defaults');
        }}
        title="Reset Settings"
        message="Are you sure you want to reset all operational rules to default values? This action cannot be undone."
        confirmLabel="Reset to Defaults"
        variant="warning"
      />
    </div>
  );
}
