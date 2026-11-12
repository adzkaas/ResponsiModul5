import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import PWABadge from './components/PWABadge'
import CatalogPage from './pages/CatalogPage'
import InventoryPage from './pages/InventoryPage'
import ChecklistPage from './pages/ChecklistPage'
import ProfilePage from './pages/ProfilePage'
import { useGear } from './hooks/useGear'
import { usePWAInstall } from './hooks/usePWAInstall'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('Catalog')
  const [editingTarget, setEditingTarget] = useState(null)

  const { gears, loading, error, addGear, editGear, removeGear, resetGears } = useGear()
  const { isInstalled, isOffline, promptInstall } = usePWAInstall()

  const handleNavigateCreate = () => {
    setEditingTarget(null)
    setActiveTab('Inventory')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditFromCatalog = (gear) => {
    setEditingTarget(gear)
    setActiveTab('Inventory')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onNavigateCreate={handleNavigateCreate}
        onInstallApp={promptInstall}
        isInstalled={isInstalled}
      />

      <main className="main-content">
        {activeTab === 'Catalog' && (
          <CatalogPage
            gears={gears}
            loading={loading}
            error={error}
            onGoToCrud={handleNavigateCreate}
            onEditGear={handleEditFromCatalog}
            onDeleteGear={(g) => removeGear(g.id)}
          />
        )}

        {activeTab === 'Inventory' && (
          <InventoryPage
            gears={gears}
            loading={loading}
            error={error}
            onAdd={addGear}
            onEdit={editGear}
            onDelete={removeGear}
            onReset={resetGears}
            editingTarget={editingTarget}
            onCancelEditTarget={() => setEditingTarget(null)}
          />
        )}

        {activeTab === 'Checklist' && <ChecklistPage gears={gears} />}

        {activeTab === 'Profile' && <ProfilePage />}
      </main>

      <PWABadge
        onInstallApp={promptInstall}
        isInstalled={isInstalled}
        isOffline={isOffline}
      />
      <Footer />
    </div>
  )
}
