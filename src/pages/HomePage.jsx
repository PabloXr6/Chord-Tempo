import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Search, Music2, Clock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const HomePage = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('songs').getList(1, 50, {
        sort: '-updated',
        $autoCancel: false
      });
      
      // Filter out drafts based on description workaround
      const published = records.items.filter(s => {
        try {
          const desc = JSON.parse(s.description);
          return desc.status !== 'draft';
        } catch(e) {
          return true; // default to publish if no valid JSON
        }
      });
      
      setSongs(published);
    } catch (err) {
      console.error('Failed to fetch songs:', err);
      setError('Failed to load songs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const match = songs.find(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        navigate(`/lagu/${match.slug}`);
      }
    }
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Chord Tempo - Master Your Rhythm</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-destructive/20 z-0" />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full py-20">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-balance">
            Master Your <span className="text-primary">Rhythm</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The ultimate unified platform for chord charts and precise metronome practice.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a song or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-32 py-8 text-lg md:text-xl rounded-full bg-card/80 border-primary/30 focus-visible:ring-primary shadow-2xl backdrop-blur-md text-foreground"
            />
            <Button 
              type="submit" 
              size="lg" 
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-8 h-12"
            >
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Popular Songs Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Song Library</h2>
        </div>

        {error ? (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchSongs} className="ml-4">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32 rounded-2xl bg-card" />
            ))}
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No songs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map(song => (
              <Link key={song.id} to={`/lagu/${song.slug}`} className="group block">
                <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex-1 mb-6">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {song.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-1">{song.artist}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-primary">
                          <Clock className="w-4 h-4" />
                          <span>{song.defaultBPM} BPM</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-accent">
                          <Music2 className="w-4 h-4" />
                          <span>{song.timeSignature}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default HomePage;