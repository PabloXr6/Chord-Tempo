"use client";
import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { FileAudio, Trash2, Play, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const SoundLibraryManager = () => {
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
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
      toast.error('Failed to load sounds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSounds();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select an audio file');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('soundType', formData.soundType);
      data.append('file', formData.file);

      await pb.collection('soundLibrary').create(data, { $autoCancel: false });
      toast.success('Sound uploaded successfully');
      setFormData({ name: '', soundType: 'regular', file: null });
      // Reset file input
      document.getElementById('soundFile').value = '';
      fetchSounds();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sound?')) return;
    try {
      await pb.collection('soundLibrary').delete(id, { $autoCancel: false });
      toast.success('Sound deleted');
      fetchSounds();
    } catch (error) {
      toast.error('Failed to delete sound');
    }
  };

  const playPreview = (record) => {
    const url = pb.files.getUrl(record, record.file);
    const audio = new Audio(url);
    audio.play().catch(e => toast.error('Could not play preview'));
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" /> Upload New Sound
          </h3>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="soundName">Name</Label>
              <Input 
                id="soundName" 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soundType">Type</Label>
              <Select value={formData.soundType} onValueChange={(v) => setFormData({...formData, soundType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="downbeat">Downbeat</SelectItem>
                  <SelectItem value="regular">Regular Beat</SelectItem>
                  <SelectItem value="subdivision">Subdivision</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="soundFile">Audio File (MP3/WAV)</Label>
              <Input 
                id="soundFile" 
                type="file" 
                accept="audio/mpeg,audio/wav,audio/ogg" 
                required 
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})} 
              />
            </div>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <p className="text-muted-foreground">Loading sounds...</p>
        ) : sounds.length === 0 ? (
          <p className="text-muted-foreground">No sounds uploaded yet.</p>
        ) : (
          sounds.map(sound => (
            <Card key={sound.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileAudio className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">{sound.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{sound.soundType}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => playPreview(sound)}>
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(sound.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SoundLibraryManager;