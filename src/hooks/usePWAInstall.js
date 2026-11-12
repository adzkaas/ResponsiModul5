import { useState, useEffect, useCallback } from 'react'

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    // Cek apakah sudah berjalan dalam mode standalone (sudah ter-install)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (isStandalone) {
      setIsInstalled(true)
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setInstallPrompt(null)
      return outcome
    } else {
      // Browser tidak memicu prompt otomatis (misal sudah terpasang atau diakses via browser tertentu)
      alert(
        'Untuk meng-install SummitGear PWA ke perangkat:\n\n' +
          '• Di Chrome/Edge: Klik ikon Install (layar dengan panah ke bawah) di sebelah kanan address bar browser, atau buka Menu Browser (titik tiga) > "Install SummitGear".\n\n' +
          '• Di Mobile (Android/iOS): Buka menu browser > "Add to Home screen" / "Tambahkan ke layar utama".',
      )
      return null
    }
  }, [installPrompt])

  return {
    installPrompt,
    isInstalled,
    isOffline,
    promptInstall,
  }
}
