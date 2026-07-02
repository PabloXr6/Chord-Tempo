"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
// import { useRouter } from 'next/navigation'; // <-- Bisa dihapus karena tidak dipakai lagi

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Panggil fungsi login (Navigasi hard-redirect sudah diurus oleh AuthContext)
      await login(email, password);
      
      toast.success('Login berhasil! Mengalihkan...');
      
      // CATATAN PENTING: 
      // Kita sengaja TIDAK mematikan setLoading(false) di sini.
      // Tujuannya agar tombol tetap bertuliskan "Logging in..." 
      // sampai browser selesai memuat ulang (refresh) halaman dashboard.
      
    } catch (error) {
      // 2. Jika error (salah password dll), baru matikan loading agar user bisa coba lagi
      toast.error(error.message || 'Login gagal, periksa email/password');
      setLoading(false); 
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="admin@chordtempo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}