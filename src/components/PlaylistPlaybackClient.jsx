"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, SkipBack, SkipForward, Play, Pause, 
  ListMusic, Settings2, Volume2, VolumeX
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription
} from '@/components/ui/sheet';

import { useMetronomeEngine } from '@/hooks/useMetronomeEngine';
import ChordDisplay from '@/components/ChordDisplay';
import AdBanner from '@/components/AdBanner'; // Import AdBanner sudah benar

export default function PlaylistPlaybackClient({ initialPlaylist, initialStartIndex }) {
  const [playlist] = useState(initialPlaylist);
  
  // Pastikan startIndex tidak melebihi jumlah lagu
  const validStartIndex = (initialStartIndex >= 0 && initialStartIndex < playlist.playlist_items.length) 
    ? initialStartIndex 
    : 0;
    
  const [currentIndex, setCurrentIndex] = useState(validStartIndex);

  // Inisialisasi Metronome Engine
  const {
    isPlaying, play, pause, stop,
    bpm, setBPM,
    timeSignature, setTimeSignature,
    volume, setVolume,
    musicVolume, setMusicVolume,
    currentBeat
  } = useMetronomeEngine();

  // Efek untuk Memperbarui Metronom saat Lagu Berubah
  useEffect(() => {
    if (playlist && playlist.playlist_items[currentIndex]) {
      const currentItem = playlist.playlist_items[currentIndex];
      const song = currentItem.songs;

      const targetBPM = currentItem.custom_bpm || song.bpm || 120;
      const targetTimeSig = currentItem.custom_time_signature || song.time_signature || '4/4';

      setBPM(targetBPM);
      setTimeSignature(targetTimeSig);
      
      // LOGIKA STOP OTOMATIS DIHAPUS DARI SINI
      // Agar saat Play ditekan, metronom tidak membunuh dirinya sendiri.

      document.title = `Playing: ${song.title} | ${playlist.name}`;
    }
  // isPlaying DIHAPUS DARI DEPENDENCY ARRAY DI BAWAH INI:
  }, [currentIndex, playlist, setBPM, setTimeSignature]);

  const handleNext = () => {
    stop(); // <-- Tambahkan ini agar metronom mati saat di-next
    if (currentIndex < playlist.playlist_items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    stop(); // <-- Tambahkan ini agar metronom mati saat di-previous
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!playlist.playlist_items || playlist.playlist_items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-3xl border border-border shadow-xl">
          <h2 className="text-2xl font-bold">Playlist kosong</h2>
          <p className="mt-2 text-sm text-muted-foreground">Silakan kembali dan tambahkan lagu.</p>
        </div>
      </div>
    );
  }

  const currentItem = playlist.playlist_items[currentIndex];
  const currentSong = currentItem?.songs || {};
  const beatsPerMeasure = parseInt(timeSignature.split('/')[0]) || 4;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Navigasi Playback */}
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/playlists/${playlist.id}`}><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h2 className="font-bold leading-none">{playlist.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">Lagu {currentIndex + 1} dari {playlist.playlist_items.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <ListMusic className="w-4 h-4 mr-2" /> Antrean
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Daftar Lagu</SheetTitle>
                  <SheetDescription className="sr-only">Daftar lagu dalam playlist ini</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {playlist.playlist_items.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl transition-colors ${
                        currentIndex === idx ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-bold text-sm line-clamp-1">{item.songs.title}</div>
                      <div className={`text-xs ${currentIndex === idx ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {item.songs.artist}
                      </div>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sisi Kiri: Metronome & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-3xl border-primary/20 shadow-xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="text-center">
                  <h1 className="text-3xl font-black tracking-tighter line-clamp-2">{currentSong.title}</h1>
                  <p className="text-muted-foreground font-medium">{currentSong.artist}</p>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative group/bpm flex items-center justify-center">
                    <Input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBPM(Math.min(300, Math.max(20, parseInt(e.target.value) || 0)))}
                      className="w-48 h-24 text-center text-7xl font-black text-primary bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 tracking-tighter"
                      min={20}
                      max={300}
                    />
                    <div className="absolute -bottom-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-0 group-hover/bpm:opacity-100 transition-opacity">
                      Click to edit BPM
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {Array.from({ length: beatsPerMeasure }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-150 ${
                          currentBeat === i && isPlaying
                            ? 'w-8 bg-primary' 
                            : 'w-2 bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-full" 
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  
                  <Button 
                    size="icon" 
                    className="h-20 w-20 rounded-full shadow-lg shadow-primary/20" 
                    onClick={isPlaying ? pause : play}
                  >
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                  </Button>

                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-full" 
                    onClick={handleNext}
                    disabled={currentIndex === playlist.playlist_items.length - 1}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>

                {/* Quick Volume Slider */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                         <div className="flex items-center gap-2">
                           <span>Metronome Volume</span>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-5 w-5 p-0 hover:text-primary"
                             onClick={() => setVolume(volume === 0 ? 70 : 0)}
                           >
                             {volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                           </Button>
                         </div>
                         <span>{volume}%</span>
                      </div>
                      <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} max={100} step={1} />
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary">
                         <span>Music Volume</span>
                         <span>{musicVolume}%</span>
                      </div>
                      <Slider value={[musicVolume]} onValueChange={(v) => setMusicVolume(v[0])} max={100} step={1} />
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* --- IKLAN DITEMPATKAN DI SINI (MODE TEST) --- */}
            <AdBanner dataAdSlot="iklan-bawah-metronom" isTestMode={true} />

            <div className="p-6 bg-muted/30 rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold uppercase tracking-tight">Informasi Lagu</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-background rounded-lg border border-border">
                  <span className="block text-xs text-muted-foreground mb-1">Birama</span>
                  <span className="font-bold">{timeSignature}</span>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <span className="block text-xs text-muted-foreground mb-1">BPM Awal</span>
                  <span className="font-bold">{currentSong.bpm}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Chord Display */}
          <div className="lg:col-span-8">
             <ChordDisplay 
               chordContent={currentSong.chord_articles?.[0]?.content || ""} 
               isPlaying={isPlaying} 
               bpm={bpm} 
             />
          </div>

        </div>
      </div>
    </div>
  );
}