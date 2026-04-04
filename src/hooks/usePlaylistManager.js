"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { createPlaylist as createDbPlaylist, deletePlaylist as deleteDbPlaylist } from '@/lib/PlaylistUtils';
import { toast } from 'sonner';

export const usePlaylistManager = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    try {
      // Kita lakukan kueri langsung di sini agar bisa mengambil jumlah lagu (count) 
      // dari tabel relasi 'playlist_items' secara efisien.
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_items (count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      toast.error("Gagal memuat daftar playlist");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const createPlaylist = async (name) => {
    try {
      const newPlaylist = await createDbPlaylist(name);
      // Format response agar sesuai dengan struktur array (menambahkan mock count)
      const formattedPlaylist = { ...newPlaylist, playlist_items: [{ count: 0 }] };
      setPlaylists(prev => [formattedPlaylist, ...prev]);
      toast.success("Playlist berhasil dibuat");
      return newPlaylist;
    } catch (error) {
      toast.error(error.message || "Gagal membuat playlist");
    }
  };

  const deletePlaylist = async (id) => {
    try {
      await deleteDbPlaylist(id);
      setPlaylists(prev => prev.filter(p => p.id !== id));
      toast.success("Playlist berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus playlist");
    }
  };

  return { 
    playlists, 
    loading, 
    createPlaylist, 
    deletePlaylist, 
    refreshPlaylists: fetchPlaylists 
  };
};