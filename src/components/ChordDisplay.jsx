"use client";

// 1. TAMBAHKAN useCallback di import
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { parseAndTransposeContent } from '@/lib/chordUtils';
import { ArrowDownCircle, Minus, MousePointer2, Plus, RotateCcw, Type } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 2. BUNGKUS KOMPONEN DENGAN React.memo()
const ChordDisplay = React.memo(function ChordDisplay({ chordContent, isPlaying = false, bpm = 120 }) {
  const [semitones, setSemitones] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [autoScroll, setAutoScroll] = useState(false);
  const scrollContainerRef = useRef(null);

  // 1. Logic Transpose
  const displayedContent = useMemo(() => {
    return parseAndTransposeContent(chordContent, semitones);
  }, [chordContent, semitones]);

  // 3. UBAH LOGIC AUTO SCROLL MENGGUNAKAN DELTA TIME (Sangat Mulus)
  useEffect(() => {
    let animationFrameId;
    let lastTime = 0;
    let exactScrollTop = 0; // Menyimpan posisi scroll desimal yang sangat akurat

    const animateScroll = (time) => {
      if (!lastTime) {
        lastTime = time;
        // Ambil posisi awal saat mulai di-play
        if (scrollContainerRef.current) {
          exactScrollTop = scrollContainerRef.current.scrollTop;
        }
      }

      // Hitung berapa milidetik yang berlalu sejak frame terakhir
      const deltaTime = time - lastTime;
      lastTime = time;

      // Konversi rumus kecepatan lama Anda ke kecepatan per detik (Pixels per Second)
      const targetDelay = Math.max(30, 150 - (bpm / 2));
      const pixelsPerSecond = 1000 / targetDelay; 

      // Hitung pergerakan pixel untuk frame ini (bisa berupa pecahan desimal)
      const scrollAmount = (pixelsPerSecond * deltaTime) / 1000;

      if (scrollContainerRef.current) {
        exactScrollTop += scrollAmount;
        // Terapkan posisi scroll secara presisi
        scrollContainerRef.current.scrollTop = exactScrollTop;
      }

      animationFrameId = requestAnimationFrame(animateScroll);
    };

    if (autoScroll && isPlaying) {
      lastTime = 0; // Reset waktu setiap kali mulai
      animationFrameId = requestAnimationFrame(animateScroll);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [autoScroll, isPlaying, bpm]);

  // Reset scroll ke atas jika lagu berhenti/stop
  useEffect(() => {
    if (!isPlaying && scrollContainerRef.current) {
      // Jangan langsung ke atas jika hanya pause, tapi jika Anda ingin reset:
      // scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isPlaying]);

  // 4. BUNGKUS FUNGSI formatText DENGAN useCallback
  const formatText = useCallback((text) => {
    return text.split('\n').map((line, i) => {
      if (line.includes('[') && line.includes(']')) {
        const parts = line.split(/(\[[^\]]+\])/g);
        return (
          <div key={i} className="leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                return (
                  <span key={j} className="text-primary font-bold bg-primary/10 px-1 rounded shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                    {part.slice(1, -1)}
                  </span>
                );
              }
              return <span key={j}>{part}</span>;
            })}
          </div>
        );
      }
      return <div key={i} className="leading-relaxed min-h-[1.5em] opacity-90">{line}</div>;
    });
  }, []);

  // 5. MEMOIZE HASIL RENDER DOM TEKS KE DALAM VARIABEL
  // (Ini yang menyelamatkan CPU Anda dari re-render masif saat metronom menyala)
  const formattedElements = useMemo(() => {
    return formatText(displayedContent);
  }, [displayedContent, formatText]);

  return (
    <div className="flex flex-col h-[750px] bg-card rounded-[2rem] border border-border overflow-hidden shadow-2xl relative">
      
      <div className="flex flex-wrap items-center justify-between p-5 border-b border-border bg-muted/20 gap-4">
        
        <div className="flex items-center gap-2 bg-background/50 p-1.5 rounded-full border border-border">
          <Button variant="ghost" size="icon" onClick={() => setSemitones(prev => prev - 1)} className="h-7 w-7 rounded-full"><Minus className="w-3 h-3" /></Button>
          <div className="min-w-[50px] text-center font-bold text-xs uppercase tracking-tighter">
            {semitones > 0 ? `+${semitones}` : semitones} Key
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSemitones(prev => prev + 1)} className="h-7 w-7 rounded-full"><Plus className="w-3 h-3" /></Button>
        </div>

        <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/5 rounded-full border border-primary/20">
          <ArrowDownCircle className={`w-4 h-4 ${autoScroll ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />
          <Label htmlFor="auto-scroll" className="text-xs font-bold uppercase cursor-pointer">Auto Scroll</Label>
          <Switch 
            id="auto-scroll" 
            checked={autoScroll} 
            onCheckedChange={setAutoScroll} 
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2 text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border">
            <Type className="w-3 h-3" />
            <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="hover:text-primary px-1">-</button>
            <span className="text-xs font-mono w-4 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(Math.min(26, fontSize + 2))} className="hover:text-primary px-1">+</button>
          </div>
          
          {semitones !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSemitones(0)} className="text-[10px] h-8 uppercase font-bold tracking-widest"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
          )}
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 p-8 md:p-12 overflow-y-auto font-mono whitespace-pre scrollbar-hide selection:bg-primary/30"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-none prose dark:prose-invert">
          {/* 6. GANTI PEMANGGILAN FUNGSI DENGAN VARIABEL HASIL MEMOIZE */}
          {formattedElements}
        </div>
        {/* Ruang kosong di bawah agar baris terakhir bisa ke scroll ke tengah layar */}
        <div className="h-[400px]" />
      </div>

      {autoScroll && isPlaying && (
        <div className="absolute bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse flex items-center gap-2">
          <MousePointer2 className="w-3 h-3" /> Scrolling Active
        </div>
      )}
    </div>
  );
}); // Jangan lupa tutup kurung untuk React.memo()

export default ChordDisplay;