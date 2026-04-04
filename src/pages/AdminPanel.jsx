import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Plus, Trash2, Edit, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import SongForm from '@/components/SongForm.jsx';
import ChordArticleForm from '@/components/ChordArticleForm.jsx';
import SoundLibraryManager from '@/components/SoundLibraryManager.jsx';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [songs, setSongs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const fetchSongs = async () => {
    try {
      const records = await pb.collection('songs').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setSongs(records);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const records = await pb.collection('chordArticles').getFullList({
        sort: '-created',
        expand: 'songId',
        $autoCancel: false
      });
      setArticles(records);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSongs();
      fetchArticles();
    }
  }, [isAuthenticated]);

  const handleDeleteSong = async (songId) => {
    if (!window.confirm('Delete this song? This will also delete related chord articles.')) return;
    try {
      await pb.collection('songs').delete(songId, { $autoCancel: false });
      toast.success('Song deleted');
      fetchSongs();
      fetchArticles();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Delete this chord article?')) return;
    try {
      await pb.collection('chordArticles').delete(articleId, { $autoCancel: false });
      toast.success('Article deleted');
      fetchArticles();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background border-border"
                  placeholder="Enter admin password"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Chord Tempo</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Admin Panel</h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>Logout</Button>
        </div>

        <Tabs defaultValue="songs" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="sounds">Sound Library</TabsTrigger>
            <TabsTrigger value="articles">Chord Articles</TabsTrigger>
          </TabsList>

          {/* Songs Tab */}
          <TabsContent value="songs">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Song Management</h2>
              <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingSong(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Song
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingSong ? 'Edit Song' : 'Add New Song'}</DialogTitle>
                  </DialogHeader>
                  <SongForm
                    song={editingSong}
                    onSuccess={() => {
                      setSongDialogOpen(false);
                      setEditingSong(null);
                      fetchSongs();
                    }}
                    onCancel={() => {
                      setSongDialogOpen(false);
                      setEditingSong(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {songs.map((song) => (
                <Card key={song.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditingSong(song); setSongDialogOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteSong(song.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sound Library Tab */}
          <TabsContent value="sounds">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-6">Sound Library</h2>
              <SoundLibraryManager />
            </div>
          </TabsContent>

          {/* Chord Articles Tab */}
          <TabsContent value="articles">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Chord Article Management</h2>
              <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingArticle(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>{editingArticle ? 'Edit Article' : 'Add New Article'}</DialogTitle>
                  </DialogHeader>
                  <ChordArticleForm
                    article={editingArticle}
                    onSuccess={() => {
                      setArticleDialogOpen(false);
                      setEditingArticle(null);
                      fetchArticles();
                    }}
                    onCancel={() => {
                      setArticleDialogOpen(false);
                      setEditingArticle(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {articles.map((article) => (
                <Card key={article.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-5 h-5 text-accent" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{article.expand?.songId?.title || 'Unknown Song'}</h3>
                          <p className="text-sm text-muted-foreground truncate">{article.expand?.songId?.artist || 'Unknown Artist'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditingArticle(article); setArticleDialogOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteArticle(article.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminPanel;