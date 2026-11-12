-- ============================================================================
-- SQL Setup Lengkap SummitGear — Basecamp Logistics PWA
-- Jalankan seluruh script ini di SQL Editor dashboard Supabase Anda.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABEL UTAMA: gears (Inventaris Perlengkapan & Logistik Gunung)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. TABEL PROFIL: profiles (Identitas Praktikan & Pengembang)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    nim TEXT NOT NULL,
    kelompok TEXT NOT NULL,
    prodi TEXT NOT NULL DEFAULT 'S1 Teknik Komputer — Universitas Diponegoro',
    role TEXT DEFAULT 'Logistics Officer & Frontend Engineer',
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. TABEL CHECKLIST: checklists (Persiapan Pengepakan Carrier Misi)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gear_id UUID NOT NULL REFERENCES public.gears(id) ON DELETE CASCADE,
    is_packed BOOLEAN NOT NULL DEFAULT false,
    packed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_gear_checklist UNIQUE (gear_id)
);

-- ----------------------------------------------------------------------------
-- 4. TABEL REVIEW: reviews (Uji Kelayakan & Catatan Lapangan Peralatan)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gear_id UUID NOT NULL REFERENCES public.gears(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL DEFAULT 'Operator Basecamp',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. TABEL FAVORIT: favorites (Prioritas Peralatan Vital Ekspedisi)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gear_id UUID NOT NULL REFERENCES public.gears(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_gear_favorite UNIQUE (gear_id)
);

-- ============================================================================
-- PENGATURAN ROW LEVEL SECURITY (RLS) UNTUK SEMUA TABEL
-- Mengizinkan akses publik penuh (CRUD) menggunakan kunci anon Supabase
-- ============================================================================

-- RLS gears
ALTER TABLE public.gears ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gears_select_policy" ON public.gears;
DROP POLICY IF EXISTS "gears_insert_policy" ON public.gears;
DROP POLICY IF EXISTS "gears_update_policy" ON public.gears;
DROP POLICY IF EXISTS "gears_delete_policy" ON public.gears;
CREATE POLICY "gears_select_policy" ON public.gears FOR SELECT USING (true);
CREATE POLICY "gears_insert_policy" ON public.gears FOR INSERT WITH CHECK (true);
CREATE POLICY "gears_update_policy" ON public.gears FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "gears_delete_policy" ON public.gears FOR DELETE USING (true);

-- RLS profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE USING (true);

-- RLS checklists
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checklists_select_policy" ON public.checklists;
DROP POLICY IF EXISTS "checklists_insert_policy" ON public.checklists;
DROP POLICY IF EXISTS "checklists_update_policy" ON public.checklists;
DROP POLICY IF EXISTS "checklists_delete_policy" ON public.checklists;
CREATE POLICY "checklists_select_policy" ON public.checklists FOR SELECT USING (true);
CREATE POLICY "checklists_insert_policy" ON public.checklists FOR INSERT WITH CHECK (true);
CREATE POLICY "checklists_update_policy" ON public.checklists FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "checklists_delete_policy" ON public.checklists FOR DELETE USING (true);

-- RLS reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_select_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_policy" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON public.reviews;
CREATE POLICY "reviews_select_policy" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_policy" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_update_policy" ON public.reviews FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "reviews_delete_policy" ON public.reviews FOR DELETE USING (true);

-- RLS favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "favorites_select_policy" ON public.favorites;
DROP POLICY IF EXISTS "favorites_insert_policy" ON public.favorites;
DROP POLICY IF EXISTS "favorites_delete_policy" ON public.favorites;
CREATE POLICY "favorites_select_policy" ON public.favorites FOR SELECT USING (true);
CREATE POLICY "favorites_insert_policy" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "favorites_delete_policy" ON public.favorites FOR DELETE USING (true);

-- ============================================================================
-- SEED DATA AWAL (JIKA TABEL MASIH KOSONG)
-- ============================================================================

-- 1. Seed Profil Praktikan
INSERT INTO public.profiles (nama, nim, kelompok, prodi, role, bio)
SELECT 
  'Abdurrahman Adzka Asy Syauqi',
  '21120124130045',
  'Kelompok 15 — Shift 03',
  'S1 Teknik Komputer — Universitas Diponegoro',
  'Logistics Officer & Frontend Engineer',
  'Pengembang aplikasi Progressive Web App (PWA) SummitGear — Basecamp Logistics untuk Responsi Modul 5 Praktikum Pemrograman Perangkat Bergerak.'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles);

