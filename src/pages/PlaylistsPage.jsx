import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ListMusic, Plus, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePlaylistManager } from '@/hooks/usePlaylistManager.js';

const PlaylistsPage = () => {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylistManager();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Playlists - Chord Tempo</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">My Playlists</h1>
            <p className="text-muted-foreground">Manage your practice sets and setlists.</p>
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
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <Input
                  placeholder="Playlist Name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={!newPlaylistName.trim()}>Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No playlists yet</h3>
            <p className="text-muted-foreground mb-6">Create a playlist to organize your practice sessions.</p>
            <Button onClick={() => setIsDialogOpen(true)}>Create your first playlist</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(playlist => (
              <Card key={playlist.id} className="bg-card hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex justify-between items-start">
                    <Link to={`/playlist/${playlist.id}`} className="hover:text-primary transition-colors">
                      {playlist.name}
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (window.confirm('Delete this playlist?')) {
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
                    {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="secondary" className="flex-1">
                      <Link to={`/playlist/${playlist.id}`}>View Details</Link>
                    </Button>
                    <Button asChild className="flex-1" disabled={playlist.songs.length === 0}>
                      <Link to={`/playlist/${playlist.id}/play`}>
                        <Play className="w-4 h-4 mr-2" /> Play
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PlaylistsPage;