import React from 'react';
import { createClient } from '@/utils/supabase/server';
import PlaylistGrid from '@/components/PlaylistGrid';
import { redirect } from 'next/navigation'; // <-- TAMBAHKAN IMPORT INI

export const metadata = {
  title: "My Playlists - Chord Tempo",
  description: "Kelola daftar lagu dan setlist latihan Anda.",
};

export default async function PlaylistsPage() {
  const supabase = await createClient();

  // 1. CEK AUTENTIKASI: Ambil data user yang sedang aktif
  const { data: { user } } = await supabase.auth.getUser();

  // 2. REDIRECT: Jika tidak ada user, langsung lempar ke halaman login
  if (!user) {
    redirect('/login');
  }

  // Fetch data di sisi Server (Hanya dieksekusi jika user sudah login)
  const { data: playlists, error } = await supabase
    .from('playlists')
    .select('*, playlist_items(count)')
    .eq('user_id', user.id) // Pastikan hanya memanggil playlist milik user ini
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Gagal memuat playlist:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">My Playlists</h1>
        <p className="text-muted-foreground">Kelola daftar lagu dan setlist latihan Anda.</p>
      </div>

      <PlaylistGrid initialPlaylists={playlists || []} />
    </div>
  );
}