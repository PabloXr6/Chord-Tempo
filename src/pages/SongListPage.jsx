import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Search, Music2, Clock, SlidersHorizontal, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePlaylistManager } from '@/hooks/usePlaylistManager.js';
import { toast } from 'sonner';

const SongListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('-created');

  const { playlists, createPlaylist, addSongToPlaylist } = usePlaylistManager();
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        let filterStr = '';
        if (searchQuery) {
          filterStr = `title ~ "${searchQuery}" || artist ~ "${searchQuery}"`;
        }

        const records = await pb.collection('songs').getList(1, 50, {
          sort: sortBy,
          filter: filterStr,
          $autoCancel: false
        });
        setSongs(records.items);
      } catch (error) {
        console.error('Failed to fetch songs:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSongs();
      if (searchQuery) {
        setSearchParams({ q: searchQuery });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, sortBy, setSearchParams]);

  const handleAddToPlaylist = (playlistId) => {
    if (selectedSongForPlaylist) {
      addSongToPlaylist(playlistId, selectedSongForPlaylist.id, selectedSongForPlaylist.defaultBPM, selectedSongForPlaylist.timeSignature);
      toast.success('Added to playlist');
      setPlaylistModalOpen(false);
    }
  };

  const handleCreateAndAdd = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim() && selectedSongForPlaylist) {
      const newPlaylist = createPlaylist(newPlaylistName.trim());
      addSongToPlaylist(newPlaylist.id, selectedSongForPlaylist.id, selectedSongForPlaylist.defaultBPM, selectedSongForPlaylist.timeSignature);
      toast.success('Playlist created and song added');
      setNewPlaylistName('');
      setPlaylistModalOpen(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Daftar Isi - Chord Tempo</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Daftar Isi</h1>
          <p className="text-lg text-muted-foreground">Browse and search our complete song library.</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card border-border text-lg"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 bg-card border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created">Newest Added</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="-title">Title (Z-A)</SelectItem>
                <SelectItem value="-defaultBPM">Highest BPM</SelectItem>
                <SelectItem value="defaultBPM">Lowest BPM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No songs found</h3>
            <p className="text-muted-foreground mb-6">We couldn't find any songs matching your search.</p>
            <Button asChild variant="outline">
              <Link to="/request-chord">Request a Song</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {songs.map((song) => (
              <Card key={song.id} className="bg-card hover:bg-secondary/50 border-border transition-colors group">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Link to={`/song/${song.id}`} className="flex-1">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{song.title}</h3>
                    <p className="text-muted-foreground">{song.artist}</p>
                  </Link>
                  <div className="flex items-center gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="w-4 h-4" />
                      <span>{song.defaultBPM} BPM</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent">
                      <Music2 className="w-4 h-4" />
                      <span>{song.timeSignature}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSongForPlaylist(song);
                        setPlaylistModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Playlist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Playlist Modal */}
        <Dialog open={playlistModalOpen} onOpenChange={setPlaylistModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {playlists.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Existing Playlists</p>
                  {playlists.map(p => (
                    <Button 
                      key={p.id} 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleAddToPlaylist(p.id)}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              )}
              
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Create New Playlist</p>
                <form onSubmit={handleCreateAndAdd} className="flex gap-2">
                  <Input 
                    placeholder="Playlist name..." 
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                  />
                  <Button type="submit" disabled={!newPlaylistName.trim()}>Create</Button>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default SongListPage;