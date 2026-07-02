"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ListMusic, Plus, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // Fungsi Fetch Data yang kebal cache
  const fetchPlaylists = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('playlists')
        .select('*, playlist_items(count)')
        .order('created_at', { ascending: false }); // Mengambil data terbaru di atas

      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error memuat playlist:', error);
      toast.error('Gagal memuat daftar playlist');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Memuat data saat pertama kali buka ATAU saat kembali ke halaman ini
  useEffect(() => {
    document.title = "My Playlists - Chord Tempo";
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Optimistic Create
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('playlists')
        .insert([{ 
          name: newPlaylistName.trim(),
          user_id: user?.id 
        }])
        .select('*, playlist_items(count)')
        .single();

      if (error) throw error;

      // LANGSUNG UPDATE UI (Tanpa loading/refresh)
      setPlaylists(prev => [data, ...prev]);
      toast.success('Playlist berhasil dibuat!');
      
      setNewPlaylistName('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Gagal membuat playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optimistic Delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Hapus playlist "${name}" secara permanen?`)) return;

    // LANGSUNG HAPUS DARI UI SEKETIKA!
    setPlaylists(prev => prev.filter(p => p.id !== id));
    toast.success('Playlist dihapus');

    try {
      // Hapus di background
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus di database');
      fetchPlaylists(); // Kembalikan data jika ternyata database gagal menghapus
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Playlists</h1>
          <p className="text-muted-foreground">Kelola daftar lagu dan setlist latihan Anda.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Playlist Baru</DialogTitle>
              <DialogDescription className="sr-only">Masukkan nama playlist baru yang ingin dibuat.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <Input
                placeholder="Nama Playlist (contoh: Sunday Service)"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" disabled={!newPlaylistName.trim() || isSubmitting}>
                  {isSubmitting ? "Membuat..." : "Buat"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 rounded-xl bg-card" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
          <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Belum ada playlist</h3>
          <p className="text-muted-foreground mb-6">Buat playlist pertama Anda untuk mengelola sesi latihan.</p>
          <Button onClick={() => setIsDialogOpen(true)}>Buat Playlist Pertama</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(playlist => {
            const songCount = playlist.playlist_items?.[0]?.count || 0;
            
            return (
              <Card key={playlist.id} className="bg-card hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start">
                    <Link href={`/playlists/${playlist.id}`} className="hover:text-primary transition-colors">
                      {playlist.name}
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(playlist.id, playlist.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6">
                    {songCount} {songCount === 1 ? 'lagu' : 'lagu'}
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="secondary" className="flex-1">
                      <Link href={`/playlists/${playlist.id}`}>Detail</Link>
                    </Button>
                    <Button asChild className="flex-1" disabled={songCount === 0}>
                      <Link href={`/playlists/${playlist.id}/play`}>
                        <Play className="w-4 h-4 mr-2" /> Putar
                      </Link>
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