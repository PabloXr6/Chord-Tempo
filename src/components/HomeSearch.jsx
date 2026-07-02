"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HomeSearch({ songs = [] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const match = songs.find(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        router.push(`/song/${match.slug}`);
      } else {
      }
    }
  };

  return (
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
  );
}