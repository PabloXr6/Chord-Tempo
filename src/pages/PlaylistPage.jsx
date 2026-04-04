import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ListMusic, Plus, Play, Trash2, Edit2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist } from '@/lib/PlaylistUtils.js';
import { toast } from 'sonner';

const PlaylistPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    setPlaylists(getPlaylists());
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim());
    setPlaylists(getPlaylists());
    setCreateDialogOpen(false);
    setNewPlaylistName('');
    toast.success('Playlist created');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(id);
      setPlaylists(getPlaylists());
      toast.success('Playlist deleted');
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editingPlaylist) return;
    updatePlaylist(editingPlaylist.id, { name: editName.trim() });
    setPlaylists(getPlaylists());
    setEditDialogOpen(false);
    toast.success('Playlist renamed');
  };

  const filteredPlaylists = playlists.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>My Playlists - Chord Tempo</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">My Playlists</h1>
            <p className="text-muted-foreground">Create custom setlists with your own metronome settings.</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full">
                <Plus className="w-5 h-5 mr-2" /> Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Playlist Name</Label>
                  <Input 
                    autoFocus
                    value={newPlaylistName} 
                    onChange={(e) => setNewPlaylistName(e.target.value)} 
                    placeholder="e.g., Sunday Service, Practice Routine"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!newPlaylistName.trim()}>Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        {playlists.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
            <p className="text-muted-foreground mb-6">Create your first playlist to organize your songs.</p>
            <Button onClick={() => setCreateDialogOpen(true)}>Create Playlist</Button>
          </div>
        ) : filteredPlaylists.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No playlists match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaylists.map(playlist => (
              <Card key={playlist.id} className="bg-card border-border hover:border-primary/50 transition-colors group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Link to={`/playlists/${playlist.id}`} className="flex-1">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
                      </p>
                    </Link>
                    <div className="flex gap-1 ml-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingPlaylist(playlist);
                          setEditName(playlist.name);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(playlist.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button asChild variant="secondary" className="flex-1">
                      <Link to={`/playlists/${playlist.id}`}>View</Link>
                    </Button>
                    <Button asChild className="flex-1" disabled={playlist.songs.length === 0}>
                      <Link to={playlist.songs.length > 0 ? `/playlists/${playlist.id}/play` : '#'}>
                        <Play className="w-4 h-4 mr-2" /> Play
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Rename Playlist</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Playlist Name</Label>
                <Input 
                  autoFocus
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                />
              </div>
              <Button type="submit" className="w-full" disabled={!editName.trim()}>Save Changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default PlaylistPage;