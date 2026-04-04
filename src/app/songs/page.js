"use client";

import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlaylistManager } from '@/hooks/usePlaylistManager.js';
import { createClient } from '@/utils/supabase/client';
import { Music2, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export const metadata = {
  title: 'Songs - Chord Tempo',
  description: 'Browse and search through our collection of songs with chords'
};

const SongListPage = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('created_at');

  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylistManager();
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const supabase = createClient();

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('songs')
        .select('*')
        .limit(50);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order(sortBy, { ascending: sortBy === 'created_at' });

      if (error) {
        console.error('Failed to fetch songs:', error);
        return;
      }

      setSongs(data || []);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, supabase]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    try {
      const newPlaylist = await createPlaylist(newPlaylistName);
      if (selectedSongForPlaylist) {
        await addSongToPlaylist(newPlaylist.id, selectedSongForPlaylist.id);
        toast.success(`Created playlist "${newPlaylistName}" and added song`);
      } else {
        toast.success(`Created playlist "${newPlaylistName}"`);
      }
      setNewPlaylistName('');
      setPlaylistModalOpen(false);
      setSelectedSongForPlaylist(null);
    } catch (error) {
      toast.error('Failed to create playlist');
    }
  };

  const handleAddToExistingPlaylist = async (playlistId) => {
    if (!selectedSongForPlaylist) return;

    try {
      await addSongToPlaylist(playlistId, selectedSongForPlaylist.id);
      toast.success('Song added to playlist');
      setPlaylistModalOpen(false);
      setSelectedSongForPlaylist(null);
    } catch (error) {
      toast.error('Failed to add song to playlist');
    }
  };

  const openPlaylistModal = (song) => {
    setSelectedSongForPlaylist(song);
    setPlaylistModalOpen(true);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Songs</h1>
            <p className="text-muted-foreground">Browse our collection of songs with chords</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search songs by title or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="artist">Artist A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Songs Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map(song => (
                <Card key={song.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{song.title}</h3>
                        <p className="text-muted-foreground text-sm">{song.artist}</p>
                      </div>
                      <Music2 className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/song/${song.slug}`}>
                          View Chords
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPlaylistModal(song)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {songs.length === 0 && !loading && (
            <div className="text-center py-12">
              <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No songs found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new songs'}
              </p>
            </div>
          )}

          {/* Playlist Modal */}
          <Dialog open={playlistModalOpen} onOpenChange={setPlaylistModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Create New Playlist</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Playlist name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                    />
                    <Button onClick={handleCreatePlaylist}>
                      Create
                    </Button>
                  </div>
                </div>

                {playlists.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Add to Existing Playlist</label>
                    <div className="space-y-2 mt-2">
                      {playlists.map(playlist => (
                        <Button
                          key={playlist.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleAddToExistingPlaylist(playlist.id)}
                        >
                          {playlist.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default SongListPage;