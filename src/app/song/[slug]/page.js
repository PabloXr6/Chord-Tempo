import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server'; 
import SongClient from '@/components/SongClient';

// Opsional: Untuk SEO, mengubah judul tab browser sesuai nama lagu
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: song } = await supabase
    .from('songs')
    .select('title, artist')
    .eq('slug', slug)
    .single();
  
  if (!song) return { title: 'Lagu Tidak Ditemukan | Chord Tempo' };
  return { title: `${song.title} - ${song.artist} | Chord Tempo` };
}

// SERVER COMPONENT MURNI (Tanpa "use client")
export default async function SongPage({ params }) {
  const { slug } = await params; 
  
  const supabase = await createClient();
  
  // Mengambil data langsung di server (tanpa loading di browser)
  const { data: songData, error } = await supabase
    .from('songs')
    .select('*, chord_articles(content)')
    .eq('slug', slug)
    .single();

  if (error || !songData) {
    notFound();
  }

  // Lempar data yang sudah siap langsung ke komponen UI
  return <SongClient song={songData} />;
}