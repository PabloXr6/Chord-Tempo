import { createClient } from '@/utils/supabase/client';

// 1. BEST PRACTICE: Buat instance Supabase SATU KALI di luar fungsi
// agar koneksinya stabil dan tidak menggantung saat tombol diklik berulang kali.
const supabase = createClient();

export const saveNewSong = async (songData, chordContent) => {
  try {
    // Pastikan BPM adalah angka yang valid (cegah NaN yang bisa membuat DB error)
    const bpmValue = parseInt(songData.bpm);
    
    // 2. Simpan ke tabel songs
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert([{
        title: songData.title?.trim() || 'Untitled',
        artist: songData.artist?.trim() || 'Unknown Artist',
        slug: songData.slug?.trim(),
        bpm: isNaN(bpmValue) ? 120 : bpmValue, 
        time_signature: songData.timeSignature?.trim() || '4/4'
      }])
      .select() 
      .single();

    // Lemparkan error agar ditangkap oleh catch di bawah
    if (songError) {
      console.error("❌ Supabase Song Error:", songError);
      throw new Error(songError.message || "Gagal menyimpan detail lagu ke database.");
    }

    if (!song || !song.id) {
      throw new Error("Lagu masuk, tapi ID tidak ditemukan dari Supabase.");
    }

    // 3. Simpan chord
    const { error: chordError } = await supabase
      .from('chord_articles')
      .insert([{
        song_id: song.id,
        content: chordContent || ''
      }]);

    if (chordError) {
      console.error("❌ Supabase Chord Error:", chordError);
      // OPTIONAL: Rollback (hapus lagu) jika chord gagal tersimpan agar data tidak setengah jadi
      await supabase.from('songs').delete().eq('id', song.id);
      throw new Error(chordError.message || "Gagal menyimpan chord, lagu dibatalkan.");
    }

    return song;
  } catch (error) {
    // 4. Pastikan error selalu terlempar kembali ke form (NewSongPage)
    // agar setLoading(false) di sana BISA dieksekusi!
    console.error("🔥 Fatal Error di saveNewSong:", error);
    throw error; 
  }
};

export const updateExistingSong = async (songId, songData, chordContent) => {
  try {
    const bpmValue = parseInt(songData.bpm);

    const { error: songError } = await supabase
      .from('songs')
      .update({
        title: songData.title?.trim(),
        artist: songData.artist?.trim(),
        slug: songData.slug?.trim(),
        bpm: isNaN(bpmValue) ? 120 : bpmValue,
        time_signature: songData.timeSignature?.trim()
      })
      .eq('id', songId);

    if (songError) throw songError;

    const { error: chordError } = await supabase
      .from('chord_articles')
      .update({ content: chordContent || '' })
      .eq('song_id', songId);

    if (chordError) throw chordError;

    return true;
  } catch (error) {
    console.error("🔥 Fatal Error di updateExistingSong:", error);
    throw error;
  }
};

export const deleteSong = async (id) => {
  try {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("❌ Supabase Delete Error:", error);
      throw error; 
    }
    
    return true;
  } catch (error) {
    console.error("🔥 Fatal Error di deleteSong:", error);
    throw error;
  }
};