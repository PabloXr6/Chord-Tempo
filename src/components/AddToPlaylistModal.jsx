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
// getPlaylists dihapus dari import karena kita akan query langsung untuk menghindari cache
import { createPlaylist, addSongToPlaylist } from '@/lib/PlaylistUtils'; 
import { toast } from 'sonner';

const AddToPlaylistModal = ({ open, onOpenChange, songData, selectedSongIds = [], currentBPM, currentTimeSignature }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const [saveCustomBPM, setSaveCustomBPM] = useState(false);
  const [saveCustomTimeSig, setSaveCustomTimeSig] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ambil instance supabase dari context agar selalu tersambung dengan sesi saat ini
  const { isAuthenticated, supabase } = useAuth();
  const router = useRouter();

  const isBulkMode = selectedSongIds && selectedSongIds.length > 0;

  useEffect(() => {
    let isMounted = true;

    // Fungsi fetch data langsung (anti-cache)
    const fetchFreshPlaylists = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        onOpenChange(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Tarik data langsung dari Supabase setiap kali modal terbuka!
        const { data, error } = await supabase
          .from('playlists')
          .select('id, name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (isMounted) {
          setPlaylists(data || []);
          if (data && data.length > 0) {
            setSelectedPlaylistId(data[0].id);
          } else {
            setSelectedPlaylistId('new');
          }
        }
      } catch (error) {
        console.error("Error loading fresh playlists:", error);
        if (isAuthenticated && isMounted) {
          toast.error("Gagal memuat daftar playlist");
        }
      }
    };

    if (open) {
      fetchFreshPlaylists();
    } else {
      const resetTimer = setTimeout(() => {
        if (isMounted) {
          setNewPlaylistName('');
          setSaveCustomBPM(false);
          setSaveCustomTimeSig(false);
        }
      }, 300);

      return () => {
        isMounted = false;
        clearTimeout(resetTimer); // Bersihkan memori timer
      };
    }
  }, [open, isAuthenticated, router, supabase, onOpenChange]); 

  const handleAdd = async () => {
    setIsSubmitting(true);
    try {
      let targetId = selectedPlaylistId;
      
      if (targetId === 'new') {
        if (!newPlaylistName.trim()) {
          toast.error('Silakan masukkan nama playlist');
          setIsSubmitting(false);
          return;
        }
        const newPlaylist = await createPlaylist(newPlaylistName.trim());
        targetId = newPlaylist.id;
      }

      // LOGIKA PENYIMPANAN
      if (isBulkMode) {
        const promises = selectedSongIds.map(id => 
          addSongToPlaylist(targetId, {
            song_id: id, 
            custom_bpm: null, 
            custom_time_signature: null
          })
        );
        
        await Promise.all(promises);
        toast.success(`${selectedSongIds.length} Lagu berhasil ditambahkan!`);
        
      } else if (songData) {
        const songToAdd = {
          song_id: songData.id, 
          custom_bpm: saveCustomBPM ? currentBPM : null,
          custom_time_signature: saveCustomTimeSig ? currentTimeSignature : null
        };
        await addSongToPlaylist(targetId, songToAdd);
        toast.success('Lagu berhasil ditambahkan ke playlist');
      }

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

          {!isBulkMode && (
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
          )}
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