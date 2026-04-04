import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Play, Trash2, Clock, Music2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPlaylistById, removeSongFromPlaylist, deletePlaylist } from '@/lib/PlaylistUtils.js';
import { toast } from 'sonner';

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    const data = getPlaylistById(id);
    if (data) {
      setPlaylist(data);
    } else {
      toast.error('Playlist not found');
      navigate('/playlists');
    }
  }, [id, navigate]);

  const handleRemoveSong = (playlistItemId) => {
    removeSongFromPlaylist(id, playlistItemId);
    setPlaylist(getPlaylistById(id));
    toast.success('Song removed from playlist');
  };

  const handleDeletePlaylist = () => {
    if (window.confirm('Are you sure you want to delete this entire playlist?')) {
      deletePlaylist(id);
      toast.success('Playlist deleted');
      navigate('/playlists');
    }
  };

  if (!playlist) return null;

  return (
    <>
      <Helmet>
        <title>{`${playlist.name} - Playlist | Chord Tempo`}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" asChild className="mb-6 text-muted-foreground hover:text-foreground">
          <Link to="/playlists"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Playlists</Link>
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{playlist.name}</h1>
            <p className="text-muted-foreground text-lg">
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeletePlaylist}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
            <Button asChild size="lg" disabled={playlist.songs.length === 0} className="flex-1 md:flex-none">
              <Link to={playlist.songs.length > 0 ? `/playlists/${playlist.id}/play` : '#'}>
                <Play className="w-5 h-5 mr-2" /> Play All
              </Link>
            </Button>
          </div>
        </div>

        {playlist.songs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Playlist is empty</h3>
            <p className="text-muted-foreground mb-6">Browse songs and add them to this playlist.</p>
            <Button asChild><Link to="/">Browse Songs</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {playlist.songs.map((song, index) => (
              <Card key={song.playlistItemId} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-muted-foreground font-medium w-6 text-center">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link to={`/lagu/${song.slug}`} className="hover:underline">
                      <h3 className="font-bold text-lg truncate">{song.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>

                  <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground mr-4">
                    {song.customBPM && (
                      <div className="flex items-center gap-1.5" title="Custom BPM">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">{song.customBPM}</span>
                      </div>
                    )}
                    {song.customTimeSignature && (
                      <div className="flex items-center gap-1.5" title="Custom Time Signature">
                        <Music2 className="w-4 h-4 text-secondary" />
                        <span className="text-secondary font-medium">{song.customTimeSignature}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="secondary" size="icon" className="rounded-full">
                      <Link to={`/playlists/${playlist.id}/play?start=${index}`}>
                        <Play className="w-4 h-4 ml-0.5" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveSong(song.playlistItemId)}
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

export default PlaylistDetailPage;