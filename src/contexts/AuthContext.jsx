"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation'; // TAMBAHKAN INI

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter(); 

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

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    router.push('/'); 
    router.refresh();
    return data;
  };

  const logout = async () => {
    // Tambahkan penangkap error agar kita tahu jika Supabase gagal
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Hapus state
    setUser(null);
    setSession(null);
    
    // HAPUS router.push dan router.refresh dari sini!
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