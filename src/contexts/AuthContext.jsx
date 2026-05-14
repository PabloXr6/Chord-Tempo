"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

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
  }, [supabase, router]);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    return data;
  };

  const signup = async (email, password, metadata = {}) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // Gunakan window.location agar seluruh state memory bersih total
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    login,
    signup,
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