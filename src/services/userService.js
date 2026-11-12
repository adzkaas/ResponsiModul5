const USER_PROFILE_KEY = 'summitgear_student_profile'

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
  getUserProfile() {
    try {
      const raw = localStorage.getItem(USER_PROFILE_KEY)
      if (raw) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
      }
    } catch {
      // Fallback ke profil default jika parsing error
    }
    return DEFAULT_PROFILE
  }

  saveUserProfile(profile) {
    try {
      const updated = {
        ...profile,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated))
      return { success: true, data: updated }
    } catch (err) {
      return { success: false, message: err.message }
    }
  }

  updateAvatar(avatarBase64) {
    const profile = this.getUserProfile()
    profile.avatar = avatarBase64
    return this.saveUserProfile(profile)
  }

  resetProfile() {
    localStorage.removeItem(USER_PROFILE_KEY)
    return DEFAULT_PROFILE
  }
}

export default new UserService()
