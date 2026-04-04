import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Send, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const RequestChordPage = () => {
  const [searchParams] = useSearchParams();
  const initialTitle = searchParams.get('title') || '';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    songTitle: initialTitle,
    artist: '',
    bpm: '',
    timeSignature: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        bpm: formData.bpm ? parseInt(formData.bpm) : null
      };

      await pb.collection('chordRequests').create(dataToSubmit, { $autoCancel: false });
      
      setSuccess(true);
      toast({ title: 'Request submitted successfully!' });
      setFormData({ songTitle: '', artist: '', bpm: '', timeSignature: '', notes: '' });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Request Chords - Chord Tempo</title>
        <meta name="description" content="Request chords and metronome settings for your favorite songs." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Request a Song</h1>
          <p className="text-lg text-muted-foreground">
            Can't find the song you're looking for? Let us know and we'll add it to our library.
          </p>
        </div>

        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="border-b border-border pb-6 mb-6">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Music className="w-6 h-6 text-primary" />
              Song Details
            </CardTitle>
            <CardDescription className="text-base">
              Provide as much information as you can to help us find the right version.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Request Sent!</h3>
                <p className="text-muted-foreground mb-8">
                  Thank you for your request. Our team will review it and add it to the library soon.
                </p>
                <Button onClick={() => setSuccess(false)} variant="outline">
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="songTitle">Song Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="songTitle"
                      required
                      value={formData.songTitle}
                      onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                      placeholder="e.g. Hotel California"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist</Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      placeholder="e.g. Eagles"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bpm">Estimated BPM</Label>
                    <Input
                      id="bpm"
                      type="number"
                      min="30"
                      max="300"
                      value={formData.bpm}
                      onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                      placeholder="e.g. 74"
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeSignature">Time Signature</Label>
                    <Input
                      id="timeSignature"
                      value={formData.timeSignature}
                      onChange={(e) => setFormData({ ...formData, timeSignature: e.target.value })}
                      placeholder="e.g. 4/4"
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any specific version, live performance, or key you prefer?"
                    rows={4}
                    className="bg-background border-border resize-none"
                  />
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RequestChordPage;