import { useState, useMemo } from 'react'
import { Search, Scale, Package, SlidersHorizontal, Eye } from 'lucide-react'
import GearDetailModal from '../components/modals/GearDetailModal'

export default function CatalogPage({ gears, onGoToCrud, onEditGear, onDeleteGear }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const [sortBy, setSortBy] = useState('default')
  const [selectedGear, setSelectedGear] = useState(null)

  const categories = useMemo(() => {
    const set = new Set(gears.map((g) => g.category))
    return ['Semua', ...Array.from(set)]
  }, [gears])

  const filtered = useMemo(() => {
    let result = gears.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.notes || '').toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'Semua' || g.category === category
      return matchSearch && matchCat
    })

    if (sortBy === 'weight-asc') {
      result.sort((a, b) => a.weight_gram - b.weight_gram)
    } else if (sortBy === 'weight-desc') {
      result.sort((a, b) => b.weight_gram - a.weight_gram)
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'stock-desc') {
      result.sort((a, b) => b.stock - a.stock)
    }

    return result
  }, [gears, search, category, sortBy])

  const stats = useMemo(() => {
    const totalUnits = filtered.reduce((acc, g) => acc + g.stock, 0)
    const totalGrams = filtered.reduce((acc, g) => acc + g.weight_gram * g.stock, 0)
    return {
      kinds: filtered.length,
      units: totalUnits,
      weightKg: (totalGrams / 1000).toFixed(2),
    }
  }, [filtered])

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <h1>Logistik &amp; Perlengkapan Ekspedisi</h1>
        <p className="lede">
          Pantau kesiapan peralatan lapangan, akumulasi bobot ransel, dan status kelaikan operasional
          secara real-time bahkan saat jaringan seluler terputus.
        </p>

        {/* Dynamic Metric Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <Package size={20} className="stat-icon-theme" />
            <div>
              <strong>{stats.kinds} Macam Perlengkapan</strong>
              <span>Total akumulasi {stats.units} unit operasional</span>
            </div>
          </div>
          <div className="stat-card">
            <Scale size={20} className="stat-icon-theme" />
            <div>
              <strong>{stats.weightKg} kg</strong>
              <span>Total beban inventaris terdaftar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div className="filter-controls-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="search"
              placeholder="Cari nama perlengkapan, material, atau spesifikasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sort-box">
            <SlidersHorizontal size={16} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Urutkan: Bawaan</option>
              <option value="weight-asc">Bobot: Paling Ringan</option>
              <option value="weight-desc">Bobot: Paling Berat</option>
              <option value="stock-desc">Stok: Terbanyak</option>
              <option value="name-asc">Nama: A — Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="pill-group">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pill ${category === cat ? 'pill--active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Gear Cards */}
      {filtered.length === 0 ? (
        <div className="empty-box">
          <Package size={48} color="#94a3b8" />
          <h3>Tidak ada perlengkapan yang cocok</h3>
          <p>Coba gunakan kata kunci pencarian lain atau tambahkan inventaris baru.</p>
          <button type="button" className="btn btn--primary" onClick={onGoToCrud}>
            Tambah Perlengkapan Baru
          </button>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="card"
              onClick={() => setSelectedGear(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-top">
                <span className="badge">{item.category}</span>
                <span
                  className={`status-dot ${
                    item.condition === 'Layak Pakai' ? 'ok' : 'warn'
                  }`}
                >
                  &bull; {item.condition}
                </span>
              </div>

              <h3>{item.name}</h3>
              <p className="card-notes">
                {item.notes || 'Spesifikasi standar operasional basecamp.'}
              </p>

              <div className="card-meta">
                <span>
                  Bobot: <strong>{item.weight_gram} g</strong>
                </span>
                <span>
                  Stok: <strong>{item.stock} unit</strong>
                </span>
              </div>

              <div className="card-footer-action">
                <span className="card-view-btn">
                  <Eye size={14} /> Lihat Detail
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Detail Item */}
      <GearDetailModal
        open={Boolean(selectedGear)}
        gear={selectedGear}
        onClose={() => setSelectedGear(null)}
        onEdit={(g) => {
          setSelectedGear(null)
          if (onEditGear) onEditGear(g)
        }}
        onDelete={(g) => {
          setSelectedGear(null)
          if (onDeleteGear) onDeleteGear(g)
        }}
      />
    </div>
  )
}

