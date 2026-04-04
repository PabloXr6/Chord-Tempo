# 🎸 Chord Tempo - Precision Metronome & Chord Interface

**Chord Tempo** adalah aplikasi web interaktif untuk musisi yang menggabungkan metronom presisi tinggi, pemutar audio sinkron dari Supabase, dan penampil chord otomatis. Proyek ini dibangun menggunakan **Next.js 15**, **Tailwind CSS**, dan **Supabase**.

---

## 🚀 Langkah-langkah Setup (Untuk Developer Baru)

Jika kamu baru saja melakukan `git clone`, ikuti panduan di bawah ini agar aplikasi berjalan sempurna di komputer lokalmu.

### 1. Instalasi Dependensi
Pastikan kamu sudah menginstal Node.js (v18+). Buka terminal di root folder proyek dan jalankan:
```bash
npm install
2. Konfigurasi Database (Supabase)
Buat proyek baru di Supabase Dashboard.

Jalankan Query SQL berikut di SQL Editor untuk membuat tabel:

SQL
-- Tabel Utama Lagu
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT,
  slug TEXT UNIQUE,
  bpm INTEGER DEFAULT 120,
  time_signature TEXT DEFAULT '4/4',
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Artikel Chord (Lirik)
CREATE TABLE chord_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
3. Setup Storage (Untuk Audio MP3)
Masuk ke menu Storage di Supabase.

Buat Bucket baru bernama song-tracks.

PENTING: Klik kanan pada bucket tersebut -> Make Public.

Upload file .mp3 lagu kamu ke sana.

Salin Public URL file tersebut dan masukkan ke kolom audio_url di tabel songs.

4. Konfigurasi Environment Variables
Buat file baru bernama .env.local di root folder proyek dan masukkan API Key Supabase kamu:

Cuplikan kode
NEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
5. Menjalankan Aplikasi
Setelah semua siap, jalankan server development:

Bash
npm run dev
Buka http://localhost:3000 di browsermu.

✨ Fitur Utama
Precision Metronome Engine: Menggunakan Web Audio API untuk ketukan yang akurat tanpa lagging.

Audio Mixer: Kontrol volume metronom dan volume lagu MP3 secara terpisah.

Sync Offset: Menyesuaikan delay (ms) agar ketukan lagu dan metronom sinkron.

Interactive Chord Display:

Transpose: Ubah nada dasar (Key) secara instan.

Auto Scroll: Layar bergeser otomatis mengikuti BPM lagu.

Font Scaling: Atur ukuran teks chord untuk visibilitas.

📝 Panduan Penulisan Chord
Gunakan format kurung siku [] pada kolom content di tabel chord_articles.

Contoh:

Plaintext
[A]Mimpi adalah [D]kunci
[Bm]Untuk kita [E]menaklukkan dunia
⚠️ Troubleshooting
Suara Tidak Keluar? Klik area mana saja di halaman web sebelum menekan tombol Play.

Error CORS? Di Supabase -> Settings -> API, tambahkan http://localhost:3000 ke Allowed Origins.

### Tips Terakhir:
Setelah file ini disimpan sebagai `README.md`, saat kamu meng-upload (push) ke GitHub, halaman depan repositori kamu akan otomatis berubah menjadi tampilan yang rapi lengkap dengan logo, format kode, dan poin-poin fitur tersebut. 🤘🚀