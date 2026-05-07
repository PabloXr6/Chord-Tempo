"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Music2, Type, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { updateExistingSong } from '@/lib/SongUtils';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function EditSongPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    slug: '',
    bpm: 120,
    timeSignature: '4/4',
    audio_url: ''
  });
  const [chordContent, setChordContent] = useState('');

  // Load data awal lagu
  useEffect(() => {
    const fetchSongData = async () => {
      const supabase = createClient();
      try {
        // Ambil data lagu dan join dengan chord_articles
        const { data, error } = await supabase
          .from('songs')
          .select('*, chord_articles(content)')
          .eq('id', id)
          .single();

        if (error) throw error;

        setFormData({
          title: data.title,
          artist: data.artist,
          slug: data.slug,
          bpm: data.bpm,
          timeSignature: data.time_signature,
          audio_url: data.audio_url || ''
        });
        setChordContent(data.chord_articles?.[0]?.content || '');
      } catch (error) {
        toast.error("Gagal mengambil data lagu");
        router.push('/admin/songs');
      } finally {
        setLoading(false);
      }
    };

    fetchSongData();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateExistingSong(id, formData, chordContent);
      toast.success('Lagu berhasil diperbarui!');
      router.push('/admin/songs');
      router.refresh();
    } catch (error) {
      toast.error('Gagal memperbarui lagu');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat data lagu...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Batal
        </Button>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center"><Music2 className="w-5 h-5 mr-2" /> Detail Lagu</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Judul Lagu</Label>
                  <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Artis / Band</Label>
                  <Input required value={formData.artist} onChange={(e) => setFormData({...formData, artist: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>BPM</Label><Input type="number" value={formData.bpm} onChange={(e) => setFormData({...formData, bpm: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Birama</Label><Input value={formData.timeSignature} onChange={(e) => setFormData({...formData, timeSignature: e.target.value})} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Audio URL (Instrumental MP3)</Label>
                  <Input 
                    placeholder="https://.../song.mp3" 
                    value={formData.audio_url} 
                    onChange={(e) => setFormData({...formData, audio_url: e.target.value})}
                  />
                  <p className="text-[10px] text-muted-foreground italic">Kosongkan jika hanya ingin metronom saja.</p>
                </div>
              </CardContent>
            </Card>
            <Button type="submit" className="w-full h-12" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : <><Save className="w-5 h-5 mr-2" /> Simpan Perubahan</>}
            </Button>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader><CardTitle className="text-lg flex items-center"><Type className="w-5 h-5 mr-2" /> Edit Lirik & Chord</CardTitle></CardHeader>
              <CardContent>
                <Textarea 
                  className="min-h-[550px] font-mono text-sm"
                  value={chordContent}
                  onChange={(e) => setChordContent(e.target.value)}
                  required
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}