-- 2. Seed Data Perlengkapan Gunung (Hanya jika tabel gears masih kosong)
INSERT INTO public.gears (name, category, weight_gram, stock, condition, notes, specs)
SELECT 'Tenda Dome Ultralight 2P', 'Shelter', 1850, 4, 'Layak Pakai', 'Frame aluminium alloy 7001, double layer waterproof PU 3000mm, pasak 10 pcs.', ARRAY['Kapasitas: 2 Orang', 'Bahan: Ripstop Nylon 20D', 'Waterproof: 3000mm PU']
WHERE NOT EXISTS (SELECT 1 FROM public.gears);

INSERT INTO public.gears (name, category, weight_gram, stock, condition, notes, specs)
SELECT 'Carrier 60L + Raincover Ultralight', 'Tas & Carrier', 1600, 6, 'Layak Pakai', 'Backsystem ergonomis jaring sirkulasi udara, hip-belt empuk dengan kantong ganda.', ARRAY['Volume: 60 Liter', 'Material: Cordura 420D', 'Tipe: Torso Adjustable']
WHERE NOT EXISTS (SELECT 1 FROM public.gears WHERE name = 'Carrier 60L + Raincover Ultralight');

INSERT INTO public.gears (name, category, weight_gram, stock, condition, notes, specs)
SELECT 'Kompor Portable Windproof Ultralight', 'Logistik Masak', 320, 8, 'Layak Pakai', 'Pemantik piezo aktif, pelindung angin terintegrasi, kompatibel tabung ulir/Hi-Cook.', ARRAY['Daya: 3500W', 'Material: Stainless Steel + Tembaga', 'Bobot: 320g']
WHERE NOT EXISTS (SELECT 1 FROM public.gears WHERE name = 'Kompor Portable Windproof Ultralight');

INSERT INTO public.gears (name, category, weight_gram, stock, condition, notes, specs)
SELECT 'Headlamp LED 400 Lumens IPX4', 'Navigasi & Cahaya', 95, 10, 'Perlu Cek Baterai', 'Mode cahaya putih fokus, flood, dan merah darurat SOS. Baterai isi ulang type-C.', ARRAY['Output: 400 Lumens', 'Jarak Sorot: 80 meter', 'Rating Air: IPX4']
WHERE NOT EXISTS (SELECT 1 FROM public.gears WHERE name = 'Headlamp LED 400 Lumens IPX4');

INSERT INTO public.gears (name, category, weight_gram, stock, condition, notes, specs)
SELECT 'Sleeping Bag Bulu Angsa (-5°C)', 'Shelter', 750, 5, 'Layak Pakai', 'Isian down fill-power 700, kompresi kecil seukuran botol air 1 liter.', ARRAY['Limit Temp: -5 Celcius', 'Fill Power: 700 FP', 'Model: Mummy']
WHERE NOT EXISTS (SELECT 1 FROM public.gears WHERE name = 'Sleeping Bag Bulu Angsa (-5°C)');

INSERT INTO public.gears (name, category, weight_gram, stock, condition, notes, specs)
SELECT 'First Aid Kit Expedition Pro', 'P3K & Safety', 420, 12, 'Layak Pakai', 'Lengkap dengan perban steril, povidone, plester medis, thermal emergency blanket, gunting trauma.', ARRAY['Isi: 45 item medis', 'Kemasan: Pouch Cordura Tahan Air']
WHERE NOT EXISTS (SELECT 1 FROM public.gears WHERE name = 'First Aid Kit Expedition Pro');
