-- ============================================================================
-- SQL Setup untuk SummitGear — Basecamp Logistics PWA
-- Jalankan query ini di SQL Editor dashboard Supabase Anda.
-- ============================================================================

-- 1. Buat Tabel `gears`
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

-- 3. Kebijakan RLS (Public Access untuk Anon / Publishable Key Praktikum)
-- Mengizinkan pembacaan data publik
CREATE POLICY "Allow public read access"
ON public.gears
FOR SELECT
USING (true);

-- Mengizinkan penambahan data baru
CREATE POLICY "Allow public insert access"
ON public.gears
FOR INSERT
WITH CHECK (true);

-- Mengizinkan pembaruan data
CREATE POLICY "Allow public update access"
ON public.gears
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Mengizinkan penghapusan data
CREATE POLICY "Allow public delete access"
ON public.gears
FOR DELETE
USING (true);

-- 4. Seed Data Awal (Perlengkapan Gunung Ekspedisi)
INSERT INTO public.gears (name, category, weight_gram, stock, condition, notes, specs)
VALUES
  (
    'Tenda Dome Ultralight 2P',
    'Shelter',
    1850,
    4,
    'Layak Pakai',
    'Frame aluminium alloy 7001, double layer waterproof PU 3000mm, pasak 10 pcs.',
    ARRAY['Kapasitas: 2 Orang', 'Bahan: Ripstop Nylon 20D', 'Waterproof: 3000mm PU']
  ),
  (
    'Carrier 60L + Raincover Ultralight',
    'Tas & Carrier',
    1600,
    6,
    'Layak Pakai',
    'Backsystem ergonomis jaring sirkulasi udara, hip-belt empuk dengan kantong ganda.',
    ARRAY['Volume: 60 Liter', 'Material: Cordura 420D', 'Tipe: Torso Adjustable']
  ),
  (
    'Kompor Portable Windproof Ultralight',
    'Logistik Masak',
    320,
    8,
    'Layak Pakai',
    'Pemantik piezo aktif, pelindung angin terintegrasi, kompatibel tabung ulir/Hi-Cook.',
    ARRAY['Daya: 3500W', 'Material: Stainless Steel + Tembaga', 'Bobot: 320g']
  ),
  (
    'Headlamp LED 400 Lumens IPX4',
    'Navigasi & Cahaya',
    95,
    10,
    'Perlu Cek Baterai',
    'Mode cahaya putih fokus, flood, dan merah darurat SOS. Baterai isi ulang type-C.',
    ARRAY['Output: 400 Lumens', 'Jarak Sorot: 80 meter', 'Rating Air: IPX4']
  ),
  (
    'Sleeping Bag Bulu Angsa (-5°C)',
    'Shelter',
    750,
    5,
    'Layak Pakai',
    'Isian down fill-power 700, kompresi kecil seukuran botol air 1 liter.',
    ARRAY['Limit Temp: -5 Celcius', 'Fill Power: 700 FP', 'Model: Mummy']
  ),
  (
    'First Aid Kit Expedition Pro',
    'P3K & Safety',
    420,
    12,
    'Layak Pakai',
    'Lengkap dengan perban steril, povidone, plester medis, thermal emergency blanket, gunting trauma.',
    ARRAY['Isi: 45 item medis', 'Kemasan: Pouch Cordura Tahan Air']
  );
