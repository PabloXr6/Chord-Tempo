"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter(); 
  
  // Ref untuk menyimpan timer auto-logout
  const logoutTimerRef = useRef(null);

  // Pindahkan logout ke atas agar bisa dipanggil oleh timer
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Supabase signout error (diabaikan):", error);
    } finally {
      // Pastikan state selalu bersih apapun yang terjadi
      setUser(null);
      setSession(null);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    }
  };

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      const currentUser = session?.user ?? null;
      
      // Bersihkan timer lama jika status berubah
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      
      if (currentUser) {
        // --- FITUR AUTO LOGOUT 2 JAM (7.200.000 ms) ---
        logoutTimerRef.current = setTimeout(async () => {
          await logout();
          window.location.href = '/login?expired=true'; // Hard redirect otomatis
        }, 7200000); 
        // ----------------------------------------------

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
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [supabase]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    router.push('/'); 
    router.refresh();
    return data;
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