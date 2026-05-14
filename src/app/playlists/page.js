"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ListMusic, Plus, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlaylistManager } from '@/hooks/usePlaylistManager';

export default function PlaylistsPage() {
  const { playlists, loading, createPlaylist, deletePlaylist } = usePlaylistManager();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "My Playlists - Chord Tempo";
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      setIsSubmitting(true);
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsSubmitting(false);
      setIsDialogOpen(false);
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
        // Tampilan Skeleton Loading saat mengambil data dari Supabase
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 rounded-xl bg-card" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        // Tampilan Kosong
        <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
          <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Belum ada playlist</h3>
          <p className="text-muted-foreground mb-6">Buat playlist pertama Anda untuk mengelola sesi latihan.</p>
          <Button onClick={() => setIsDialogOpen(true)}>Buat Playlist Pertama</Button>
        </div>
      ) : (
        // Daftar Playlist
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(playlist => {
            // Karena kita menggunakan relasi Supabase, count lagu ada di playlist_items
            const songCount = playlist.playlist_items?.[0]?.count || 0;
            
            return (
              <Card key={playlist.id} className="bg-card hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start">
                    {/* Menggunakan Next.js Link dengan rute /playlists/[id] */}
                    <Link href={`/playlists/${playlist.id}`} className="hover:text-primary transition-colors">
                      {playlist.name}
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (window.confirm(`Hapus playlist "${playlist.name}" secara permanen?`)) {
                          deletePlaylist(playlist.id);
                        }
                      }}
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