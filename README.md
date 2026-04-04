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
Proyek ini menggunakan Supabase untuk menyimpan data lagu dan file audio.

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
Agar musik bisa diputar:

Masuk ke menu Storage di Supabase.

Buat Bucket baru bernama song-tracks.

PENTING: Klik kanan pada bucket tersebut -> Make Public.

Upload file .mp3 lagu kamu ke sana.

Salin Public URL file tersebut dan masukkan ke kolom audio_url di tabel songs pada baris lagu yang bersangkutan.

4. Konfigurasi Environment Variables
Buat file baru bernama .env.local di root folder proyek (sejajar dengan package.json) dan masukkan API Key Supabase kamu:

Cuplikan kode
NEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
5. Menjalankan Aplikasi
Setelah semua siap, jalankan server development:

Bash
npm run dev
Buka http://localhost:3000 di browsermu.

✨ Fitur Utama
Precision Metronome Engine: Menggunakan Web Audio API untuk ketukan yang sangat akurat tanpa lagging.

Audio Mixer: Kontrol volume metronom dan volume lagu MP3 secara terpisah.

Sync Offset: Fitur untuk menyesuaikan delay (ms) jika ketukan lagu dan metronom belum pas.

Interactive Chord Display:

Transpose: Ubah nada dasar (Key) seluruh chord secara instan.

Auto Scroll: Layar chord bergeser otomatis mengikuti BPM lagu saat tombol Play ditekan.

Font Scaling: Atur ukuran teks chord untuk visibilitas saat latihan.

📝 Panduan Penulisan Chord
Agar fitur Transpose dan pewarnaan chord berfungsi, tuliskan chord di dalam kurung siku [] pada kolom content di tabel chord_articles.

Contoh Format:

Plaintext
[Intro]
[A]  [D]  [A]  [D]

[Verse]
[A]Mimpi adalah [D]kunci
[Bm]Untuk kita [E]menaklukkan dunia
⚠️ Troubleshooting
Suara Tidak Keluar? Browser memblokir suara otomatis. Klik area mana saja di halaman web terlebih dahulu sebelum menekan tombol Play.

Error CORS? Di Supabase Dashboard, masuk ke Settings -> API, lalu tambahkan http://localhost:3000 ke bagian Allowed Origins.

Metronom & Lagu Tidak Pas? Gunakan slider Sync Offset di bagian Mixer Audio untuk menyelaraskannya.
