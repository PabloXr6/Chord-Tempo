"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Volume2, Zap, Settings2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';

const MetronomePlayer = ({ 
  defaultBPM = 120, 
  defaultTimeSignature = '4/4',
  defaultAccentFirst = true,
  defaultSubdivisions = '1',
  downbeatSound,
  regularBeatSound,
  subdivisionSound,
  onBPMChange,
  onTimeSignatureChange
}) => {
  const [bpm, setBpm] = useState(defaultBPM);
  const [timeSignature, setTimeSignature] = useState(defaultTimeSignature);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [subdivisions, setSubdivisions] = useState(defaultSubdivisions);
  const [accentFirst, setAccentFirst] = useState(defaultAccentFirst);
  
  // State Visual
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatPulse, setBeatPulse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [visualFlash, setVisualFlash] = useState(true);

  // System Refs
  const audioContextRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const currentNoteRef = useRef(0);
  const timerIdRef = useRef(null);
  const tapTimesRef = useRef([]);
  
  // OPTIMASI VISUAL: Antrean render visual menggunakan requestAnimationFrame
  const notesQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const pulseEndTimeRef = useRef(0);
  
  // Audio buffers
  const buffersRef = useRef({
    downbeat: null,
    regular: null,
    subdivision: null
  });

  const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);

  // Sync callbacks to parent (if any)
  useEffect(() => {
    if (onBPMChange) onBPMChange(bpm);
  }, [bpm, onBPMChange]);

  useEffect(() => {
    if (onTimeSignatureChange) onTimeSignatureChange(timeSignature);
  }, [timeSignature, onTimeSignatureChange]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    const loadSound = async (url, type) => {
      if (!url) return;
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        buffersRef.current[type] = audioBuffer;
      } catch (e) {
        console.error(`Failed to load ${type} sound:`, e);
      }
    };

    if (downbeatSound) loadSound(downbeatSound, 'downbeat');
    if (regularBeatSound) loadSound(regularBeatSound, 'regular');
    if (subdivisionSound) loadSound(subdivisionSound, 'subdivision');

    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [downbeatSound, regularBeatSound, subdivisionSound]);

  const playSound = (type, frequency, duration = 0.05) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(volume[0] / 100, ctx.currentTime);

    const buffer = buffersRef.current[type];
    
    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      source.start(ctx.currentTime);
    } else {
      const oscillator = ctx.createOscillator();
      oscillator.connect(gainNode);
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    }
  };

  const scheduleNote = (time) => {
    const beatNumber = currentNoteRef.current % beatsPerMeasure;
    const subDivisions = parseInt(subdivisions);
    const isDownbeat = beatNumber === 0 && accentFirst && (currentNoteRef.current % (1 / subDivisions) === 0);
    const isSubdivision = currentNoteRef.current % (1 / subDivisions) !== 0;

    let type = 'regular';
    let frequency = 800;
    
    if (isDownbeat) {
      type = 'downbeat';
      frequency = 1200;
    } else if (isSubdivision) {
      type = 'subdivision';
      frequency = 600;
    }

    playSound(type, frequency);

    // OPTIMASI: Masukkan antrean visual saja, jangan panggil state (setTimeout) di sini!
    if (!isSubdivision) {
      notesQueueRef.current.push({ time, beatNumber });
    }
  };

  const scheduler = () => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const secondsPerBeat = 60.0 / bpm;
    const subDivisions = parseInt(subdivisions);
    const secondsPerNote = secondsPerBeat / subDivisions;

    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      scheduleNote(nextNoteTimeRef.current);
      nextNoteTimeRef.current += secondsPerNote;
      currentNoteRef.current++;
    }

    timerIdRef.current = setTimeout(scheduler, 25);
  };

  // MESIN VISUAL: Menarik data antrean dengan kecepatan layar (60Hz) agar tidak berat
  const drawVisuals = useCallback(function loop() { // <-- Ubah menjadi function loop()
    if (!audioContextRef.current) return;
    const currentTime = audioContextRef.current.currentTime;

    let newBeat = null;
    
    // Ambil data nada yang sudah lewat untuk digambar di layar
    while (notesQueueRef.current.length && notesQueueRef.current[0].time <= currentTime) {
      newBeat = notesQueueRef.current.shift().beatNumber;
    }

    if (newBeat !== null) {
      setCurrentBeat(newBeat);
      if (visualFlash) {
        setBeatPulse(true);
        pulseEndTimeRef.current = currentTime + 0.1; // Kedip selama 100ms
      }
    } else if (pulseEndTimeRef.current && currentTime >= pulseEndTimeRef.current) {
      // Matikan kedipan setelah 100ms
      setBeatPulse(false);
      pulseEndTimeRef.current = 0;
    }

    // Panggil 'loop' (dirinya sendiri), BUKAN 'drawVisuals'
    animationFrameRef.current = requestAnimationFrame(loop); 
  }, [visualFlash]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      currentNoteRef.current = 0;
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      notesQueueRef.current = [];
      pulseEndTimeRef.current = 0;
      
      scheduler();
      setIsPlaying(true);
      
      // Jalankan mesin visual!
      animationFrameRef.current = requestAnimationFrame(drawVisuals);
    } else {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      setIsPlaying(false);
      setCurrentBeat(0);
      setBeatPulse(false);
    }
  };

  const handleStop = () => {
    if (timerIdRef.current) clearTimeout(timerIdRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    setIsPlaying(false);
    setCurrentBeat(0);
    setBeatPulse(false);
    currentNoteRef.current = 0;
    notesQueueRef.current = [];
  };

  const handleTapTempo = () => {
    const now = Date.now();
    tapTimesRef.current.push(now);

    if (tapTimesRef.current.length > 4) tapTimesRef.current.shift();

    if (tapTimesRef.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBPM = Math.round(60000 / avgInterval);
      
      if (calculatedBPM >= 30 && calculatedBPM <= 300) {
        setBpm(calculatedBPM);
      }
    }

    setTimeout(() => {
      if (tapTimesRef.current.length > 0 && Date.now() - tapTimesRef.current[tapTimesRef.current.length - 1] > 2000) {
        tapTimesRef.current = [];
      }
    }, 2000);
  };

  const adjustBPM = (delta) => {
    setBpm(prev => Math.max(30, Math.min(300, prev + delta)));
  };

  const handleBpmInputChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setBpm(Math.max(30, Math.min(300, val)));
    }
  };

  return (
    <div className={`glass-panel rounded-3xl p-8 shadow-2xl max-w-md mx-auto relative overflow-hidden border border-primary/20 ${visualFlash && beatPulse && isPlaying && currentBeat === 0 && accentFirst ? 'animate-screen-flash' : ''}`}>
      <div className="flex flex-col items-center space-y-8 relative z-10">
        
        {/* Circular Interface */}
        <div className="relative w-64 h-64 flex flex-col items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          
          {/* Animated Pulse Ring */}
          {beatPulse && isPlaying && (
            <div className="absolute inset-0 rounded-full border-4 border-destructive animate-pulse-ring pointer-events-none" />
          )}

          {/* BPM Display */}
          <div className="text-center mb-4 flex flex-col items-center">
            <Input 
              type="number" 
              value={bpm} 
              onChange={handleBpmInputChange}
              className="text-6xl font-bold text-primary tracking-tighter text-center bg-transparent border-none focus-visible:ring-0 h-auto p-0 w-32"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            />
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">BPM</div>
          </div>

          {/* Play/Pause/Stop Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isPlaying 
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 transition-all"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="w-full space-y-6">
          {/* BPM Slider */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => adjustBPM(-1)} className="h-10 w-10 rounded-full border-muted-foreground/30 shrink-0">
              -
            </Button>
            <Slider
              value={[bpm]}
              onValueChange={(v) => setBpm(v[0])}
              min={30}
              max={300}
              step={1}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={() => adjustBPM(1)} className="h-10 w-10 rounded-full border-muted-foreground/30 shrink-0">
              +
            </Button>
          </div>
          
          <Button
            onClick={handleTapTempo}
            variant="secondary"
            className="w-full h-12 rounded-full font-bold tracking-wide bg-secondary hover:bg-secondary/80"
          >
            <Zap className="w-4 h-4 mr-2 text-accent" />
            TAP TEMPO
          </Button>
        </div>

        {/* Beat Indicators */}
        <div className="flex justify-center gap-3 w-full">
          {Array.from({ length: beatsPerMeasure }).map((_, i) => (
            <div
              key={i}
              className={`h-3 rounded-full transition-all duration-150 ${
                currentBeat === i && isPlaying
                  ? i === 0 && accentFirst 
                    ? 'w-8 bg-destructive shadow-[0_0_10px_rgba(255,0,255,0.5)]' 
                    : 'w-8 bg-primary shadow-[0_0_10px_rgba(0,255,255,0.5)]'
                  : 'w-3 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Advanced Settings Toggle */}
        <Collapsible open={showSettings} onOpenChange={setShowSettings} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-between items-center text-muted-foreground hover:text-foreground">
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Advanced Settings
              </span>
              <Activity className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              {/* Time Signature */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Signature</Label>
                <Select value={timeSignature} onValueChange={setTimeSignature}>
                  <SelectTrigger className="bg-background/50 border-muted-foreground/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['2/4', '3/4', '4/4', '5/4', '6/8', '7/8', '12/8'].map(ts => (
                      <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subdivisions */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Subdivision</Label>
                <Select value={subdivisions} onValueChange={setSubdivisions}>
                  <SelectTrigger className="bg-background/50 border-muted-foreground/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Quarter (1)</SelectItem>
                    <SelectItem value="2">Eighth (2)</SelectItem>
                    <SelectItem value="3">Triplet (3)</SelectItem>
                    <SelectItem value="4">Sixteenth (4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4 bg-background/30 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <Label htmlFor="accent-first" className="cursor-pointer">Accent First Beat</Label>
                <Switch id="accent-first" checked={accentFirst} onCheckedChange={setAccentFirst} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="visual-flash" className="cursor-pointer">Visual Flash</Label>
                <Switch id="visual-flash" checked={visualFlash} onCheckedChange={setVisualFlash} />
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Volume2 className="w-4 h-4" /> Volume
                </Label>
                <span className="text-xs font-medium">{volume[0]}%</span>
              </div>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="py-2"
              />
            </div>

          </CollapsibleContent>
        </Collapsible>

      </div>
    </div>
  );
};

export default MetronomePlayer;