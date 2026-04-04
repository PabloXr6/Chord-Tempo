import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { ArrowLeft, Play, Trash2, Settings2, Music2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlaylistManager } from '@/hooks/usePlaylistManager.js';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPlaylistById, removeSongFromPlaylist, deletePlaylist } = usePlaylistManager();
  
  const [playlist, setPlaylist] = useState(null);
  const [songsData, setSongsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getPlaylistById(id);
    if (p) {
      setPlaylist(p);
      fetchSongsData(p.songs);
    } else {
      setLoading(false);
    }
  }, [id, getPlaylistById]);

  const fetchSongsData = async (playlistSongs) => {
    try {
      const data = {};
      for (const item of playlistSongs) {
        if (!data[item.songId]) {
          const song = await pb.collection('songs').getOne(item.songId, { $autoCancel: false });
          data[item.songId] = song;
        }
      }
      setSongsData(data);
    } catch (error) {
      console.error('Failed to fetch songs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = () => {
    if (window.confirm('Are you sure you want to delete this entire playlist?')) {
      deletePlaylist(id);
      navigate('/playlists');
    }
  };

  if (loading) {
    return <div className="p-12 text-center"><Skeleton className="h-12 w-64 mx-auto mb-8" /></div>;
  }

  if (!playlist) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
        <Button asChild><Link to="/playlists">Back to Playlists</Link></Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{playlist.name} - Chord Tempo</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" asChild className="mb-8 text-muted-foreground">
          <Link to="/playlists"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Playlists</Link>
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{playlist.name}</h1>
            <p className="text-muted-foreground">{playlist.songs.length} songs</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDeletePlaylist}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Playlist
            </Button>
            <Button asChild disabled={playlist.songs.length === 0}>
              <Link to={`/playlist/${playlist.id}/play`}>
                <Play className="w-4 h-4 mr-2" /> Play All
              </Link>
            </Button>
          </div>
        </div>

        {playlist.songs.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Playlist is empty</h3>
            <p className="text-muted-foreground mb-6">Add songs from the library to get started.</p>
            <Button asChild variant="outline"><Link to="/songs">Browse Songs</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {playlist.songs.map((item, index) => {
              const song = songsData[item.songId];
              if (!song) return null;

              return (
                <Card key={`${item.songId}-${index}`} className="bg-card border-border">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 text-center text-muted-foreground font-medium">{index + 1}</div>
                      <div>
                        <h3 className="font-bold text-lg">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-primary">
                          <Clock className="w-4 h-4" />
                          <span>{item.customBPM || song.defaultBPM} BPM</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-accent">
                          <Music2 className="w-4 h-4" />
                          <span>{item.customTimeSignature || song.timeSignature}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/song/${song.id}`}><Play className="w-4 h-4" /></Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeSongFromPlaylist(playlist.id, item.songId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default PlaylistDetail;