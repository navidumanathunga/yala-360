import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, Leaf } from 'lucide-react';

const GOLD = '#C5A059';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { currentUser } = useAuth();

  // Where to go after successful login — default to /booking
  const params    = new URLSearchParams(location.search);
  const fromPath  = params.get('from') || '/booking';

  useEffect(() => {
    if (currentUser) navigate(fromPath, { replace: true });
  }, [currentUser, navigate, fromPath]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate(fromPath, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('invalid-credential') || err.message.includes('wrong-password')) {
          setError('Incorrect email or password. Please try again.');
        } else if (err.message.includes('user-not-found')) {
          setError('No account found. Please sign up first.');
        } else if (err.message.includes('email-already-in-use')) {
          setError('Email already in use. Try signing in.');
        } else if (err.message.includes('weak-password')) {
          setError('Password must be at least 6 characters.');
        } else {
          setError('Authentication failed. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate(fromPath, { replace: true });
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center px-4 pt-28 pb-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ background: GOLD }}
          >
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl serif text-gray-900">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-light">
            {isRegistering
              ? 'Join YALA360 and start exploring.'
              : 'Sign in to manage your safari bookings.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8 md:p-10">

          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">
              <span className="mt-0.5 text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block text-[10px] uppercase font-bold tracking-widest"
                style={{ color: GOLD }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900 text-sm transition-colors"
                style={{ borderColor: email ? GOLD : undefined }}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-[10px] uppercase font-bold tracking-widest"
                style={{ color: GOLD }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none text-gray-900 text-sm pr-12 transition-colors"
                  style={{ borderColor: password ? GOLD : undefined }}
                  placeholder={isRegistering ? 'Min. 6 characters' : '••••••••'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #a07c3e)` }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isRegistering ? (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Button */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Google
          </button>

          {/* Switch Register / Login */}
          <p className="mt-8 text-center text-xs text-gray-500">
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="font-bold hover:underline"
              style={{ color: GOLD }}
            >
              {isRegistering ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Back link */}
        <p className="mt-6 text-center text-xs text-gray-400">
          <Link to="/" className="hover:underline">← Back to YALA360</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
