"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Search, Music2, Clock, Zap, Play, ArrowRight, Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Ambil data lagu untuk koleksi bawah
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6); // Tampilkan 6 lagu terbaru

        if (error) throw error;
        setSongs(data || []);
      } catch (err) {
        console.error('Failed to fetch songs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
    document.title = "Chord Tempo | Precision Metronome & Chords";
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const match = songs.find(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        router.push(`/song/${match.slug}`);
      } else {
        // Logika untuk halaman pencarian penuh jika perlu
      }
    }
  };

  return (
    <>
      {/* 1. DRAMATIC HERO & VISUALIZER SECTION */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
        {/* Latar Belakang Gradasi Kompleks & Kustom */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-background z-10" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 py-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Teks Hero */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-balance leading-none">
              Precision <span className="text-primary">Tempo</span>.<br /> 
              Master Your <span className="text-accent-foreground">Rhythm</span>.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-medium">
              Aplikasi metronom web tingkat lanjut dengan dukungan lirik & chord interaktif. Sempurna untuk latihan, rekaman, dan live performance.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold group" asChild>
                <Link href="/playlists">
                  <Activity className="w-5 h-5 mr-2" /> Start Metronome <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Elemen Visualisasi Metronom Kustom (Statis di Landing Page) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
              {/* Ring Animasi Pulse Kustom */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse-ring pointer-events-none" />
              
              {/* Inti Metronom */}
              <div className="w-40 h-40 rounded-full bg-card flex flex-col items-center justify-center shadow-2xl border-2 border-primary/30 z-10">
                <Music2 className="w-10 h-10 text-primary mb-1" />
                <span className="text-5xl font-black text-primary tracking-tighter">120</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">BPM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KUSTOM KOLEKSI LAGU GRID SECTION */}
      <section className="py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tighter text-foreground">Jelajahi Lagu</h2>
              <p className="text-lg text-muted-foreground">Pilih lagu dari katalog untuk langsung dimainkan dengan metronom.</p>
            </div>
            
            {/* Search Bar Minimalis & Modern */}
            <form onSubmit={handleSearch} className="relative w-full md:w-auto md:min-w-[320px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari lagu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-6 rounded-full bg-background/50 border-transparent focus-visible:ring-primary h-12"
              />
            </form>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-2xl bg-muted" />)}
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-20 bg-background rounded-3xl border border-border">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-1">Koleksi Lagu Kosong</h3>
              <p className="text-muted-foreground">Gunakan tombol Admin untuk menambah lagu pertama Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {songs.map(song => (
                <Link key={song.id} href={`/song/${song.slug}`} className="group">
                  <Card className="bg-background border border-border group-hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col justify-between overflow-hidden rounded-2xl">
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {song.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{song.artist}</p>
                      </div>
                      <div className="flex items-center gap-3 pt-4 border-t border-border mt-5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        <Clock className="w-4 h-4" />
                        <span>{song.bpm} BPM</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}