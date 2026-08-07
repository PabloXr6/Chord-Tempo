"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { deleteSong } from '@/lib/SongUtils';
import { ArrowLeft, Edit, ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminSongsClient({ initialSongs }) {
  // Gunakan data dari server sebagai state awal (Instan!)
  const [songs, setSongs] = useState(initialSongs);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin hapus lagu "${title}"?`)) return;

    try {
      await deleteSong(id); 
      // Update state lokal secara instan
      setSongs(prev => prev.filter(s => s.id !== id));
      toast.success('Lagu berhasil dihapus!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus lagu');
    }
  };

  const filteredSongs = songs.filter(s => 
    (s.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (s.artist?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Manajemen Lagu</h1>
            <p className="text-muted-foreground">Total {songs.length} lagu terdaftar di database.</p>
          </div>
          
          <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20">
            <Link href="/admin/songs/new">
              <Plus className="w-5 h-5 mr-2" /> Tambah Lagu Baru
            </Link>
          </Button>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur">
          <CardHeader className="pb-0">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari lagu atau artis..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Judul & Artis</TableHead>
                    <TableHead className="hidden md:table-cell">Tempo</TableHead>
                    <TableHead className="hidden md:table-cell">Birama</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Kondisi loading dihapus karena data sudah instan dari server */}
                  {filteredSongs.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Tidak ada lagu ditemukan.</TableCell></TableRow>
                  ) : (
                    filteredSongs.map((song) => (
                      <TableRow key={song.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-bold">{song.title}</div>
                          <div className="text-xs text-muted-foreground">{song.artist}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {song.bpm} BPM
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs">
                          {song.time_signature}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild title="Lihat di Web">
                              <Link href={`/song/${song.slug}`} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild title="Edit Lagu">
                              <Link href={`/admin/songs/edit/${song.id}`}>
                                <Edit className="w-4 h-4 text-blue-500" />
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Hapus"
                              onClick={() => handleDelete(song.id, song.title)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}