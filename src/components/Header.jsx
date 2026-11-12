import { Mountain, Plus, Cloud, CloudOff } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'Catalog', label: 'Katalog Alat' },
  { id: 'Inventory', label: 'Inventaris CRUD' },
  { id: 'Checklist', label: 'Checklist Misi' },
  { id: 'Profile', label: 'Profil Praktikan' },
]

export default function Header({ activeTab, onChangeTab, onNavigateCreate, isOffline, dataSource }) {
  return (
    <header className="header">
      <div
        className="brand-wrap"
        onClick={() => onChangeTab('Catalog')}
        title="SummitGear — Basecamp Logistics"
      >
        <div className="brand-icon">
          <Mountain size={20} color="#ffffff" />
        </div>
        <div className="brand-text">
          <span className="brand-title">SummitGear</span>
          <span className="brand-badge">PWA</span>
        </div>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onChangeTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        {/* Indikator Status Cloud / Offline */}
        <div
          className={`status-chip ${isOffline || dataSource === 'offline_cache' ? 'offline' : 'online'}`}
          title={
            isOffline
              ? 'Mode Offline: Menggunakan penyimpanan lokal'
              : dataSource === 'supabase'
              ? 'Terhubung langsung ke Supabase Cloud DB'
              : 'Penyimpanan Offline Cache Aktif'
          }
        >
          {isOffline || dataSource === 'offline_cache' ? (
            <>
              <CloudOff size={13} />
              <span>Offline Cache</span>
            </>
          ) : (
            <>
              <Cloud size={13} />
              <span>Supabase Cloud</span>
            </>
          )}
        </div>

        {onNavigateCreate && (
          <button
            type="button"
            className="btn btn--primary btn--sm header-cta"
            onClick={onNavigateCreate}
            title="Tambah perlengkapan baru"
          >
            <Plus size={15} /> Tambah Alat
          </button>
        )}
      </div>
    </header>
  )
}
