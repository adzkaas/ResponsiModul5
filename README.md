# SummitGear — Basecamp Logistics PWA
> **Aplikasi Progressive Web App (PWA) Manajemen Inventaris & Logistik Ekspedisi Gunung (Offline-First)**  
> Dibuat untuk memenuhi tugas **Responsi Modul 5 Praktikum Pemrograman Perangkat Bergerak (PPB)**.

---

## 📌 Identitas Praktikan
- **Nama Lengkap**: Abdurrahman Adzka Asy Syauqi
- **NIM**: 21120124130045
- **Kelompok**: Kelompok 15 (Shift 03)
- **Program Studi**: S1 Teknik Komputer
- **Fakultas / Universitas**: Fakultas Teknik, Universitas Diponegoro

---

## 🚀 Fitur Utama & Pemenuhan Syarat Responsi

| Syarat Responsi | Status | Implementasi pada SummitGear |
| :--- | :---: | :--- |
| **Minimal 3 Halaman Navigasi** | ✅ Terpenuhi (4 Halaman) | 1. **Katalog Alat** (`CatalogPage`)<br>2. **Inventaris CRUD** (`InventoryPage`)<br>3. **Checklist Misi Ekspedisi** (`ChecklistPage`)<br>4. **Profil Praktikan** (`ProfilePage`) |
| **Halaman Profil Praktikan** | ✅ Terpenuhi | Menampilkan Nama, NIM, Kelompok, Prodi, Peran, foto avatar upload (Base64), dan widget diagnostik status PWA. |
| **Halaman CRUD Fungsional** | ✅ Terpenuhi | Operasi **Create** (Tambah alat baru), **Read** (Tabel & list responsif), **Update** (Edit data perlengkapan), dan **Delete** (Hapus dengan modal konfirmasi), plus fitur **Reset Default**. |
| **Fungsionalitas PWA** | ✅ Terpenuhi | - **Web App Manifest** lengkap dengan ikon maskable/SVG.<br>- **Service Worker (Workbox)** meng-cache aset secara otomatis.<br>- **Installable**: Tombol install muncul otomatis (`beforeinstallprompt`).<br>- **Offline-First**: Bekerja 100% saat tidak ada internet dengan fallback localStorage. |
| **Integrasi Supabase & Deployment Vercel** | ✅ Terpenuhi | REST API Supabase PostgREST dengan Axios Interceptors + konfigurasi `vercel.json` untuk SPA routing. |

---

## 🛠️ Arsitektur & Teknologi

Aplikasi ini dibangun menggunakan arsitektur modular yang sama persis dengan Modul 5 Praktikum PPB:
- **Core Framework**: React 19 + Vite 8
- **PWA Engine**: `vite-plugin-pwa` (Workbox Service Worker + Manifest generator)
- **Icons**: Lucide React
- **HTTP Client**: Axios (dengan Interceptor penanganan token Supabase dan normalisasi error)
- **Database / Backend**: Supabase Cloud (PostgREST API table `gears`)
- **Offline Persistence**: LocalStorage Cache Fallback (`gearService.js` secara otomatis menyimpan dan membaca data lokal jika jaringan terputus atau backend tidak terjangkau)
- **Styling**: CSS Modern responsif dengan tema Basecamp & Outdoor Mountaineering

---

## 📂 Struktur Direktori Proyek

```plaintext
summitgear-pwa/
├── public/
│   ├── icon.svg             # Vektor icon gunung & kompas
│   ├── icon-192.png         # Icon PWA 192x192
│   └── icon-512.png         # Icon PWA 512x512 maskable
├── src/
│   ├── components/
│   │   ├── modals/
│   │   │   ├── ConfirmModal.jsx     # Dialog konfirmasi aksi berbahaya (Hapus / Reset)
│   │   │   └── GearDetailModal.jsx  # Dialog modal inspeksi spesifikasi lengkap alat
│   │   ├── Footer.jsx               # Footer informasi praktikum & hak cipta
│   │   ├── Header.jsx               # Navbar navigasi 4 halaman + status chip sync
│   │   └── PWABadge.jsx             # Notifikasi instalasi PWA & banner mode offline
│   ├── config/
│   │   └── api.js                   # Konfigurasi Axios + Supabase Header Interceptor
│   ├── data/
│   │   └── initialGears.js          # Data awal bawaan inventaris ekspedisi
│   ├── hooks/
│   │   └── useGear.js               # Custom hook sinkronisasi state React dengan backend/cache
│   ├── pages/
│   │   ├── CatalogPage.jsx          # Halaman 1: Showcase, Search, Category Filter, Stats
│   │   ├── InventoryPage.jsx        # Halaman 2: Kelola CRUD Fungsional
│   │   ├── ChecklistPage.jsx        # Halaman 3: Packing Checklist & Kalkulasi Beban
│   │   └── ProfilePage.jsx          # Halaman 4: Profil Praktikan (Nama, NIM, Kelompok)
│   ├── services/
│   │   ├── gearService.js           # Layer Service CRUD (Supabase PostgREST + LocalStorage Fallback)
│   │   └── userService.js           # Layer Service Profil Pengguna / Praktikan
│   ├── App.css                      # Styling modular tema Basecamp Logistics
│   ├── App.jsx                      # Root controller navigasi SPA
│   └── main.jsx                     # Entry point React
├── .env                             # Environment variable lokal
├── .env.example                     # Contoh template env
├── index.html                       # HTML shell dengan PWA meta tags
├── package.json                     # Daftar dependencies proyek
├── supabase_setup.sql               # Script SQL pembuatan tabel & RLS Supabase
├── vercel.json                      # Konfigurasi rewrite SPA & caching Vercel
└── vite.config.js                   # Konfigurasi Vite & VitePWA Workbox
```

