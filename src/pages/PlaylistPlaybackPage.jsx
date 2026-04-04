import { Button } from '@/components/ui/button';
import { getPlaylistById } from '@/lib/PlaylistUtils.js';
import pb from '@/lib/pocketbaseClient';
import { ListMusic, SkipBack, SkipForward, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const PlaylistPlaybackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startIndex = parseInt(searchParams.get('start') || '0');

  const [playlist, setPlaylist] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [currentSongData, setCurrentSongData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Metronome State
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [volume, setVolume] = useState(80);
  const [subdivisions, setSubdivisions] = useState('1');
  const [accentEnabled, setAccentEnabled] = useState(true);
  const [visualEffects, setVisualEffects] = useState({ flash: true, pulse: true, indicator: true });
  
  const [soundUrls, setSoundUrls] = useState({ downbeat: null, regular: null, subdivision: null });

  useEffect(() => {
    const data = getPlaylistById(id);
    if (!data || data.songs.length === 0) {
      toast.error('Playlist is empty or not found');
      navigate('/playlists');
      return;
    }
    setPlaylist(data);
    setCurrentIndex(Math.min(Math.max(0, startIndex), data.songs.length - 1));
  }, [id, navigate, startIndex]);

  useEffect(() => {
    if (!playlist) return;

    const loadCurrentSong = async () => {
      setLoading(true);
      try {
        const playlistItem = playlist.songs[currentIndex];
        
        // Fetch full song data and preset
        const [songRecord, presetRecords] = await Promise.all([
          pb.collection('songs').getOne(playlistItem.songId, { $autoCancel: false }),
          pb.collection('metronomePresets').getList(1, 1, {
            filter: `songId="${playlistItem.songId}"`,
            expand: 'downbeatSoundId,regularBeatSoundId,subdivisionSoundId',
            $autoCancel: false
          })
        ]);

        setCurrentSongData(songRecord);

        // Determine settings: Playlist Custom > Preset > Song Default
        let finalBpm = playlistItem.customBPM;
        let finalTimeSig = playlistItem.customTimeSignature;
        let finalVol = 80;
        let finalSub = '1';
        let urls = { downbeat: null, regular: null, subdivision: null };

        if (presetRecords.items.length > 0) {
          const preset = presetRecords.items[0];
          if (!finalBpm) finalBpm = preset.defaultBPM;
          if (!finalTimeSig) finalTimeSig = preset.defaultTimeSignature;
          finalVol = preset.defaultVolume || 80;
          finalSub = preset.defaultSubdivisions || '1';

          if (preset.expand?.downbeatSoundId) urls.downbeat = pb.files.getUrl(preset.expand.downbeatSoundId, preset.expand.downbeatSoundId.file);
          if (preset.expand?.regularBeatSoundId) urls.regular = pb.files.getUrl(preset.expand.regularBeatSoundId, preset.expand.regularBeatSoundId.file);
          if (preset.expand?.subdivisionSoundId) urls.subdivision = pb.files.getUrl(preset.expand.subdivisionSoundId, preset.expand.subdivisionSoundId.file);
        } else {
          if (!finalBpm) finalBpm = songRecord.defaultBPM;
          if (!finalTimeSig) finalTimeSig = songRecord.timeSignature;
        }

        setBpm(finalBpm);
        setTimeSignature(finalTimeSig);
        setVolume(finalVol);
        setSubdivisions(finalSub);
        setSoundUrls(urls);

      } catch (error) {
        console.error('Failed to load song data:', error);
        toast.error('Failed to load song settings');
      } finally {
        setLoading(false);
      }
    };

    loadCurrentSong();
  }, [playlist, currentIndex]);

  const handleNext = () => {
    if (currentIndex < playlist.songs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!playlist || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentPlaylistItem = playlist.songs[currentIndex];
  const nextPlaylistItem = currentIndex < playlist.songs.length - 1 ? playlist.songs[currentIndex + 1] : null;

  return (
    <>
      <Helmet>
        <title>Playing: {playlist.name} | Chord Tempo</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Bar */}
        <div className="p-4 flex items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/playlists/${id}`)}>
              <X className="w-6 h-6" />
            </Button>
            <div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                <ListMusic className="w-3 h-3" /> {playlist.name}
              </div>
              <div className="text-sm font-medium">
                Song {currentIndex + 1} of {playlist.songs.length}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex === playlist.songs.length - 1}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-3xl mx-auto w-full">
          
          <div className="text-center mb-10 w-full">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 text-balance">
              {currentPlaylistItem.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              {currentPlaylistItem.artist}
            </p>
          </div>

          <div className="w-full mb-12">
            <MetronomeEngine
              bpm={bpm}
              timeSignature={timeSignature}
              volume={volume}
              subdivisions={subdivisions}
              accentEnabled={accentEnabled}
              visualEffects={visualEffects}
              downbeatSoundUrl={soundUrls.downbeat}
              regularBeatSoundUrl={soundUrls.regular}
              subdivisionSoundUrl={soundUrls.subdivision}
              onBpmChange={setBpm}
              onTimeSignatureChange={setTimeSignature}
              onVolumeChange={setVolume}
              onSubdivisionsChange={setSubdivisions}
              onAccentChange={setAccentEnabled}
              onVisualEffectsChange={setVisualEffects}
            />
          </div>

          {/* Up Next */}
          {nextPlaylistItem && (
            <div className="w-full max-w-md bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors" onClick={handleNext}>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Up Next</div>
                <div className="font-bold">{nextPlaylistItem.title}</div>
                <div className="text-sm text-muted-foreground">{nextPlaylistItem.artist}</div>
              </div>
              <SkipForward className="w-5 h-5 text-muted-foreground" />
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default PlaylistPlaybackPage;