import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { LogIn, Shield, Eye, EyeOff } from 'lucide-react';
import { isAdminInFirestore } from '../../services/adminService';



const GOLD = '#C5A059';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const adminOk = await isAdminInFirestore(cred.user.email);
      if (!adminOk) {
        await auth.signOut();
        setError('Access denied. This portal is for admins only.');
      } else {
        onLoginSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('invalid-credential') || err.message.includes('wrong-password')) {
          setError('Invalid email or password.');
        } else if (err.message.includes('user-not-found')) {
          setError('No account found with this email.');
        } else {
          setError('Login failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const adminOk = await isAdminInFirestore(cred.user.email);
      if (!adminOk) {
        await auth.signOut();
        setError('Access denied. This account is not an admin.');
      } else {
        onLoginSuccess();
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-[#0f172a]">
      <div className="w-full max-w-md mx-4">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #a07c3e)` }}
          >
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Admin Portal
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            YALA360 — Restricted Access
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-xl p-4">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-[#C5A059] transition-colors"
                placeholder="admin@yala360.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-[#C5A059] transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #a07c3e)` }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Portal
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-600" />
            <span className="text-xs text-slate-500 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-600" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-slate-600 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Authorised personnel only. Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
