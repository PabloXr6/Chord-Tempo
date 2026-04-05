# 🎸 Chord Tempo - Precision Metronome & Chord Interface

**Chord Tempo** adalah aplikasi web untuk musisi yang menggabungkan metronom presisi tinggi, pemutar audio, dan penampil chord otomatis. Proyek ini dibangun menggunakan **Next.js 15**, **Tailwind CSS**, dan **Supabase**.

---

## 🚀 Langkah-langkah Setup

Panduan ini dibuat untuk teman yang baru saja men-clone repo dan ingin menjalankan aplikasi secara lokal.

### 1. Clone Repository

Jalankan perintah berikut di terminal:

```bash
git clone https://github.com/<username>/chordtempo-next.git
cd chordtempo-next
```

### 2. Install Dependensi

Pastikan Node.js sudah terpasang (disarankan v18 atau lebih baru), lalu jalankan:

```bash
npm install
```

### 3. Siapkan Supabase

Aplikasi menggunakan Supabase untuk penyimpanan dan autentikasi.

1. Buka https://app.supabase.com dan buat proyek baru.
2. Salin `Project URL` dan `anon public key` dari halaman Settings -> API.
3. Buat tabel data jika diperlukan. Contoh struktur tabel sederhana:

```sql
create table songs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  artist text,x
  slug text unique,
  bpm integer default 120,
  time_signature text default '4/4',
  audio_url text,
  created_at timestamp with time zone default now()
);

create table chord_articles (
  id uuid primary key default uuid_generate_v4(),
  song_id uuid references songs(id) on delete cascade,
  content text,
  created_at timestamp with time zone default now()
);
```

4. Jika ingin menggunakan audio MP3 di Supabase Storage:
   - Buat bucket baru (misalnya `song-tracks`).
   - Atur bucket menjadi publik jika ingin mengakses file dari aplikasi.
   - Upload file `.mp3` dan gunakan URL publiknya pada kolom `audio_url` di tabel `songs`.

### 4. Buat `.env.local`

Di root folder proyek, buat file baru bernama `.env.local` dan isi nilai Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

> Jika menggunakan Supabase Auth atau fitur tambahan lain, periksa file `src/lib/pocketbaseClient.js` atau `src/utils/supabase/` untuk variabel environment tambahan.

### 5. Jalankan Aplikasi

Setelah semua selesai, jalankan server development:

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

### 6. Hal yang Perlu Dicek jika Gagal

- Pastikan `.env.local` ada di root proyek.
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sesuai dengan proyek Supabase.
- Jika ada masalah CORS, tambahkan `http://localhost:3000` ke daftar `Allowed Origins` di Supabase Settings -> API.
- Jika audio tidak muncul, pastikan URL file `.mp3` sudah benar dan bucket Storage bersifat publik.

---

## 📌 Catatan Tambahan

- Aplikasi menggunakan **Next.js App Router** dan file konfigurasi berada di `src/app/`.
- Halaman utama berada di `src/app/page.js`.
- Komponen UI utama berada di `src/components/`.
- Jika kamu ingin menambahkan lagu baru, isi data di tabel `songs` dan `chord_articles`.

---

## 💡 Cara Menjalankan di Production

Untuk build production:

```bash
npm run build
npm run start
```

Selamat mencoba! Jika butuh bantuan, tinggal tanya lagi. 😊
