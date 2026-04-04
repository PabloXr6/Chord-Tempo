"use client";
import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const MetronomePresetTab = ({ selectedSongId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sounds, setSounds] = useState([]);
  
  const [form, setForm] = useState({
    defaultBPM: 120,
    defaultTimeSignature: '4/4',
    defaultVolume: 80,
    defaultSubdivisions: 'off',
    accentPattern: '1,0,0,0',
    downbeatSoundId: '',
    regularBeatSoundId: '',
    subdivisionSoundId: ''
  });

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const soundsData = await pb.collection('soundLibrary').getFullList({ sort: 'name', $autoCancel: false });
        setSounds(soundsData);
      } catch (error) {
        console.error('Failed to fetch sounds:', error);
      }
    };
    fetchSounds();
  }, []);

  useEffect(() => {
    if (!selectedSongId) return;

    const loadPresetData = async () => {
      setLoading(true);
      try {
        // Check if preset already exists
        const preset = await pb.collection('metronomePresets').getFirstListItem(`songId = "${selectedSongId}"`, { $autoCancel: false });
        
        setForm({
          defaultBPM: preset.defaultBPM,
          defaultTimeSignature: preset.defaultTimeSignature,
          defaultVolume: preset.defaultVolume ?? 80,
          defaultSubdivisions: preset.defaultSubdivisions || 'off',
          accentPattern: preset.accentPattern || '',
          downbeatSoundId: preset.downbeatSoundId || '',
          regularBeatSoundId: preset.regularBeatSoundId || '',
          subdivisionSoundId: preset.subdivisionSoundId || ''
        });
      } catch (err) {
        // If no preset exists, try to load defaults from the song itself
        try {
          const song = await pb.collection('songs').getOne(selectedSongId, { $autoCancel: false });
          setForm({
            defaultBPM: song.defaultBPM || 120,
            defaultTimeSignature: song.timeSignature || '4/4',
            defaultVolume: 80,
            defaultSubdivisions: 'off',
            accentPattern: '1,0,0,0',
            downbeatSoundId: '',
            regularBeatSoundId: '',
            subdivisionSoundId: ''
          });
        } catch (songErr) {
          console.error('Failed to load song defaults:', songErr);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPresetData();
  }, [selectedSongId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate songId
    if (!selectedSongId) {
      toast.error('Please select a song first');
      return;
    }

    // 2. Validate defaultBPM
    const bpm = parseInt(form.defaultBPM, 10);
    if (isNaN(bpm) || bpm < 30 || bpm > 300) {
      toast.error('BPM must be between 30-300');
      return;
    }

    // 3. Validate defaultTimeSignature
    const validTimeSignatures = ['2/4', '3/4', '4/4', '6/8', '12/8'];
    if (!validTimeSignatures.includes(form.defaultTimeSignature)) {
      toast.error('Invalid time signature');
      return;
    }

    // 4. Validate defaultVolume
    const volume = parseInt(form.defaultVolume, 10);
    if (isNaN(volume) || volume < 0 || volume > 100) {
      toast.error('Volume must be between 0-100');
      return;
    }

    // 5. Validate defaultSubdivisions
    const validSubdivisions = ['off', '8th', '16th', 'triplet'];
    if (!validSubdivisions.includes(form.defaultSubdivisions)) {
      toast.error('Invalid subdivisions');
      return;
    }

    // 6. Validate accentPattern
    if (form.accentPattern && !/^\d+(,\d+)*$/.test(form.accentPattern)) {
      toast.error('Accent pattern must be comma-separated numbers (e.g., 1,0,0,0)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        songId: selectedSongId,
        defaultBPM: bpm,
        defaultTimeSignature: form.defaultTimeSignature,
        defaultVolume: volume,
        defaultSubdivisions: form.defaultSubdivisions,
        accentPattern: form.accentPattern,
        downbeatSoundId: form.downbeatSoundId || null,
        regularBeatSoundId: form.regularBeatSoundId || null,
        subdivisionSoundId: form.subdivisionSoundId || null
      };

      let existingId = null;
      try {
        const existing = await pb.collection('metronomePresets').getFirstListItem(`songId = "${selectedSongId}"`, { $autoCancel: false });
        existingId = existing.id;
      } catch (err) {
        // Record doesn't exist, will create new
      }

      if (existingId) {
        await pb.collection('metronomePresets').update(existingId, payload, { $autoCancel: false });
        toast.success('Preset updated successfully');
      } else {
        await pb.collection('metronomePresets').create(payload, { $autoCancel: false });
        toast.success('Preset created successfully');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save preset');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Settings */}
        <div className="space-y-6">
          <div className="border-b border-border pb-2">
            <h4 className="font-semibold text-primary">Basic Settings</h4>
          </div>
          
          <div className="space-y-3">
            <Label>Default BPM</Label>
            <Input 
              type="number" 
              required 
              min="30" 
              max="300" 
              value={form.defaultBPM} 
              onChange={e => setForm({...form, defaultBPM: e.target.value})} 
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">Must be between 30 and 300</p>
          </div>

          <div className="space-y-3">
            <Label>Time Signature</Label>
            <Select value={form.defaultTimeSignature} onValueChange={v => setForm({...form, defaultTimeSignature: v})}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['2/4', '3/4', '4/4', '6/8', '12/8'].map(ts => <SelectItem key={ts} value={ts}>{ts}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Subdivisions</Label>
            <Select value={form.defaultSubdivisions} onValueChange={v => setForm({...form, defaultSubdivisions: v})}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="8th">8th</SelectItem>
                <SelectItem value="16th">16th</SelectItem>
                <SelectItem value="triplet">Triplet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Accent Pattern</Label>
            <Input 
              value={form.accentPattern} 
              onChange={e => setForm({...form, accentPattern: e.target.value})} 
              placeholder="1,0,0,0" 
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">Comma-separated numbers (e.g., 1,0,0,0)</p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <Label>Default Volume</Label>
              <span className="text-sm font-medium text-primary">{form.defaultVolume}%</span>
            </div>
            <Slider 
              value={[parseInt(form.defaultVolume) || 0]} 
              onValueChange={v => setForm({...form, defaultVolume: v[0]})} 
              max={100} 
              step={1} 
            />
          </div>
        </div>

        {/* Sound Selection */}
        <div className="space-y-6">
          <div className="border-b border-border pb-2">
            <h4 className="font-semibold text-primary">Custom Sounds</h4>
          </div>

          <div className="space-y-3">
            <Label>Downbeat Sound</Label>
            <Select value={form.downbeatSoundId || 'none'} onValueChange={v => setForm({...form, downbeatSoundId: v === 'none' ? '' : v})}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Default Beep" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default Beep</SelectItem>
                {sounds.filter(s => s.soundType === 'downbeat' || s.soundType === 'regular').map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Regular Beat Sound</Label>
            <Select value={form.regularBeatSoundId || 'none'} onValueChange={v => setForm({...form, regularBeatSoundId: v === 'none' ? '' : v})}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Default Beep" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default Beep</SelectItem>
                {sounds.filter(s => s.soundType === 'regular').map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Subdivision Sound</Label>
            <Select value={form.subdivisionSoundId || 'none'} onValueChange={v => setForm({...form, subdivisionSoundId: v === 'none' ? '' : v})}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Default Beep" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default Beep</SelectItem>
                {sounds.filter(s => s.soundType === 'subdivision' || s.soundType === 'regular').map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-border flex justify-end">
        <Button type="submit" disabled={saving || !selectedSongId} className="w-full md:w-auto min-w-[200px]">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preset
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default MetronomePresetTab;