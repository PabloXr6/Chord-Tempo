import { createClient } from '@/utils/supabase/client';

// Fungsi bantuan untuk mendapatkan instance supabase
const getSupabase = () => createClient();

export const getPlaylists = async () => {
  try {
    const supabase = getSupabase();
    
    // Ambil semua playlist milik user yang sedang login (diatur otomatis oleh Supabase RLS)
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Failed to fetch playlists from Supabase', e);
    return [];
  }
};

export const createPlaylist = async (name) => {
  try {
    const supabase = getSupabase();
    
    // 1. Dapatkan user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Anda harus login untuk membuat playlist");

    // 2. Insert playlist baru
    const { data, error } = await supabase
      .from('playlists')
      .insert([
        { 
          name, 
          user_id: user.id 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Failed to create playlist', e);
    throw e; // Lemparkan error agar bisa ditangkap oleh toast di Modal
  }
};

export const getPlaylistById = async (id) => {
  try {
    const supabase = getSupabase();
    
    // MELAKUKAN JOIN TABEL:
    // Ambil data playlist, lalu ambil relasi playlist_items, 
    // dan ambil juga data lagu (songs) yang berelasi dengan item tersebut.
    const { data, error } = await supabase
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

    if (error) throw error;
    
    // Urutkan item berdasarkan sort_order atau tanggal dibuat
    if (data && data.playlist_items) {
      data.playlist_items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
    
    return data;
  } catch (e) {
    console.error(`Failed to fetch playlist ${id}`, e);
    return null;
  }
};

export const updatePlaylist = async (id, updates) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('playlists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error(`Failed to update playlist ${id}`, e);
    return null;
  }
};

export const deletePlaylist = async (id) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error(`Failed to delete playlist ${id}`, e);
    return false;
  }
};

export const addSongToPlaylist = async (playlistId, songData) => {
  try {
    const supabase = getSupabase();
    
    // Hitung jumlah lagu yang ada untuk menentukan urutan (sort_order)
    const { count } = await supabase
      .from('playlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('playlist_id', playlistId);

    // Insert lagu ke tabel junction 'playlist_items'
    const { data, error } = await supabase
      .from('playlist_items')
      .insert([
        {
          playlist_id: playlistId,
          song_id: songData.song_id, // Berasal dari Modal
          custom_bpm: songData.custom_bpm,
          custom_time_signature: songData.custom_time_signature,
          sort_order: count ? count + 1 : 1
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Failed to add song to playlist', e);
    throw e;
  }
};

export const removeSongFromPlaylist = async (playlistId, playlistItemId) => {
  try {
    const supabase = getSupabase();
    // Di database relasional, kita cukup menghapus berdasarkan ID itemnya saja
    const { error } = await supabase
      .from('playlist_items')
      .delete()
      .eq('id', playlistItemId);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Failed to remove song', e);
    return false;
  }
};

export const reorderSongs = async (playlistId, newOrder) => {
  try {
    const supabase = getSupabase();
    
    // newOrder diasumsikan sebagai array of objects: [{ id: 'item_id_1', sort_order: 1 }, ...]
    // Kita gunakan promise.all untuk update massal
    const updatePromises = newOrder.map((item) => 
      supabase
        .from('playlist_items')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    );

    await Promise.all(updatePromises);
    return true;
  } catch (e) {
    console.error('Failed to reorder songs', e);
    return false;
  }
};