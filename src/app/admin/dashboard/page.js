"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react'; // Tambahkan Loader2

export default function AdminDashboardPage() {
  const { user, loading } = useAuth(); // Kita ambil loading dari AuthContext

  // Jika masih loading, tampilkan indikator ringan
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Selamat datang kembali, <span className="font-semibold text-foreground">{user?.email}</span>
              </p>
              {/* Tambahkan info role agar Anda tahu state-nya sudah benar */}
              <p className="text-xs text-primary font-mono mt-1">Role: {user?.role || 'user'}</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}