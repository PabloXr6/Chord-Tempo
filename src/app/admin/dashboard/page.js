"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();

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
            </div>
          </div>
          <p className="mt-4">
            Jika Anda melihat halaman ini, berarti integrasi Supabase Auth dan Protected Route kita telah **berhasil 100%!** 🎉
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}