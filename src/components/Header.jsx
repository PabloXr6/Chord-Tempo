"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu, Music, Plus, Search, ShieldCheck, ListMusic, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const Header = () => {
  const { isAuthenticated, logout, user, supabase } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchSongs = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
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
      setShowDropdown(true);
    }
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    const toastId = toast.loading('Sedang keluar...');
    
    try {
      await logout();
      toast.success('Berhasil logout!', { id: toastId });
    } catch (error) {
      console.error("Logout error:", error);
      // Tetap berikan kesan sukses ke user agar tidak bingung
      toast.success('Berhasil keluar.', { id: toastId });
    } finally {
      // BLOK FINALLY: Dieksekusi mutlak apapun yang terjadi di atas!
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    }
  };

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'U';

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
            <Link href="/playlists" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors">
              <ListMusic className="w-4 h-4 mr-2" /> Playlists
            </Link>
            {!isAuthenticated ? (
              <Button variant="outline" asChild className="rounded-full">
                <Link href="/login">Login</Link>
              </Button>
            ) : (
              <>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Admin Panel
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Admin Menu</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="cursor-pointer">
                          <Activity className="w-4 h-4 mr-2" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/songs" className="cursor-pointer">
                          <ListMusic className="w-4 h-4 mr-2" /> List Lagu
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/songs/new" className="cursor-pointer">
                          <Plus className="w-4 h-4 mr-2" /> Tambah Lagu
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {isAdmin ? 'Administrator' : 'User'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card border-l border-border w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
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
                          onClick={() => {
                            setSearchQuery('');
                            setIsMobileMenuOpen(false);
                          }}
                          className="block px-4 py-3 hover:bg-muted border-b border-border last:border-0"
                        >
                          <div className="font-semibold text-primary">{song.title}</div>
                          <div className="text-sm text-muted-foreground">{song.artist}</div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <nav className="flex flex-col space-y-2">
                    <Link href="/playlists" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center">
                      <ListMusic className="w-5 h-5 mr-3" /> Playlists
                    </Link>
                    {!isAuthenticated ? (
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                        Login
                      </Link>
                    ) : (
                      <>
                        {isAdmin && (
                          <>
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                              Admin Panel
                            </div>
                            <Link href="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center">
                              <Activity className="w-5 h-5 mr-3" /> Dashboard
                            </Link>
                            <Link href="/admin/songs" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center">
                              <ListMusic className="w-5 h-5 mr-3" /> List Lagu
                            </Link>
                            <Link href="/admin/songs/new" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center">
                              <Plus className="w-5 h-5 mr-3" /> Tambah Lagu
                            </Link>
                          </>
                        )}
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