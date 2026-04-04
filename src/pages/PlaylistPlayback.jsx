import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { ArrowLeft, SkipForward, SkipBack, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MetronomePlayer from '@/components/MetronomePlayer.jsx';
import { usePlaylistManager } from '@/hooks/usePlaylistManager.js';

const PlaylistPlayback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPlaylistById } = usePlaylistManager();
  
  const [playlist, setPlaylist] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSongData, setCurrentSongData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getPlaylistById(id);
    if (p && p.songs.length > 0) {
      setPlaylist(p);
      fetchSongData(p.songs[0].songId);
    } else {
      navigate(`/playlist/${id}`);
    }
  }, [id, getPlaylistById, navigate]);

  const fetchSongData = async (songId) => {
    setLoading(true);
    try {
      const song = await pb.collection('songs').getOne(songId, { 
        expand: 'downbeatSoundId,regularBeatSoundId,subdivisionSoundId',
        $autoCancel: false 
      });
      setCurrentSongData(song);
    } catch (error) {
      console.error('Failed to fetch song:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (playlist && currentIndex < playlist.songs.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      fetchSongData(playlist.songs[nextIndex].songId);
    }
  };

  const handlePrev = () => {
    if (playlist && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      fetchSongData(playlist.songs[prevIndex].songId);
    }
  };

  if (loading || !playlist || !currentSongData) {
    return <div className="p-12 text-center"><Skeleton className="h-96 w-full max-w-md mx-auto" /></div>;
  }

  const currentPlaylistItem = playlist.songs[currentIndex];
  const bpm = currentPlaylistItem.customBPM || currentSongData.defaultBPM;
  const timeSignature = currentPlaylistItem.customTimeSignature || currentSongData.timeSignature;

  const getSoundUrl = (record, field) => {
    if (!record || !record[field]) return null;
    return pb.files.getUrl(record, record[field]);
  };

  return (
    <>
      <Helmet>
        <title>Playing: {playlist.name} - Chord Tempo</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate(`/playlist/${id}`)} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit Playback
          </Button>
          <div className="text-sm font-medium text-muted-foreground">
            Song {currentIndex + 1} of {playlist.songs.length}
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Now Playing</h2>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">{currentSongData.title}</h1>
          <p className="text-xl text-muted-foreground">{currentSongData.artist}</p>
        </div>

        <div className="mb-12">
          <MetronomePlayer
            defaultBPM={bpm}
            defaultTimeSignature={timeSignature}
            downbeatSound={getSoundUrl(currentSongData.expand?.downbeatSoundId, 'file')}
            regularBeatSound={getSoundUrl(currentSongData.expand?.regularBeatSoundId, 'file')}
            subdivisionSound={getSoundUrl(currentSongData.expand?.subdivisionSoundId, 'file')}
          />
        </div>

        <div className="flex justify-center items-center gap-6">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className="h-14 px-8 rounded-full"
          >
            <SkipBack className="w-5 h-5 mr-2" /> Previous
          </Button>
          
          <Button 
            variant="default" 
            size="lg" 
            onClick={handleNext} 
            disabled={currentIndex === playlist.songs.length - 1}
            className="h-14 px-8 rounded-full"
          >
            Next <SkipForward className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default PlaylistPlayback;