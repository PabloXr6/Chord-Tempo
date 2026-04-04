import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Plus, Music, Trash2, Edit, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header.jsx';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchPlaylists = async () => {
    try {
      const records = await pb.collection('playlists').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });

      // Fetch song counts for each playlist
      const playlistsWithCounts = await Promise.all(
        records.map(async (playlist) => {
          const items = await pb.collection('playlistItems').getFullList({
            filter: `playlistId = "${playlist.id}"`,
            $autoCancel: false
          });
          return { ...playlist, songCount: items.length };
        })
      );

      setPlaylists(playlistsWithCounts);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [currentUser]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await pb.collection('playlists').create({
        userId: currentUser.id,
        name: formData.name,
        description: formData.description
      }, { $autoCancel: false });

      toast({ title: 'Playlist created successfully' });
      setDialogOpen(false);
      setFormData({ name: '', description: '' });
      fetchPlaylists();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Delete this playlist? This action cannot be undone.')) {
      return;
    }

    try {
      await pb.collection('playlists').delete(playlistId, { $autoCancel: false });
      toast({ title: 'Playlist deleted' });
      fetchPlaylists();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Chord Tempo</title>
        <meta name="description" content="Manage your playlists and practice sessions" />
      </Helmet>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance" style={{ letterSpacing: '-0.02em' }}>
            Your Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, {currentUser?.name || currentUser?.email}
          </p>
        </div>

        {/* User Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <p className="text-base">{currentUser?.email}</p>
              </div>
              {currentUser?.name && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Name:</span>
                  <p className="text-base">{currentUser.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Playlists Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Playlists</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <div>
                  <Label htmlFor="name">Playlist Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Practice Playlist"
                    required
                    className="text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first playlist to start organizing your practice sessions
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Playlist
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="line-clamp-1">{playlist.name}</span>
                    <Music className="w-5 h-5 text-primary flex-shrink-0" />
                  </CardTitle>
                  {playlist.description && (
                    <CardDescription className="line-clamp-2">
                      {playlist.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4">
                    {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
                  </p>
                  <div className="mt-auto flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to={`/playlist/${playlist.id}`}>View</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeletePlaylist(playlist.id)}
                    >
                      <Trash2 className="w-4 h-4" />
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

export default UserDashboard;