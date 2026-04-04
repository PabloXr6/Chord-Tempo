"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Trash2, Clock, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Pastikan mengimpor utilitas yang sudah dikonversi menjadi async (Supabase)
import { getPlaylistById, removeSongFromPlaylist, deletePlaylist } from '@/lib/PlaylistUtils';
import { toast } from 'sonner';

export default function PlaylistDetailPage({ params }) {
  // Unwrap params di Next.js App Router (wajib di React 19 / Next 15)
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const router = useRouter();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlaylistData = async () => {
    try {
      setLoading(true);
      const data = await getPlaylistById(id);
      
      if (data) {
        setPlaylist(data);
        document.title = `${data.name} - Playlist | Chord Tempo`;
      } else {
        toast.error('Playlist tidak ditemukan');
        router.push('/playlists');
      }
    } catch (error) {
      console.error("Error memuat detail playlist:", error);
      toast.error('Terjadi kesalahan saat memuat playlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlaylistData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const handleRemoveSong = async (playlistItemId) => {
    try {
      await removeSongFromPlaylist(id, playlistItemId);
      toast.success('Lagu dihapus dari playlist');
      // Refresh data playlist untuk memperbarui UI
      await fetchPlaylistData();
    } catch (error) {
      toast.error('Gagal menghapus lagu');
    }
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus playlist "${playlist?.name}" beserta semua isinya?`)) {
      try {
        await deletePlaylist(id);
        toast.success('Playlist berhasil dihapus');
        router.push('/playlists');
      } catch (error) {
        toast.error('Gagal menghapus playlist');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="space-y-4 mt-8">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!playlist) return null;

  // Di Supabase, item lagu ada di dalam properti playlist_items
  const items = playlist.playlist_items || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" asChild className="mb-6 text-muted-foreground hover:text-foreground">
        <Link href="/playlists"><ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Playlists</Link>
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{playlist.name}</h1>
          <p className="text-muted-foreground text-lg">
            {items.length} {items.length === 1 ? 'lagu' : 'lagu'}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeletePlaylist}>
            <Trash2 className="w-4 h-4 mr-2" /> Hapus
          </Button>
          <Button asChild size="lg" disabled={items.length === 0} className="flex-1 md:flex-none">
            <Link href={items.length > 0 ? `/playlists/${playlist.id}/play` : '#'}>
              <Play className="w-5 h-5 mr-2" /> Putar Semua
            </Link>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border">
          <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Playlist masih kosong</h3>
          <p className="text-muted-foreground mb-6">Cari lagu dan tambahkan ke playlist ini untuk mulai berlatih.</p>
          <Button asChild><Link href="/">Cari Lagu</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            // Data lagu aslinya (title, artist) di-join oleh Supabase ke dalam item.songs
            const song = item.songs; 
            
            return (
              <Card key={item.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-muted-foreground font-medium w-6 text-center">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link href={`/song/${song.slug}`} className="hover:underline">
                      <h3 className="font-bold text-lg truncate">{song.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground mr-4">
                    {item.custom_bpm && (
                      <div className="flex items-center gap-1.5" title="Custom BPM">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">{item.custom_bpm}</span>
                      </div>
                    )}
                    {item.custom_time_signature && (
                      <div className="flex items-center gap-1.5" title="Custom Time Signature">
                        <Music2 className="w-4 h-4 text-secondary" />
                        <span className="text-secondary font-medium">{item.custom_time_signature}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="secondary" size="icon" className="rounded-full">
                      <Link href={`/playlists/${playlist.id}/play?start=${index}`}>
                        <Play className="w-4 h-4 ml-0.5" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveSong(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}