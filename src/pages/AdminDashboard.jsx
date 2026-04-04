import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Plus, Trash2, Edit, Music, Settings2, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Tab 1: Lagu State
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [songForm, setSongForm] = useState({
    title: '', artist: '', slug: '', status: 'publish'
  });
  const [savingSong, setSavingSong] = useState(false);

  // Tab 2: Chord State
  const [chordDialogOpen, setChordDialogOpen] = useState(false);
  const [selectedChordSong, setSelectedChordSong] = useState(null);
  const [chordForm, setChordForm] = useState({ id: null, content: '' });
  const [savingChord, setSavingChord] = useState(false);

  // Tab 3: Preset State
  const [selectedPresetSongId, setSelectedPresetSongId] = useState('');
  const [presetForm, setPresetForm] = useState({
    id: null,
    defaultBPM: 120,
    defaultTimeSignature: '4/4',
    defaultVolume: 80,
    defaultSubdivisions: 'off',
    accentPattern: '1,0,0,0'
  });
  const [savingPreset, setSavingPreset] = useState(false);
  const [loadingPreset, setLoadingPreset] = useState(false);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const songsData = await pb.collection('songs').getFullList({ sort: '-created', $autoCancel: false });
      setSongs(songsData);
      
      // Validate if selected preset song still exists
      if (selectedPresetSongId && !songsData.find(s => s.id === selectedPresetSongId)) {
        setSelectedPresetSongId('');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // --- TAB 1: LAGU ACTIONS ---
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setSongForm(prev => {
      const newState = { ...prev, title };
      if (!editingSong) {
        newState.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return newState;
    });
  };

  const handleArtistChange = (e) => setSongForm(prev => ({ ...prev, artist: e.target.value }));
  const handleSlugChange = (e) => setSongForm(prev => ({ ...prev, slug: e.target.value }));
  const handleStatusChange = (value) => setSongForm(prev => ({ ...prev, status: value }));

  const handleSaveSong = async (e) => {
    e.preventDefault();
    
    if (!songForm.title.trim() || !songForm.artist.trim()) {
      toast.error('Title and Artist are required');
      return;
    }

    setSavingSong(true);
    try {
      const payload = {
        title: songForm.title,
        artist: songForm.artist,
        slug: songForm.slug,
        description: JSON.stringify({ status: songForm.status }),
        defaultBPM: 120,
        timeSignature: '4/4',
        chordContent: ''
      };

      if (editingSong) {
        const selectedSongId = editingSong.id;
        
        if (!selectedSongId) {
          toast.error('Invalid song ID');
          setSavingSong(false);
          return;
        }

        // Check if song exists before updating
        try {
          await pb.collection('songs').getOne(selectedSongId, { $autoCancel: false });
        } catch (err) {
          if (err.status === 404) {
            toast.error('Song not found. Please refresh and try again.');
            fetchSongs();
            setSongDialogOpen(false);
            setSavingSong(false);
            return;
          }
          throw err;
        }

        await pb.collection('songs').update(selectedSongId, payload, { $autoCancel: false });
        toast.success('Song updated successfully');
      } else {
        await pb.collection('songs').create(payload, { $autoCancel: false });
        toast.success('Song created successfully');
      }
      
      setSongDialogOpen(false);
      fetchSongs();
    } catch (error) {
      console.error('Save song error:', error);
      toast.error(error.message || 'Failed to save song');
    } finally {
      setSavingSong(false);
    }
  };

  const handleDeleteSong = async (id) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    
    try {
      // Check if song exists before deleting
      try {
        await pb.collection('songs').getOne(id, { $autoCancel: false });
      } catch (err) {
        if (err.status === 404) {
          toast.error('Song not found. It may have already been deleted.');
          fetchSongs();
          return;
        }
        throw err;
      }

      await pb.collection('songs').delete(id, { $autoCancel: false });
      toast.success('Song deleted successfully');
      
      if (selectedPresetSongId === id) {
        setSelectedPresetSongId('');
      }
      
      fetchSongs();
    } catch (error) {
      console.error('Delete song error:', error);
      toast.error(error.message || 'Failed to delete song');
    }
  };

  // --- TAB 2: CHORD ACTIONS ---
  const openChordDialog = async (song) => {
    setSelectedChordSong(song);
    try {
      const records = await pb.collection('chordArticles').getList(1, 1, { filter: `songId="${song.id}"`, $autoCancel: false });
      if (records.items.length > 0) {
        setChordForm({ id: records.items[0].id, content: records.items[0].content });
      } else {
        setChordForm({ id: null, content: '' });
      }
      setChordDialogOpen(true);
    } catch (e) {
      toast.error('Failed to load chord');
    }
  };

  const handleChordContentChange = (e) => setChordForm(prev => ({ ...prev, content: e.target.value }));

  const handleSaveChord = async (e) => {
    e.preventDefault();
    setSavingChord(true);
    try {
      const payload = { songId: selectedChordSong.id, content: chordForm.content };
      if (chordForm.id) {
        await pb.collection('chordArticles').update(chordForm.id, payload, { $autoCancel: false });
      } else {
        await pb.collection('chordArticles').create(payload, { $autoCancel: false });
      }
      toast.success('Chord saved successfully');
      setChordDialogOpen(false);
    } catch (e) {
      toast.error('Failed to save chord');
    } finally {
      setSavingChord(false);
    }
  };

  // --- TAB 3: PRESET ACTIONS ---
  useEffect(() => {
    if (!selectedPresetSongId) return;
    const loadPreset = async () => {
      setLoadingPreset(true);
      try {
        const preset = await pb.collection('metronomePresets').getFirstListItem(`songId="${selectedPresetSongId}"`, { $autoCancel: false });
        setPresetForm({
          id: preset.id,
          defaultBPM: preset.defaultBPM,
          defaultTimeSignature: preset.defaultTimeSignature,
          defaultVolume: preset.defaultVolume ?? 80,
          defaultSubdivisions: preset.defaultSubdivisions || 'off',
          accentPattern: preset.accentPattern || '1,0,0,0'
        });
      } catch (err) {
        setPresetForm({
          id: null,
          defaultBPM: 120,
          defaultTimeSignature: '4/4',
          defaultVolume: 80,
          defaultSubdivisions: 'off',
          accentPattern: '1,0,0,0'
        });
      } finally {
        setLoadingPreset(false);
      }
    };
    loadPreset();
  }, [selectedPresetSongId]);

  const handleBPMChange = (e) => setPresetForm(prev => ({ ...prev, defaultBPM: e.target.value }));
  const handleTimeSignatureChange = (value) => setPresetForm(prev => ({ ...prev, defaultTimeSignature: value }));
  const handleVolumeChange = (value) => setPresetForm(prev => ({ ...prev, defaultVolume: value[0] }));
  const handleSubdivisionsChange = (value) => setPresetForm(prev => ({ ...prev, defaultSubdivisions: value }));
  const handleAccentPatternChange = (e) => setPresetForm(prev => ({ ...prev, accentPattern: e.target.value }));

  const handleSavePreset = async (e) => {
    e.preventDefault();
    if (!selectedPresetSongId) {
      toast.error('Please select a song first');
      return;
    }

    const bpm = parseInt(presetForm.defaultBPM, 10);
    if (isNaN(bpm) || bpm < 30 || bpm > 300) {
      toast.error('BPM must be between 30-300');
      return;
    }

    setSavingPreset(true);
    try {
      const payload = {
        songId: selectedPresetSongId,
        defaultBPM: bpm,
        defaultTimeSignature: presetForm.defaultTimeSignature,
        defaultVolume: presetForm.defaultVolume,
        defaultSubdivisions: presetForm.defaultSubdivisions,
        accentPattern: presetForm.accentPattern
      };

      if (presetForm.id) {
        await pb.collection('metronomePresets').update(presetForm.id, payload, { $autoCancel: false });
        toast.success('Preset updated successfully');
      } else {
        const newPreset = await pb.collection('metronomePresets').create(payload, { $autoCancel: false });
        setPresetForm(prev => ({ ...prev, id: newPreset.id }));
        toast.success('Preset created successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save preset');
    } finally {
      setSavingPreset(false);
    }
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatus = (song) => {
    try { return JSON.parse(song.description).status || 'publish'; } catch(e) { return 'publish'; }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Chord Tempo</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your song library, chords, and presets.</p>
          </div>
        </div>

        <Tabs defaultValue="lagu" className="space-y-6 flex flex-col md:flex-row gap-8">
          <TabsList className="bg-card border border-border flex-col h-auto w-full md:w-64 items-stretch p-2">
            <TabsTrigger value="lagu" className="justify-start py-3"><Music className="w-4 h-4 mr-2" /> Lagu Management</TabsTrigger>
            <TabsTrigger value="chord" className="justify-start py-3"><FileText className="w-4 h-4 mr-2" /> Chord Management</TabsTrigger>
            <TabsTrigger value="preset" className="justify-start py-3"><Settings2 className="w-4 h-4 mr-2" /> Preset Metronome</TabsTrigger>
          </TabsList>

          <div className="flex-1">
            {/* TAB 1: LAGU */}
            <TabsContent value="lagu" className="mt-0 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <Input 
                  placeholder="Search songs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md bg-card"
                />
                <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingSong(null);
                      setSongForm({ title: '', artist: '', slug: '', status: 'publish' });
                    }}>
                      <Plus className="w-4 h-4 mr-2" /> Add New Song
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>{editingSong ? 'Edit Song' : 'Add New Song'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveSong} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input required value={songForm.title} onChange={handleTitleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Artist</Label>
                        <Input required value={songForm.artist} onChange={handleArtistChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input required value={songForm.slug} onChange={handleSlugChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={songForm.status} onValueChange={handleStatusChange}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="publish">Publish</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={savingSong}>
                        {savingSong ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Song
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase">
                    <tr>
                      <th className="px-6 py-3">Title</th>
                      <th className="px-6 py-3">Artist</th>
                      <th className="px-6 py-3">Slug</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSongs.map(song => (
                      <tr key={song.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-6 py-4 font-medium">{song.title}</td>
                        <td className="px-6 py-4">{song.artist}</td>
                        <td className="px-6 py-4 text-muted-foreground">{song.slug}</td>
                        <td className="px-6 py-4 capitalize">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatus(song) === 'publish' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {getStatus(song)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingSong(song);
                            setSongForm({ title: song.title, artist: song.artist, slug: song.slug, status: getStatus(song) });
                            setSongDialogOpen(true);
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSong(song.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredSongs.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                          No songs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* TAB 2: CHORD */}
            <TabsContent value="chord" className="mt-0 space-y-4">
              <div className="mb-6">
                <Input 
                  placeholder="Search songs to edit chords..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md bg-card"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSongs.map(song => (
                  <Card key={song.id} className="bg-card border-border cursor-pointer hover:border-primary transition-colors" onClick={() => openChordDialog(song)}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold truncate">{song.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Dialog open={chordDialogOpen} onOpenChange={setChordDialogOpen}>
                <DialogContent className="bg-card border-border max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Edit Chords: {selectedChordSong?.title}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveChord} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Chord Content (Use [C] format for chords)</Label>
                      <Textarea 
                        required 
                        value={chordForm.content} 
                        onChange={handleChordContentChange} 
                        className="font-mono h-64 bg-background"
                        placeholder="[C] Verse 1\n[F] Chorus"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={savingChord}>
                      {savingChord ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Chords
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* TAB 3: PRESET */}
            <TabsContent value="preset" className="mt-0 space-y-6">
              <Card className="bg-card border-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-3 mb-8 max-w-xl">
                    <Label className="text-base">Select Song for Preset</Label>
                    <Select value={selectedPresetSongId} onValueChange={setSelectedPresetSongId}>
                      <SelectTrigger className="h-12 bg-background">
                        <SelectValue placeholder="Choose a song to configure..." />
                      </SelectTrigger>
                      <SelectContent>
                        {songs.map(song => (
                          <SelectItem key={song.id} value={song.id}>
                            {song.title} - {song.artist}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!selectedPresetSongId ? (
                    <div className="text-center py-16 px-4 border-2 border-dashed border-border rounded-xl bg-muted/10">
                      <Settings2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Select a song first</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">
                        Choose a song from the dropdown above to configure its default metronome settings.
                      </p>
                    </div>
                  ) : loadingPreset ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : (
                    <form onSubmit={handleSavePreset} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label>Default BPM</Label>
                            <Input type="number" required min="30" max="300" value={presetForm.defaultBPM} onChange={handleBPMChange} className="bg-background" />
                          </div>
                          <div className="space-y-3">
                            <Label>Time Signature</Label>
                            <Select value={presetForm.defaultTimeSignature} onValueChange={handleTimeSignatureChange}>
                              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['2/4', '3/4', '4/4', '6/8', '12/8'].map(ts => <SelectItem key={ts} value={ts}>{ts}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label>Subdivisions</Label>
                            <Select value={presetForm.defaultSubdivisions} onValueChange={handleSubdivisionsChange}>
                              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="off">Off</SelectItem>
                                <SelectItem value="8th">8th</SelectItem>
                                <SelectItem value="16th">16th</SelectItem>
                                <SelectItem value="triplet">Triplet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label>Accent Pattern</Label>
                            <Input value={presetForm.accentPattern} onChange={handleAccentPatternChange} placeholder="1,0,0,0" className="bg-background" />
                            <p className="text-xs text-muted-foreground">Comma-separated numbers (e.g., 1,0,0,0)</p>
                          </div>
                          <div className="space-y-4 pt-2">
                            <div className="flex justify-between items-center">
                              <Label>Default Volume</Label>
                              <span className="text-sm font-medium text-primary">{presetForm.defaultVolume}%</span>
                            </div>
                            <Slider value={[presetForm.defaultVolume]} onValueChange={handleVolumeChange} max={100} step={1} />
                          </div>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-border flex justify-end">
                        <Button type="submit" disabled={savingPreset} className="w-full md:w-auto min-w-[200px]">
                          {savingPreset ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Save Preset
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </>
  );
};

export default AdminDashboard;