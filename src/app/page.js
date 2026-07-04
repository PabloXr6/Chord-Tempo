import React from 'react';
import Link from 'next/link';
import { Music2, Zap, ArrowRight, Activity } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import HomeSearch from '@/components/HomeSearch';

// PENTING: Import komponen client yang baru dibuat
import SongCatalogClient from '@/components/SongCatalogClient'; 

export const metadata = {
  title: "Chord Tempo | Precision Metronome & Chords",
  description: "Aplikasi metronom dengan dukungan lirik & chord interaktif.",
};

export default async function HomePage() {
  const supabase = await createClient();

  const { data: songs, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(18); // Saran: limit dinaikkan agar fungsi centang lebih terasa

  const songList = songs || [];

  return (
    <>
      {/* 1. HERO SECTION TETAP SAMA */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-background z-10" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 py-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-balance leading-none">
              Precision <span className="text-primary">Tempo</span>.<br /> 
              Master Your <span className="text-accent-foreground">Rhythm</span>.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-medium">
              Aplikasi metronom dengan dukungan lirik & chord interaktif. Sempurna untuk latihan, rekaman, dan live performance.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold group" asChild>
                <Link href="/playlists">
                  <Activity className="w-5 h-5 mr-2" /> Start Metronome <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse-ring pointer-events-none" />
              <div className="w-40 h-40 rounded-full bg-card flex flex-col items-center justify-center shadow-2xl border-2 border-primary/30 z-10">
                <Music2 className="w-10 h-10 text-primary mb-1" />
                <span className="text-5xl font-black text-primary tracking-tighter">120</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">BPM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION GRID LAGU */}
      <section className="py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {songList.length === 0 ? (
            <div className="text-center py-20 bg-background rounded-3xl border border-border">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-1">Koleksi Lagu Kosong</h3>
              <p className="text-muted-foreground">Gunakan tombol Admin untuk menambah lagu pertama Anda.</p>
            </div>
          ) : (
            /* Semua Header, Search Bar, dan Grid dipindah ke sini */
            <SongCatalogClient songs={songList} />
          )}

        </div>
      </section>
    </>
  );
}