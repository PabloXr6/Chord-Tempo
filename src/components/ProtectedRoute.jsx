"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Beri jeda sedikit agar Supabase session sempat terdeteksi
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Jika masih loading, tetap tampilkan spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Jika tidak terautentikasi, jangan render children
  if (!isAuthenticated) return null;

  return children;
};

export default ProtectedRoute;