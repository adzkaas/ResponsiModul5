import { useState, useEffect } from 'react'
import {
  UserCheck,
  Save,
  CheckCircle,
  Camera,
  RotateCcw,
  Smartphone,
  HardDrive,
  Wifi,
} from 'lucide-react'
import userService, { DEFAULT_PROFILE } from '../services/userService'

export default function ProfilePage() {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [nama, setNama] = useState(profile.nama)
  const [nim, setNim] = useState(profile.nim)
  const [kelompok, setKelompok] = useState(profile.kelompok)
  const [prodi, setProdi] = useState(profile.prodi)
  const [bio, setBio] = useState(profile.bio)
  const [avatar, setAvatar] = useState(profile.avatar)
  const [savedMsg, setSavedMsg] = useState('')
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsStandalone(isStandaloneMode)
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setSavedMsg('Ukuran foto maksimal 2MB!')
      setTimeout(() => setSavedMsg(''), 3000)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setAvatar(base64)
      userService.updateAvatar(base64)
      setSavedMsg('Foto profil berhasil diperbarui.')
      setTimeout(() => setSavedMsg(''), 3000)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = (e) => {
    e.preventDefault()
    const updated = {
      ...profile,
      nama: nama.trim(),
      nim: nim.trim(),
      kelompok: kelompok.trim(),
      prodi: prodi.trim(),
      bio: bio.trim(),
      avatar,
    }
    const res = userService.saveUserProfile(updated)
    if (res.success) {
      setProfile(res.data)
      setSavedMsg('Data profil praktikan berhasil disimpan!')
      setTimeout(() => setSavedMsg(''), 3000)
    }
  }

  const handleResetProfile = () => {
    if (window.confirm('Kembalikan data profil praktikan ke pengaturan awal?')) {
      const def = userService.resetProfile()
      setProfile(def)
      setNama(def.nama)
      setNim(def.nim)
      setKelompok(def.kelompok)
      setProdi(def.prodi)
      setBio(def.bio)
      setAvatar(null)
      setSavedMsg('Profil dikembalikan ke default.')
      setTimeout(() => setSavedMsg(''), 3000)
    }
  }

  return (
    <div className="page">
      <section className="hero">
        <h1>Profil Praktikan PPB</h1>
        <p className="lede">
          Identitas pengembang aplikasi Progressive Web App (PWA) SummitGear — Basecamp Logistics.
        </p>
      </section>

      {savedMsg && (
        <div className="toast toast--success">
          <CheckCircle size={18} /> {savedMsg}
        </div>
      )}

      {/* Kartu Profil Utama */}
      <div className="profile-card">
        <div className="avatar-wrap">
          {avatar ? (
            <img src={avatar} alt={profile.nama} className="avatar-img" />
          ) : (
            <div className="avatar-placeholder">
              <UserCheck size={36} color="#ffffff" />
            </div>
          )}
          <label htmlFor="avatar-file-input" className="avatar-upload-btn" title="Ganti foto profil">
            <Camera size={14} />
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden-file-input"
            />
          </label>
        </div>

        <div className="profile-details">
          <h2>{profile.nama}</h2>
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">NIM</span>
              <span className="info-value mono-badge">{profile.nim}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Kelompok</span>
              <span className="info-value">{profile.kelompok}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Program Studi</span>
              <span className="info-value">{profile.prodi}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Peran</span>
              <span className="info-value">{profile.role}</span>
            </div>
          </div>
          <p className="profile-bio">{profile.bio}</p>
        </div>
      </div>

      {/* Widget Status Sistem & PWA */}
      <div className="diagnostics-card">
        <h3>Status Lingkungan PWA</h3>
        <div className="diag-grid">
          <div className="diag-item">
            <Smartphone size={18} color="#e67e22" />
            <div>
              <strong>Mode Tampilan</strong>
              <span>{isStandalone ? 'PWA Terpasang (Standalone)' : 'Browser Web Standar'}</span>
            </div>
          </div>

          <div className="diag-item">
            <HardDrive size={18} color="#2563eb" />
            <div>
              <strong>Persistensi Offline</strong>
              <span>localStorage + Service Worker Aktif</span>
            </div>
          </div>

          <div className="diag-item">
            <Wifi size={18} color="#16a34a" />
            <div>
              <strong>Koneksi Jaringan</strong>
              <span>{navigator.onLine ? 'Online (Terkoneksi)' : 'Offline (Bekerja Tanpa Internet)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulir Pembaruan Data Praktikan */}
      <form className="crud-form" onSubmit={handleSave}>
        <div className="crud-form-header">
          <h3>Perbarui Data Identitas</h3>
          <span className="form-sub-note">
            Sesuaikan data profil jika terdapat revisi identitas praktikan.
          </span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Nama Lengkap *</label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>NIM Praktikan *</label>
            <input
              type="text"
              required
              value={nim}
              onChange={(e) => setNim(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Kelompok *</label>
            <input
              type="text"
              required
              value={kelompok}
              onChange={(e) => setKelompok(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Program Studi &amp; Universitas</label>
            <input
              type="text"
              value={prodi}
              onChange={(e) => setProdi(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '14px' }}>
          <label>Keterangan / Bio Singkat</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="form-textarea"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={handleResetProfile}
            title="Reset profil ke nilai awal"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button type="submit" className="btn btn--primary">
            <Save size={16} /> Simpan Profil Praktikan
          </button>
        </div>
      </form>
    </div>
  )
}

