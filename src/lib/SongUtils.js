import { createClient } from '@/utils/supabase/client';

export const saveNewSong = async (songData, chordContent) => {
  const supabase = createClient();

  // 1. Simpan ke tabel songs
  const { data: song, error: songError } = await supabase
    .from('songs')
    .insert([{
      title: songData.title,
      artist: songData.artist,
      slug: songData.slug,
      bpm: parseInt(songData.bpm),
      time_signature: songData.timeSignature
    }])
    .select() // Mengambil kembali data yang di-insert
    .single();

  // Ubah error Supabase menjadi Error bawaan Javascript agar mudah dibaca
  if (songError) {
    console.error("Error DB Lagu:", songError);
    throw new Error(songError.message || "Gagal saat membaca/menyimpan lagu");
  }

  // Pastikan lagu mendapatkan ID sebelum lanjut ke chord
  if (!song || !song.id) {
    throw new Error("Lagu masuk, tapi ID tidak ditemukan untuk menyimpan chord.");
  }

  // 2. Simpan chord
  const { error: chordError } = await supabase
    .from('chord_articles')
    .insert([{
      song_id: song.id,
      content: chordContent
    }]);

  if (chordError) {
    console.error("Error DB Chord:", chordError);
    throw new Error(chordError.message || "Gagal saat menyimpan chord");
  }

  return song;
};

export const updateExistingSong = async (songId, songData, chordContent) => {
  const supabase = createClient();

  const { error: songError } = await supabase
    .from('songs')
    .update({
      title: songData.title,
      artist: songData.artist,
      slug: songData.slug,
      bpm: parseInt(songData.bpm),
      time_signature: songData.timeSignature
      // audio_url dihapus
    })
    .eq('id', songId);

  if (songError) throw songError;

  const { error: chordError } = await supabase
    .from('chord_articles')
    .update({ content: chordContent })
    .eq('song_id', songId);

  if (chordError) throw chordError;

  return true;
};

export const deleteSong = async (id) => {
  const supabase = createClient();
  
  // Hapus dari database
  const { error } = await supabase
    .from('songs')
    .delete()
    .eq('id', id);

  // Jika ada error (misal RLS memblokir), lempar error tersebut ke catch
  if (error) {
    console.error("Supabase Delete Error:", error);
    throw error; 
  }
  
  return true;
};