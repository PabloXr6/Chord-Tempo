import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import PlaylistPlaybackClient from '@/components/PlaylistPlaybackClient';

export async function generateMetadata({ params }) {
  const unwrappedParams = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('playlists').select('name').eq('id', unwrappedParams.id).single();
  
  return {
    title: data ? `Memutar: ${data.name} | Chord Tempo` : 'Memutar Playlist | Chord Tempo',
  };
}

export default async function PlaylistPlaybackPage({ params, searchParams }) {
  const unwrappedParams = await params;
  const id = unwrappedParams.id;
  
  const unwrappedSearchParams = await searchParams;
  const startIndex = parseInt(unwrappedSearchParams.start) || 0;

  const supabase = await createClient();

  // 1. Cek Autentikasi
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 2. Ambil data playlist, lagu, dan chord sekaligus
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
          time_signature,
          audio_url,
          chord_articles(content)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !playlist) {
    redirect('/playlists');
  }

  // Urutkan lagu
  if (playlist.playlist_items) {
    playlist.playlist_items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  return (
    <PlaylistPlaybackClient initialPlaylist={playlist} initialStartIndex={startIndex} />
  );
}