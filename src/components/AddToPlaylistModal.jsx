"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { getPlaylists, createPlaylist, addSongToPlaylist } from '@/lib/PlaylistUtils';
import { toast } from 'sonner';

const AddToPlaylistModal = ({ open, onOpenChange, songData, currentBPM, currentTimeSignature }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const [saveCustomBPM, setSaveCustomBPM] = useState(false);
  const [saveCustomTimeSig, setSaveCustomTimeSig] = useState(false);
  
  // State baru untuk menahan klik dobel saat proses ke database
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Memuat data secara asynchronous (karena akan memanggil Supabase)
  useEffect(() => {
    if (open) {
      const loadPlaylists = async () => {
        if (!isAuthenticated) {
          router.push('/login');
          onOpenChange(false);
          return;
        }
        try {
          const loaded = await getPlaylists();
          setPlaylists(loaded || []);
          if (loaded && loaded.length > 0) {
            setSelectedPlaylistId(loaded[0].id);
          } else {
            setSelectedPlaylistId('new');
          }
        } catch (error) {
          console.error("Error loading playlists:", error);
          // Only show error if authenticated, otherwise they are being redirected
          if (isAuthenticated) {
            toast.error("Gagal memuat daftar playlist");
          }
        }
      };
      
      loadPlaylists();
    } else {
      // Reset state saat modal ditutup
      setNewPlaylistName('');
      setSaveCustomBPM(false);
      setSaveCustomTimeSig(false);
    }
  }, [open]);

  const handleAdd = async () => {
    setIsSubmitting(true);
    try {
      let targetId = selectedPlaylistId;
      
      // 1. Jika membuat playlist baru
      if (targetId === 'new') {
        if (!newPlaylistName.trim()) {
          toast.error('Silakan masukkan nama playlist');
          setIsSubmitting(false);
          return;
        }
        // Tunggu proses insert playlist baru ke Supabase
        const newPlaylist = await createPlaylist(newPlaylistName.trim());
        targetId = newPlaylist.id;
      }

      // 2. Siapkan payload untuk tabel playlist_items
      // Catatan: Di Supabase, kita cukup menyimpan song_id (Foreign Key), tidak perlu duplikasi judul & artis
      const songToAdd = {
        song_id: songData.id, 
        custom_bpm: saveCustomBPM ? currentBPM : null,
        custom_time_signature: saveCustomTimeSig ? currentTimeSignature : null
      };

      // 3. Masukkan lagu ke tabel playlist_items
      await addSongToPlaylist(targetId, songToAdd);
      
      toast.success('Lagu berhasil ditambahkan ke playlist');
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error(error.message || "Gagal menyimpan ke playlist");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription className="sr-only">
            Select a playlist to add this song to, or create a new one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-base">Select Playlist</Label>
            <RadioGroup value={selectedPlaylistId} onValueChange={setSelectedPlaylistId} className="space-y-3">
              {playlists.map(p => (
                <div key={p.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={p.id} id={`playlist-${p.id}`} />
                  <Label htmlFor={`playlist-${p.id}`} className="cursor-pointer">{p.name}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-2 pt-2">
                <RadioGroupItem value="new" id="playlist-new" />
                <Label htmlFor="playlist-new" className="cursor-pointer">Create New Playlist</Label>
              </div>
            </RadioGroup>

            {selectedPlaylistId === 'new' && (
              <div className="pl-6 pt-2">
                <Input 
                  placeholder="Playlist Name" 
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="bg-background"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-base">Custom Settings (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="save-bpm" 
                  checked={saveCustomBPM} 
                  onCheckedChange={setSaveCustomBPM}
                  disabled={isSubmitting}
                />
                <Label htmlFor="save-bpm" className="cursor-pointer font-normal">
                  Save current BPM ({currentBPM})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="save-timesig" 
                  checked={saveCustomTimeSig} 
                  onCheckedChange={setSaveCustomTimeSig}
                  disabled={isSubmitting}
                />
                <Label htmlFor="save-timesig" className="cursor-pointer font-normal">
                  Save current Time Signature ({currentTimeSignature})
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add to Playlist"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistModal;