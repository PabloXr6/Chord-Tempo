"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { LogOut, Menu, Music, Plus, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const Header = () => {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const supabase = createClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logika Auto-Search ke Supabase
  useEffect(() => {
    const searchSongs = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        // Menggunakan ilike untuk pencarian case-insensitive di Supabase
        const { data, error } = await supabase
          .from('songs')
          .select('id, title, artist, slug')
          .ilike('title', `%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        
        setSearchResults(data || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const debounce = setTimeout(searchSongs, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, supabase]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && searchResults.length > 0) {
      router.push(`/song/${searchResults[0].slug}`);
      setShowDropdown(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <span className="tracking-tight hidden sm:block">Chord Tempo</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari lagu berdasarkan judul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary h-10 rounded-full"
              />
            </form>
            
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                {searchResults.map(song => (
                  <Link
                    key={song.id}
                    href={`/song/${song.slug}`}
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                    className="block px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0"
                  >
                    <div className="font-semibold text-primary">{song.title}</div>
                    <div className="text-sm text-muted-foreground">{song.artist}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 shrink-0">
            {!isAuthenticated ? (
              <Button variant="outline" asChild className="rounded-full">
                <Link href="/admin/login">Admin Login</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
                  <Link href="/admin/songs/new">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Lagu
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleLogout} className="rounded-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card border-l border-border w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-8">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Cari lagu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-muted/50 border-transparent rounded-full"
                    />
                  </form>
                  
                  {searchResults.length > 0 && searchQuery && (
                    <div className="bg-background rounded-xl border border-border overflow-hidden">
                      {searchResults.map(song => (
                        <Link
                          key={song.id}
                          href={`/song/${song.slug}`}
                          onClick={() => setSearchQuery('')}
                          className="block px-4 py-3 hover:bg-muted border-b border-border last:border-0"
                        >
                          <div className="font-semibold text-primary">{song.title}</div>
                          <div className="text-sm text-muted-foreground">{song.artist}</div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <nav className="flex flex-col space-y-2">
                    {!isAuthenticated ? (
                      <Link href="/admin/login" className="px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                        Admin Login
                      </Link>
                    ) : (
                      <>
                        <Link href="/admin/dashboard" className="px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center">
                          <ShieldCheck className="w-5 h-5 mr-3" /> Dashboard
                        </Link>
                        <Link href="/admin/songs/new" className="px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center">
                          <Plus className="w-5 h-5 mr-3" /> Tambah Lagu
                        </Link>
                        <button onClick={handleLogout} className="px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 text-left flex items-center">
                          <LogOut className="w-5 h-5 mr-3" /> Logout
                        </button>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;