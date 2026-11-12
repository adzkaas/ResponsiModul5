import { apiClient, IS_SUPABASE } from '../config/api'

export const DEFAULT_PROFILE = {
  nama: 'Abdurrahman Adzka Asy Syauqi',
  nim: '21120124130045',
  kelompok: 'Kelompok 15 — Shift 03',
  prodi: 'S1 Teknik Komputer — Universitas Diponegoro',
  role: 'Logistics Officer & Frontend Engineer',
  bio: 'Pengembang aplikasi Progressive Web App (PWA) SummitGear — Basecamp Logistics untuk Responsi Modul 5 Praktikum Pemrograman Perangkat Bergerak.',
  avatar: null,
}

class UserService {
  /**
   * Mengambil data profil praktikan langsung dari Supabase tabel `profiles`
   */
  async getUserProfile() {
    if (IS_SUPABASE) {
      try {
        const data = await apiClient.get('/rest/v1/profiles?select=*&limit=1')
        if (Array.isArray(data) && data.length > 0) {
          const row = data[0]
          return {
            id: row.id,
            nama: row.nama || DEFAULT_PROFILE.nama,
            nim: row.nim || DEFAULT_PROFILE.nim,
            kelompok: row.kelompok || DEFAULT_PROFILE.kelompok,
            prodi: row.prodi || DEFAULT_PROFILE.prodi,
            role: row.role || DEFAULT_PROFILE.role,
            bio: row.bio || DEFAULT_PROFILE.bio,
            avatar: row.avatar_url || null,
          }
        }
      } catch (err) {
        console.warn('[userService] Gagal memuat profil dari Supabase:', err.message)
      }
    }

    // Fallback awal jika tabel profiles belum dibuat di Supabase
    try {
      const local = localStorage.getItem('summitgear_student_profile')
      if (local) return { ...DEFAULT_PROFILE, ...JSON.parse(local) }
    } catch {}
    return DEFAULT_PROFILE
  }

  /**
   * Menyimpan / memperbarui profil praktikan langsung di Supabase
   */
  async saveUserProfile(profile) {
    // Simpan juga ke local storage sebagai backup cepat
    localStorage.setItem('summitgear_student_profile', JSON.stringify(profile))

    if (IS_SUPABASE) {
      try {
        const payload = {
          nama: profile.nama.trim(),
          nim: profile.nim.trim(),
          kelompok: profile.kelompok.trim(),
          prodi: profile.prodi?.trim() || DEFAULT_PROFILE.prodi,
          role: profile.role?.trim() || DEFAULT_PROFILE.role,
          bio: profile.bio?.trim() || '',
          avatar_url: profile.avatar || null,
          updated_at: new Date().toISOString(),
        }

        // Cek apakah data profil sudah ada di Supabase
        const existing = await apiClient.get('/rest/v1/profiles?select=id&limit=1')

        if (Array.isArray(existing) && existing.length > 0) {
          const targetId = existing[0].id
          const res = await apiClient.patch(`/rest/v1/profiles?id=eq.${targetId}`, payload, {
            headers: { Prefer: 'return=representation' },
          })
          const updated = Array.isArray(res) ? res[0] : res
          return { success: true, data: { ...profile, id: updated.id } }
        } else {
          // Insert data baru
          const res = await apiClient.post('/rest/v1/profiles', payload, {
            headers: { Prefer: 'return=representation' },
          })
          const created = Array.isArray(res) ? res[0] : res
          return { success: true, data: { ...profile, id: created.id } }
        }
      } catch (err) {
        console.warn('[userService] Gagal menyimpan ke Supabase:', err.message)
        return { success: true, data: profile }
      }
    }

    return { success: true, data: profile }
  }

  async updateAvatar(avatarBase64) {
    const profile = await this.getUserProfile()
    profile.avatar = avatarBase64
    return this.saveUserProfile(profile)
  }

  resetProfile() {
    localStorage.removeItem('summitgear_student_profile')
    return DEFAULT_PROFILE
  }
}

export default new UserService()
