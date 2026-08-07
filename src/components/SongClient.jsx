"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, RotateCcw, Play, Pause, Square, Zap, Music, Volume2, VolumeX, Settings2, Clock, ListMusic
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';

import { useMetronomeEngine } from '@/hooks/useMetronomeEngine';
import ChordDisplay from '@/components/ChordDisplay';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';

export default function SongClient({ song }) {
  const router = useRouter();
  const chordArticle = song?.chord_articles?.[0] || null;
  const [visualEffects] = useState(true);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // Inisialisasi Metronome Engine dengan URL Audio
  const {
    isPlaying, play, pause, stop,
    bpm, setBPM,
    timeSignature, setTimeSignature,
    volume, setVolume,
    offset, setOffset,
    currentBeat, tapTempo
  } = useMetronomeEngine(null);

  // Set BPM dan Time Signature bawaan lagu HANYA SEKALI saat komponen dimuat
  useEffect(() => {
    if (song?.bpm) setBPM(song.bpm);
    if (song?.time_signature) setTimeSignature(song.time_signature);
  }, [song, setBPM, setTimeSignature]);

  const beatsPerMeasure = parseInt(timeSignature.split('/')[0]) || 4;
  const isFlashing = visualEffects && isPlaying && currentBeat === 0;

  return (
    <div className={`min-h-screen transition-colors duration-150 ${isFlashing ? 'bg-primary/5' : 'bg-background'}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Button variant="ghost" asChild className="mb-6 text-muted-foreground hover:text-foreground">
          <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Kembali</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SISI KIRI: METRONOME CONSOLE */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter leading-tight">{song?.title}</h1>
                <p className="text-xl text-muted-foreground font-medium">{song?.artist}</p>
              </div>
              <Button onClick={() => setIsPlaylistModalOpen(true)} variant="outline" className="shrink-0 bg-card">
                <ListMusic className="w-4 h-4 mr-2" /> Add to Playlist
              </Button>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col items-center space-y-8 relative z-10">
                
                {/* Visualizer Circle */}
                <div className="relative w-64 h-64 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-muted/30" />
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse-ring pointer-events-none" />
                  )}

                  <div className="text-center z-10">
                    <Input 
                      type="number" 
                      value={bpm} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setBPM(Math.max(30, Math.min(300, val)));
                      }}
                      className="text-6xl font-bold text-primary tracking-tighter text-center bg-transparent border-none focus-visible:ring-0 h-auto p-0 w-32 mx-auto"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    />
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">BPM</div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 z-10">
                    <button
                      onClick={isPlaying ? pause : play}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
                        isPlaying 
                          ? 'bg-destructive text-white shadow-destructive/20' 
                          : 'bg-primary text-primary-foreground shadow-primary/20'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                    </button>
                    <button
                      onClick={stop}
                      className="w-12 h-12 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground transition-all"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Beat Indicators */}
                <div className="flex justify-center gap-2 w-full px-4">
                  {Array.from({ length: beatsPerMeasure }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 rounded-full transition-all duration-100 ${
                        currentBeat === i && isPlaying
                          ? 'w-10 bg-primary shadow-[0_0_15px_rgba(0,255,255,0.5)]' 
                          : 'w-2.5 bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Main Controls */}
                <div className="w-full space-y-6">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => setBPM(bpm - 1)}>-</Button>
                    <Slider value={[bpm]} onValueChange={(v) => setBPM(v[0])} min={30} max={280} step={1} className="flex-1" />
                    <Button variant="outline" size="icon" className="rounded-full" onClick={() => setBPM(bpm + 1)}>+</Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={tapTempo} variant="secondary" className="font-bold rounded-xl h-12 uppercase tracking-wider text-xs">
                      <Zap className="w-4 h-4 mr-2 fill-current" /> Tap Tempo
                    </Button>
                    <Button variant="outline" className="font-bold rounded-xl h-12 uppercase tracking-wider text-xs" onClick={() => setBPM(song?.bpm || 120)}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Reset
                    </Button>
                  </div>
                </div>

                {/* MIXER SECTION (Volume & Sync) */}
                <div className="w-full space-y-5 bg-background/40 p-6 rounded-[2rem] border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Audio Mixer</span>
                  </div>

                  {/* Metronome Volume */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-3 h-3" /> 
                        <span>Metronome</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0 hover:text-primary"
                          onClick={() => setVolume(volume === 0 ? 70 : 0)}
                        >
                          {volume === 0 ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        </Button>
                      </div>
                      <span>{volume}%</span>
                    </div>
                    <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} max={100} />
                  </div>

                  {/* Offset Control */}
                  <div className="space-y-3 pt-2 border-t border-border/20">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
                      <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> Sync Offset</div>
                      <span className={offset !== 0 ? "text-primary" : ""}>{offset}ms</span>
                    </div>
                    <Slider value={[offset]} onValueChange={(v) => setOffset(v[0])} min={-500} max={500} step={5} />
                  </div>
                </div>

                {/* Signature Select */}
                <div className="w-full flex items-center justify-between gap-4 p-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Time Signature</Label>
                  <Select value={timeSignature} onValueChange={setTimeSignature}>
                    <SelectTrigger className="w-24 bg-background border-none font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['2/4', '3/4', '4/4', '6/8', '12/8'].map(ts => <SelectItem key={ts} value={ts}>{ts}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>
          </div>

          {/* SISI KANAN: CHORD DISPLAY */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ChordDisplay 
            chordContent={chordArticle?.content || ''} 
            isPlaying={isPlaying} 
            bpm={bpm}             
            />
          </div>

        </div>
      </div>

      {song && (
        <AddToPlaylistModal 
          open={isPlaylistModalOpen} 
          onOpenChange={setIsPlaylistModalOpen} 
          songData={song}
          currentBPM={bpm}
          currentTimeSignature={timeSignature}
        />
      )}
    </div>
  );
}