import React, { useState } from 'react';
import { QrCode, Search, CheckCircle2, XCircle, Clock, User, Calendar, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { cn } from '../utils';

export default function QRVerification() {
  const [bookingId, setBookingId] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId.trim()) return;
    
    setLoading(true);
    try {
      const result = await api.verifyBooking(bookingId);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({ valid: false, message: 'Invalid Booking ID' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="glass-card p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-safari-gold/20 flex items-center justify-center mx-auto mb-6 border border-safari-gold/30">
          <QrCode className="w-10 h-10 text-safari-gold" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Safari Booking</h2>
        <p className="text-slate-500 mb-8">Enter Booking ID or scan QR code to verify entry validity.</p>
        
        <form onSubmit={handleVerify} className="flex gap-4 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Enter Booking ID (e.g. BK-1001)" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-safari-gold/50 text-slate-900"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 bg-safari-gold text-safari-dark rounded-xl font-bold hover:bg-safari-gold/90 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {verificationResult && (
        <div className={cn(
          "glass-card p-8 border-t-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
          verificationResult.valid ? "border-t-emerald-500" : "border-t-rose-500"
        )}>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center shrink-0",
              verificationResult.valid ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {verificationResult.valid ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className={cn(
                "text-2xl font-bold mb-2",
                verificationResult.valid ? "text-emerald-600" : "text-rose-600"
              )}>
                {verificationResult.valid ? "Booking Verified Successfully" : "Verification Failed"}
              </h3>
              <p className="text-slate-500 mb-6">
                {verificationResult.valid ? "This tourist is authorized for entry into Yala National Park." : verificationResult.message || "Invalid booking ID."}
              </p>
              
              {verificationResult.valid && verificationResult.booking && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Tourist</p>
                    <p className="text-sm text-slate-900 font-medium">{verificationResult.booking.touristName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Safari Date</p>
                    <p className="text-sm text-slate-900 font-medium">{verificationResult.booking.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Visitors</p>
                    <p className="text-sm text-slate-900 font-medium">{verificationResult.booking.guests} Persons</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Driver</p>
                    <p className="text-sm text-slate-900 font-medium">{verificationResult.booking.driverName || 'Not Assigned'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Security Level</p>
            <p className="text-sm font-bold text-slate-900">High (Encrypted)</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-safari-gold/10 flex items-center justify-center text-safari-gold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Verified By</p>
            <p className="text-sm font-bold text-slate-900">Admin Portal</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Last Sync</p>
            <p className="text-sm font-bold text-slate-900">Just Now</p>
          </div>
        </div>
      </div>
    </div>
  );
}
