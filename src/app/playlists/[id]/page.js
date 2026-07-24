import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PlaylistDetailClient from '@/components/PlaylistDetailClient';

// Metadata dinamis untuk judul tab browser
export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('playlists').select('name').eq('id', unwrappedParams.id).single();
  
  return {
    title: data ? `${data.name} - Playlist | Chord Tempo` : 'Detail Playlist | Chord Tempo',
  };
}

export default async function PlaylistDetailPage({ params }) {
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  const supabase = await createClient();

  // 1. Cek Autentikasi (Keamanan)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Fetch Data di Server (Sangat Cepat & Tanpa Skeleton)
  const { data: playlist, error } = await supabase
    .from('playlists')
    .select(`
      *,
      playlist_items (
        id,
        custom_bpm,
        custom_time_signature,
        sort_order,
        created_at,
        songs (
          id,
          title,
          artist,
          slug,
          bpm,
          time_signature
        )
      )
    `)
    .eq('id', id)
    .single();

  // Jika error atau playlist tidak ada, kembalikan ke halaman daftar playlist
  if (error || !playlist) {
    redirect('/playlists');
  }

  // Urutkan lagu sesuai sort_order
  if (playlist.playlist_items) {
    playlist.playlist_items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  return (
    <PlaylistDetailClient initialPlaylist={playlist} playlistId={id} />
  );
}