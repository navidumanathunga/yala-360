import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
}

/**
 * ProtectedRoute — wraps pages that require a logged-in user.
 * If not authenticated, redirects to /login and saves the current
 * path in `?from=` so the user is sent back after login.
 */
const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(197,160,89,0.3)', borderTopColor: '#C5A059' }}
          />
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Save where the user was trying to go so we can redirect back after login
    return (
      <Navigate
        to={`/login?from=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
