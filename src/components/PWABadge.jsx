import { useState } from 'react'
import { Download, WifiOff, X } from 'lucide-react'

export default function PWABadge({ onInstallApp, isInstalled, isOffline }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  // Banner Mode Offline
  if (isOffline) {
    return (
      <aside className="pwa-banner pwa-banner--offline" role="status" aria-live="polite">
        <div className="pwa-banner-text">
          <WifiOff size={18} />
          <span>
            <strong>Mode Offline Aktif</strong> — Anda tetap dapat melihat inventaris ekspedisi.
          </span>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setDismissed(true)}
          aria-label="Tutup notifikasi offline"
        >
          <X size={14} />
        </button>
      </aside>
    )
  }

  // Banner Instalasi PWA (selalu tampil jika belum ter-install agar tombol install tidak hilang)
  if (!isInstalled) {
    return (
      <aside className="pwa-banner" role="region" aria-label="Instalasi Aplikasi PWA">
        <div className="pwa-banner-text">
          <Download size={18} color="#e67e22" />
          <span>
            Install <strong>SummitGear</strong> ke layar beranda untuk akses cepat tanpa internet.
          </span>
        </div>
        <div className="pwa-banner-actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={onInstallApp}>
            <Download size={14} /> Install
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDismissed(true)}
            aria-label="Tutup banner instalasi"
          >
            <X size={14} />
          </button>
        </div>
      </aside>
    )
  }

  return null
}
