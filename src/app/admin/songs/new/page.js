"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Music2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { saveNewSong } from '@/lib/SongUtils';
import { toast } from 'sonner';

export default function NewSongPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    slug: '',
    bpm: 120,
    timeSignature: '4/4',
  });
  
  const [chordContent, setChordContent] = useState('');

  // Otomatis buat slug dari judul & artis
  const generateSlug = () => {
    const base = `${formData.title}-${formData.artist}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug: base }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Simpan ke database
      await saveNewSong(formData, chordContent);
      
      // 2. Tampilkan notifikasi sukses
      toast.success('Lagu berhasil ditambahkan! Silakan tambah lagu berikutnya.');
      
      // 3. RESET FORM: Kosongkan semua inputan agar siap untuk lagu baru
      setFormData({
        title: '',
        artist: '',
        slug: '',
        bpm: 120, // Kembalikan ke default
        timeSignature: '4/4' // Kembalikan ke default
      });
      
      // CATATAN: Jika Anda menggunakan state untuk chord, pastikan juga di-reset
      // Misalnya: setChordContent(''); 
      
      // 4. Matikan loading agar tombol bisa diklik lagi
      setLoading(false);
      
    } catch (error) {
      console.error("Detail Error:", error); 
      toast.error(error.message || 'Terjadi kesalahan sistem');
      
      // Matikan loading jika gagal, agar user bisa memperbaiki input
      setLoading(false); 
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kiri: Metadata Lagu */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Music2 className="w-5 h-5 mr-2 text-primary" /> Detail Lagu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Judul Lagu</Label>
                  <Input 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    onBlur={generateSlug}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Artis / Band</Label>
                  <Input 
                    required 
                    value={formData.artist} 
                    onChange={(e) => setFormData({...formData, artist: e.target.value})}
                    onBlur={generateSlug}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input 
                    required 
                    value={formData.slug} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default BPM</Label>
                    <Input 
                      type="number" 
                      value={formData.bpm} 
                      onChange={(e) => setFormData({...formData, bpm: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Birama</Label>
                    <Input 
                      value={formData.timeSignature} 
                      onChange={(e) => setFormData({...formData, timeSignature: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? 'Menyimpan...' : <><Save className="w-5 h-5 mr-2" /> Simpan Lagu</>}
            </Button>
          </div>

          {/* Kanan: Editor Chord */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Type className="w-5 h-5 mr-2 text-primary" /> Lirik & Chord
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Gunakan format [C] atau spasi di atas lirik..."
                  className="min-h-[500px] font-mono text-sm"
                  value={chordContent}
                  onChange={(e) => setChordContent(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-4 italic">
                  Tip: Chord yang dibungkus [ ] akan otomatis diwarnai oleh sistem.
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}