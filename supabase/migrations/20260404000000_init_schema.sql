-- 1. Tabel Sound Library (Opsional, jika Anda menggunakan file suara custom)
CREATE TABLE public.sound_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Songs (Katalog Lagu Utama)
CREATE TABLE public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    bpm INTEGER DEFAULT 120,
    time_signature TEXT DEFAULT '4/4',
    enable_accent BOOLEAN DEFAULT true,
    enable_subdivisions BOOLEAN DEFAULT false,
    downbeat_sound_id UUID REFERENCES public.sound_library(id) ON DELETE SET NULL,
    regular_beat_sound_id UUID REFERENCES public.sound_library(id) ON DELETE SET NULL,
    subdivision_sound_id UUID REFERENCES public.sound_library(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Chord Articles (Menyimpan Lirik & Chord)
CREATE TABLE public.chord_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Playlists (Menyambung ke auth.users bawaan Supabase)
CREATE TABLE public.playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Playlist Items (Tabel Relasi/Junction)
CREATE TABLE public.playlist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
    song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
    custom_bpm INTEGER,
    custom_time_signature TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-------------------------------------------------------------------
-- KEAMANAN: Mengaktifkan RLS (Row Level Security)
-------------------------------------------------------------------
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chord_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_library ENABLE ROW LEVEL SECURITY;

-- 1. Semua orang bisa melihat lagu, chord, dan pustaka suara
CREATE POLICY "Public can view songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Public can view chords" ON public.chord_articles FOR SELECT USING (true);
CREATE POLICY "Public can view sound library" ON public.sound_library FOR SELECT USING (true);

-- (Untuk menambahkan lagu via aplikasi, Anda bisa membuat policy INSERT khusus admin nanti)
CREATE POLICY "Authenticated users can insert songs" ON public.songs FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Pengguna HANYA bisa melihat, membuat, mengedit, dan menghapus Playlist miliknya sendiri
CREATE POLICY "Users manage own playlists" ON public.playlists
FOR ALL USING (auth.uid() = user_id);

-- 3. Pengguna HANYA bisa memanajemen item di dalam Playlist miliknya
CREATE POLICY "Users manage own playlist items" ON public.playlist_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE public.playlists.id = public.playlist_items.playlist_id
    AND public.playlists.user_id = auth.uid()
  )
);