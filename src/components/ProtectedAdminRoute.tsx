import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// List of admin email addresses — add your admin emails here
const ADMIN_EMAILS = [
  'vimukthiubeysekera@gmail.com',
  'admin@yala360.com',
];

interface Props {
  children: React.ReactNode;
}

/**
 * ProtectedAdminRoute
 *
 * Wraps a route so that only logged-in admins can access it.
 * - Not logged in → redirect to /login
 * - Logged in but NOT admin → redirect to / with a warning
 */
const ProtectedAdminRoute: React.FC<Props> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (!currentUser) {
    // Not logged in — send to login
    return <Navigate to="/login" replace />;
  }

  if (!ADMIN_EMAILS.includes(currentUser.email || '')) {
    // Logged in but not an admin — go back home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
