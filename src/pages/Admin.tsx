import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminApp from './AdminPortal/App';
import AdminLogin from './AdminPortal/AdminLogin';
import { isAdminInFirestore } from '../services/adminService';

const Admin: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin]     = useState<boolean | null>(null); // null = still checking

  useEffect(() => {
    if (loading) return;

    if (!currentUser?.email) {
      setIsAdmin(false);
      return;
    }

    // Check Firestore admins collection
    isAdminInFirestore(currentUser.email).then(result => {
      setIsAdmin(result);
    });
  }, [currentUser, loading]);

  // Still loading auth or admin check
  if (loading || isAdmin === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]" />
      </div>
    );
  }

  // Not logged in or not admin → show admin login form
  if (!isAdmin) {
    return (
      <div className="pt-[72px] h-screen overflow-hidden">
        <AdminLogin onLoginSuccess={() => setIsAdmin(true)} />
      </div>
    );
  }

  // Verified admin → show portal
  return (
    <div className="pt-[72px] h-screen overflow-hidden">
      <AdminApp />
    </div>
  );
};

export default Admin;
