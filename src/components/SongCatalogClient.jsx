"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, ListPlus, CheckSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';

export default function SongCatalogClient({ songs }) {
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // STATE UNTUK PENCARIAN LOKAL
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSongSelection = (songId) => {
    setSelectedSongs((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSongs.length === filteredSongs.length) {
      setSelectedSongs([]); 
    } else {
      setSelectedSongs(filteredSongs.map((song) => song.id)); 
    }
  };

  // LOGIKA FILTERING REAL-TIME
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative pb-20">
      
      {/* HEADER & SEARCH BAR SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tighter text-foreground">Jelajahi Lagu</h2>
          <p className="text-lg text-muted-foreground">Pilih lagu dari katalog untuk langsung dimainkan dengan metronom.</p>
        </div>
        
        {/* Search Bar Interaktif */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari lagu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border focus-visible:ring-primary rounded-full h-10"
          />
        </div>
      </div>

      {/* TOMBOL SELECT ALL */}
      {filteredSongs.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            <CheckSquare className="w-4 h-4 mr-2" />
            {selectedSongs.length === filteredSongs.length && filteredSongs.length > 0 ? "Batal Pilih Semua" : "Pilih Semua"}
          </Button>
        </div>
      )}

      {/* GRID LAGU */}
      {filteredSongs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-background rounded-2xl border border-border border-dashed">
          {`Tidak ada lagu yang cocok dengan pencarian "${searchQuery}"`}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredSongs.map((song) => (
            <Card
              key={song.id}
              className={`relative group bg-background border transition-all duration-300 h-full flex flex-col justify-between overflow-hidden rounded-2xl ${
                selectedSongs.includes(song.id) 
                  ? 'border-primary ring-1 ring-primary shadow-lg shadow-primary/10' 
                  : 'border-border hover:border-primary/50 hover:-translate-y-2'
              }`}
            >
              <div
                className="absolute top-4 right-4 z-20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Checkbox
                  checked={selectedSongs.includes(song.id)}
                  onCheckedChange={() => toggleSongSelection(song.id)}
                  className="w-5 h-5"
                />
              </div>

              <Link href={`/song/${song.slug}`} className="h-full flex flex-col justify-between">
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight pr-6">
                      {song.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border mt-5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    <Clock className="w-4 h-4" />
                    <span>{song.bpm} BPM</span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* TOMBOL MELAYANG (ADD TO PLAYLIST) */}
      {selectedSongs.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in-0 duration-300">
          <Button
            size="lg"
            className="rounded-full shadow-2xl px-8 h-14 text-lg"
            onClick={() => setIsModalOpen(true)}
          >
            <ListPlus className="w-5 h-5 mr-2" />
            Tambahkan {selectedSongs.length} Lagu
          </Button>
        </div>
      )}

      {/* MODAL */}
      <AddToPlaylistModal
        open={isModalOpen}
        onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
          if (!isOpen) setSelectedSongs([]);
        }}
        selectedSongIds={selectedSongs}
      />
    </div>
  );
}