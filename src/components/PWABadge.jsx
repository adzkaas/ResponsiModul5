import { useState, useEffect } from 'react'
import { Download, WifiOff, X, Check } from 'lucide-react'

export default function PWABadge() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const onAppInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setInstallPrompt(null)
  }

  if (dismissed) return null

  // Banner Mode Offline
  if (isOffline) {
    return (
      <aside className="pwa-banner pwa-banner--offline" role="status" aria-live="polite">
        <div className="pwa-banner-text">
          <WifiOff size={18} />
          <span>
            <strong>Mode Offline Aktif</strong> — Anda tetap dapat melihat, menambah, dan mengedit
            inventaris ekspedisi.
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

  // Banner Instalasi PWA
  if (installPrompt && !installed) {
    return (
      <aside className="pwa-banner" role="region" aria-label="Instalasi Aplikasi PWA">
        <div className="pwa-banner-text">
          <Download size={18} color="#e67e22" />
          <span>
            Install <strong>SummitGear</strong> ke layar beranda untuk akses cepat tanpa internet.
          </span>
        </div>
        <div className="pwa-banner-actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={handleInstall}>
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