---

## 🗄️ Panduan Lengkap Setup Supabase

Aplikasi ini dapat langsung terhubung ke database cloud Supabase melalui REST API PostgREST.

### Langkah 1: Buat Proyek Baru di Supabase
1. Buka [https://supabase.com/](https://supabase.com/) dan lakukan login / registrasi.
2. Klik tombol **New Project**.
3. Masukkan nama project (contoh: `summitgear-pwa`), buat password database, dan pilih region terdekat (misal: `Singapore`).
4. Tunggu beberapa saat hingga project selesai di-provisioning.

### Langkah 2: Eksekusi SQL Script
1. Di menu sidebar kiri dashboard Supabase, klik **SQL Editor**.
2. Klik **New query**.
3. Buka file `supabase_setup.sql` yang ada di root repository ini, salin seluruh kodenya, dan tempel di SQL Editor Supabase:
   ```sql
   -- 1. Buat Tabel gears
   CREATE TABLE IF NOT EXISTS public.gears (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name TEXT NOT NULL,
       category TEXT NOT NULL DEFAULT 'Shelter',
       weight_gram INTEGER NOT NULL DEFAULT 500,
       stock INTEGER NOT NULL DEFAULT 1,
       condition TEXT NOT NULL DEFAULT 'Layak Pakai',
       notes TEXT DEFAULT '',
       specs TEXT[] DEFAULT '{}'::TEXT[],
       image_url TEXT DEFAULT '',
       created_at TIMESTAMPTZ DEFAULT NOW(),
       updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- 2. Aktifkan Row Level Security (RLS)
   ALTER TABLE public.gears ENABLE ROW LEVEL SECURITY;

   -- 3. Kebijakan RLS (Public Access untuk Anon Key Praktikum)
   CREATE POLICY "Allow public read access" ON public.gears FOR SELECT USING (true);
   CREATE POLICY "Allow public insert access" ON public.gears FOR INSERT WITH CHECK (true);
   CREATE POLICY "Allow public update access" ON public.gears FOR UPDATE USING (true) WITH CHECK (true);
   CREATE POLICY "Allow public delete access" ON public.gears FOR DELETE USING (true);

   -- 4. Seed Data Awal
   INSERT INTO public.gears (name, category, weight_gram, stock, condition, notes, specs)
   VALUES
     ('Tenda Dome Ultralight 2P', 'Shelter', 1850, 4, 'Layak Pakai', 'Frame aluminium alloy 7001, double layer waterproof PU 3000mm.', ARRAY['Kapasitas: 2 Orang', 'Bahan: Ripstop Nylon 20D']),
     ('Carrier 60L + Raincover Ultralight', 'Tas & Carrier', 1600, 6, 'Layak Pakai', 'Backsystem ergonomis jaring sirkulasi udara.', ARRAY['Volume: 60 Liter', 'Material: Cordura 420D']),
     ('Kompor Portable Windproof Ultralight', 'Logistik Masak', 320, 8, 'Layak Pakai', 'Pemantik piezo aktif, kompatibel tabung ulir/Hi-Cook.', ARRAY['Daya: 3500W', 'Material: Stainless Steel']),
     ('Headlamp LED 400 Lumens IPX4', 'Navigasi & Cahaya', 95, 10, 'Perlu Cek Baterai', 'Mode cahaya putih fokus dan merah darurat SOS.', ARRAY['Output: 400 Lumens', 'Rating Air: IPX4']),
     ('Sleeping Bag Bulu Angsa (-5°C)', 'Shelter', 750, 5, 'Layak Pakai', 'Isian down fill-power 700, kompresi kecil.', ARRAY['Limit Temp: -5 Celcius', 'Fill Power: 700 FP']),
     ('First Aid Kit Expedition Pro', 'P3K & Safety', 420, 12, 'Layak Pakai', 'Lengkap dengan perban steril, povidone, thermal blanket.', ARRAY['Isi: 45 item medis']);
   ```
4. Klik tombol **Run** (atau tekan `Ctrl + Enter`). Pastikan muncul pesan `Success. No rows returned`.

### Langkah 3: Ambil Kredensial API Supabase
1. Di sidebar kiri, buka menu **Project Settings** (ikon gerigi) &rarr; **API**.
2. Salin nilai berikut:
   - **Project URL** (contoh: `https://xyzabcdefghijklm.supabase.co`)
   - **Project API keys** &rarr; cari bagian `anon` `public` (contoh: `eyJhbGciOiJIUzI1Ni...`)

### Langkah 4: Pasang di File `.env`
Buka file `.env` di proyek Anda dan masukkan:
```env
VITE_API_BASE_URL=https://xyzabcdefghijklm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Catatan: Jika `.env` dibiarkan kosong, aplikasi tidak akan crash — sistem otomatis berjalan dalam **Mode Offline-First** menggunakan localStorage bawaan).*

---

## 💻 Menjalankan Proyek Secara Lokal

1. **Masuk ke folder proyek**:
   ```bash
   cd summitgear-pwa
   ```

2. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka browser pada alamat `http://localhost:5173`.

3. **Uji Build Produksi & Service Worker PWA**:
   ```bash
   npm run build
   npm run preview
   ```
   Buka `http://localhost:4173`.

---

## 📱 Panduan Pengujian PWA (Install & Offline Testing)

### 1. Uji Instalasi Aplikasi (Installable PWA)
1. Buka browser **Google Chrome** atau **Microsoft Edge**.
2. Kunjungi URL aplikasi (`localhost` atau link Vercel).
3. Anda akan melihat:
   - Ikon install di address bar browser sebelah kanan (tanda monitor/panah ke bawah).
   - Banner pop-up PWA di pojok bawah: *"Install SummitGear ke layar beranda"*.
4. Klik tombol **Install**. Aplikasi akan terbuka sebagai aplikasi desktop/mobile standalone mandiri tanpa address bar browser.

### 2. Uji Mode Offline (Work Offline)
1. Buka **Chrome DevTools** (`F12` atau klik kanan &rarr; *Inspect*).
2. Pilih tab **Application** di bagian atas:
   - Klik **Manifest**: Pastikan Name, Short Name, Icons, dan theme color terbaca hijau/valid.
   - Klik **Service Workers**: Pastikan service worker bertuliskan status `Activated and is running`.
3. Pilih tab **Network**, lalu ubah dropdown dari *No throttling* menjadi **Offline**.
4. Lakukan refresh (`F5`):
   - Aplikasi **TIDAK AKAN MENAMPILKAN DINOSAURUS / NO INTERNET**.
   - Halaman tetap terbuka penuh dengan lancar.
   - Banner kuning muncul: *"Mode Offline Aktif"*.
   - Navigasi antar halaman (Katalog, CRUD, Checklist, Profil) tetap berjalan 100%.
   - Data inventaris tetap bisa dilihat, ditambah, diubah, maupun dihapus melalui offline cache!

---

## 🌐 Panduan Deployment ke Vercel

### Langkah 1: Push ke GitHub
Buka terminal di folder `summitgear-pwa` dan jalankan:
```bash
git init
git add .
git commit -m "feat: inisialisasi SummitGear PWA responsi modul 5"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/summitgear-pwa.git
git push -u origin main
```

### Langkah 2: Hubungkan & Deploy ke Vercel
1. Kunjungi [https://vercel.com/](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** &rarr; **Project**.
3. Cari repositori `summitgear-pwa`, lalu klik **Import**.
4. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_API_BASE_URL` : URL Supabase Anda
   - `VITE_SUPABASE_ANON_KEY` : Anon Key Supabase Anda
5. Klik **Deploy**.
6. Tunggu sekitar 1 menit hingga build selesai. Vercel akan menghasilkan domain aktif (misal: `https://summitgear-pwa.vercel.app`).
7. Salin link tersebut dan kumpulkan pada form responsi praktikum.
