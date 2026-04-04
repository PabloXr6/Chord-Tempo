import { createClient } from '@/utils/supabase/client';

export const saveNewSong = async (songData, chordContent) => {
  const supabase = createClient();

  // 1. Insert ke tabel songs
  const { data: song, error: songError } = await supabase
    .from('songs')
    .insert([{
      title: songData.title,
      artist: songData.artist,
      slug: songData.slug,
      bpm: parseInt(songData.bpm),
      time_signature: songData.timeSignature
    }])
    .select()
    .single();

  if (songError) throw songError;

  // 2. Insert ke tabel chord_articles menggunakan ID song yang baru saja dibuat
  const { error: chordError } = await supabase
    .from('chord_articles')
    .insert([{
      song_id: song.id,
      content: chordContent
    }]);

  if (chordError) throw chordError;

  return song;
};

// Tambahkan ini di file src/lib/SongUtils.js
export const deleteSong = async (id) => {
  const supabase = createClient();
  
  // Karena kita menggunakan ON DELETE CASCADE pada tabel chord_articles,
  // menghapus baris di tabel 'songs' otomatis akan menghapus chord-nya juga.
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const updateExistingSong = async (songId, songData, chordContent) => {
  const supabase = createClient();

  // 1. Update data di tabel songs
  const { error: songError } = await supabase
    .from('songs')
    .update({
      title: songData.title,
      artist: songData.artist,
      slug: songData.slug,
      bpm: parseInt(songData.bpm),
      time_signature: songData.timeSignature
    })
    .eq('id', songId);

  if (songError) throw songError;

  // 2. Update data di tabel chord_articles
  const { error: chordError } = await supabase
    .from('chord_articles')
    .update({ content: chordContent })
    .eq('song_id', songId);

  if (chordError) throw chordError;

  return true;
};