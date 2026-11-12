import { Mountain, Plus } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'Catalog', label: 'Katalog Alat' },
  { id: 'Inventory', label: 'Inventaris CRUD' },
  { id: 'Checklist', label: 'Checklist Misi' },
  { id: 'Profile', label: 'Profil Praktikan' },
]

export default function Header({ activeTab, onChangeTab, onNavigateCreate }) {
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
