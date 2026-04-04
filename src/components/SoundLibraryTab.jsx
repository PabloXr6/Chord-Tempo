"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import pb from '@/lib/pocketbaseClient';
import { FileAudio, Music, Play, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const SoundLibraryTab = () => {
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(new Audio());

  const [newSound, setNewSound] = useState({
    name: '',
    soundType: 'regular',
    file: null
  });

  const fetchSounds = async () => {
    try {
      const records = await pb.collection('soundLibrary').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setSounds(records);
    } catch (error) {
      console.error('Failed to fetch sounds:', error);
      toast.error('Failed to load sound library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSounds();
    const currentAudio = audioRef.current;
    return () => {
      currentAudio.pause();
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'audio/mpeg') {
      toast.error('Only MP3 files are allowed');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      e.target.value = '';
      return;
    }

    setNewSound({ ...newSound, file });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newSound.file || !newSound.name) {
      toast.error('Please provide a name and select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', newSound.name);
      formData.append('soundType', newSound.soundType);
      formData.append('file', newSound.file);

      await pb.collection('soundLibrary').create(formData, { $autoCancel: false });
      toast.success('Sound uploaded successfully');
      setNewSound({ name: '', soundType: 'regular', file: null });
      
      // Reset file input
      const fileInput = document.getElementById('sound-file');
      if (fileInput) fileInput.value = '';
      
      fetchSounds();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload sound');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sound?')) return;
    try {
      await pb.collection('soundLibrary').delete(id, { $autoCancel: false });
      toast.success('Sound deleted');
      fetchSounds();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete sound');
    }
  };

  const playPreview = (sound) => {
    const url = pb.files.getUrl(sound, sound.file);
    if (playingId === sound.id) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingId(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.play();
      setPlayingId(sound.id);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Upload New Sound
          </h3>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="sound-name">Sound Name</Label>
              <Input 
                id="sound-name" 
                value={newSound.name} 
                onChange={(e) => setNewSound({...newSound, name: e.target.value})} 
                placeholder="e.g., Woodblock High"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sound-type">Type</Label>
              <Select value={newSound.soundType} onValueChange={(v) => setNewSound({...newSound, soundType: v})}>
                <SelectTrigger id="sound-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downbeat">Downbeat</SelectItem>
                  <SelectItem value="regular">Regular Beat</SelectItem>
                  <SelectItem value="subdivision">Subdivision</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sound-file">MP3 File (Max 5MB)</Label>
              <Input 
                id="sound-file" 
                type="file" 
                accept="audio/mpeg" 
                onChange={handleFileChange}
                required
                className="cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-medium"
              />
            </div>
            <Button type="submit" disabled={uploading || !newSound.file} className="w-full">
              {uploading ? 'Uploading...' : 'Upload Sound'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileAudio className="w-5 h-5 text-primary" /> Available Sounds
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading sounds...</div>
        ) : sounds.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No sounds uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sounds.map(sound => (
              <Card key={sound.id} className="bg-card border-border overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Button 
                      variant={playingId === sound.id ? "default" : "secondary"} 
                      size="icon" 
                      className="shrink-0 rounded-full"
                      onClick={() => playPreview(sound)}
                    >
                      <Play className={`w-4 h-4 ${playingId === sound.id ? 'animate-pulse' : ''}`} />
                    </Button>
                    <div className="truncate">
                      <h4 className="font-bold truncate">{sound.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{sound.soundType}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => handleDelete(sound.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundLibraryTab;