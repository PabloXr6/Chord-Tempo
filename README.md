🎸 Chord Tempo Setup Guide
Halo! Jika kamu ingin mencoba proyek ini, ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal kamu.

📋 Prasyarat
Pastikan kamu sudah menginstal:

Node.js (Versi 18 atau terbaru)

NPM atau Yarn

Akun Supabase (Gratis)

🛠️ Langkah 1: Instalasi Library
Buka terminal di folder proyek, lalu jalankan:

Bash
npm install
🔗 Langkah 2: Konfigurasi Supabase (Database)
Aplikasi ini membutuhkan database PostgreSQL dan Storage dari Supabase.

Buat Project Baru di Supabase Dashboard.

SQL Editor: Masuk ke menu SQL Editor dan jalankan perintah ini untuk membuat tabel:

SQL
-- Tabel Utama Lagu
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT,
  slug TEXT UNIQUE,
  bpm INTEGER DEFAULT 120,
  time_signature TEXT DEFAULT '4/4',
  audio_url TEXT, -- Link MP3 dari Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Artikel Chord (Lirik)
CREATE TABLE chord_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  content TEXT, -- Format: [C]Mimpi adalah [D]kunci
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
Storage Setup:

Pergi ke menu Storage.

Buat Bucket baru dengan nama song-tracks.

PENTING: Ubah akses Bucket menjadi Public.

Upload file .mp3 lagu kamu ke sini, lalu salin "Public URL"-nya ke kolom audio_url di tabel songs.

🔑 Langkah 3: Setup Environment Variables
Buat file baru bernama .env.local di root folder proyek.

Isi dengan API Key dari Supabase kamu (Cek di Settings > API):

Cuplikan kode
NEXT_PUBLIC_SUPABASE_URL=https://id-proyek-kamu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🚦 Langkah 4: Menjalankan Aplikasi
Setelah semua siap, jalankan perintah:

Bash
npm run dev
Buka http://localhost:3000 di browser kamu.

📝 Catatan Penting untuk Pengisian Data
Agar fitur Auto Scroll dan Metronom sinkron, pastikan data di tabel songs diisi dengan benar:

BPM: Isi sesuai tempo asli lagu (Gunakan fitur Tap Tempo di aplikasi untuk mengeceknya).

Audio URL: Pastikan link berakhiran .mp3 dan bisa diakses secara publik.

Format Chord: Gunakan kurung siku tepat di atas atau di depan lirik.

Contoh: [C]Menarilah dan [D]terus tertawa

🛠️ Troubleshooting
Suara Tidak Keluar? Cek apakah browser memblokir Autoplay. Klik area mana saja di halaman web sebelum menekan tombol Play.

Error CORS? Di Supabase, masuk ke Settings > API > API Settings, lalu tambahkan * atau http://localhost:3000 pada bagian Allowed Origins.

Selamat Ber-jamming! 🤘
