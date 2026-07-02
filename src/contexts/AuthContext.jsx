"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      const currentUser = session?.user ?? null;
      
      if (currentUser) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          
          if (mounted) setUser({ ...currentUser, role: profile?.role || 'user' });
        } catch (err) {
          if (mounted) setUser({ ...currentUser, role: 'user' });
        }
      } else {
        if (mounted) setUser(null);
      }
      
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // LOGIN YANG SUDAH DIOPTIMASI
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // THE MAGIC FIX: Paksa browser memuat ulang dari server (bukan dari cache Next.js)
    window.location.href = '/admin/dashboard'; 
    return data;
  };

  // LOGOUT YANG SUDAH DIOPTIMASI
  const logout = async () => {
    await supabase.auth.signOut();
    
    // Hapus state lokal
    setUser(null);
    setSession(null);
    
    // THE MAGIC FIX: Paksa kembali ke halaman login dan bersihkan cache memory
    window.location.href = '/login';
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    supabase
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);