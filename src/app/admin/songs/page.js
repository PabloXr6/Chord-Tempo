import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminSongsClient from '@/components/AdminSongsClient';

export const metadata = {
  title: "Manajemen Lagu - Admin | Chord Tempo",
};

export default async function AdminSongsPage() {
  const supabase = await createClient();

  // 1. Pastikan user sudah login
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Tarik semua data lagu secara instan di sisi Server
  const { data: songs, error } = await supabase
    .from('songs')
    .select('id, title, artist, bpm, time_signature, slug')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Gagal memuat daftar lagu dari server:", error);
  }

  // 3. Lempar datanya ke Client Component
  return <AdminSongsClient initialSongs={songs || []} />;
}