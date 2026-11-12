import { useState, useEffect, useMemo } from 'react'
import { CheckSquare, Square, Backpack, Check, SlidersHorizontal, RotateCcw } from 'lucide-react'

const CHECK_KEY = 'summitgear_packed_ids'

export default function ChecklistPage({ gears }) {
  const [packedIds, setPackedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(CHECK_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [filterMode, setFilterMode] = useState('all') // 'all' | 'packed' | 'unpacked'

  useEffect(() => {
    try {
      localStorage.setItem(CHECK_KEY, JSON.stringify(packedIds))
    } catch (e) {
      console.warn('Gagal menyimpan checklist:', e)
    }
  }, [packedIds])

  const toggleItem = (id) => {
    setPackedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleCheckAll = () => {
    setPackedIds(gears.map((g) => g.id))
  }

  const handleUncheckAll = () => {
    setPackedIds([])
  }

  const packedGears = useMemo(
    () => gears.filter((g) => packedIds.includes(g.id)),
    [gears, packedIds],
  )

  const packedWeightKg = useMemo(() => {
    const sumGrams = packedGears.reduce((acc, g) => acc + g.weight_gram, 0)
    return (sumGrams / 1000).toFixed(2)
  }, [packedGears])

  const totalGearsWeightKg = useMemo(() => {
    const sumGrams = gears.reduce((acc, g) => acc + g.weight_gram, 0)
    return (sumGrams / 1000).toFixed(2)
  }, [gears])

  const progressPercent = gears.length > 0 ? Math.round((packedGears.length / gears.length) * 100) : 0

  const displayedGears = useMemo(() => {
    if (filterMode === 'packed') {
      return gears.filter((g) => packedIds.includes(g.id))
    }
    if (filterMode === 'unpacked') {
      return gears.filter((g) => !packedIds.includes(g.id))
    }
    return gears
  }, [gears, packedIds, filterMode])

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-badge">
          <Backpack size={14} color="#e67e22" />
          <span>Pre-Departure Expedition Packing</span>
        </div>
        <h1>Checklist Persiapan Ekspedisi</h1>
        <p className="lede">
          Pastikan setiap perlengkapan vital telah terkemas ke dalam carrier. Pantau total beban
          yang akan dipikul sebelum keberangkatan.
        </p>

        {/* Progress & Stat Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <Backpack size={20} className="stat-icon-theme" />
            <div>
              <strong>
                {packedGears.length} dari {gears.length} Item Terkemas ({progressPercent}%)
              </strong>
              <span>
                Beban carrier saat ini: <strong>{packedWeightKg} kg</strong> (dari total potensi {totalGearsWeightKg} kg)
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      {/* Control Actions & Filter Bar */}
      <div className="checklist-actions-bar">
        <div className="pill-group">
          <button
            type="button"
            className={`pill ${filterMode === 'all' ? 'pill--active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Semua ({gears.length})
          </button>
          <button
            type="button"
            className={`pill ${filterMode === 'packed' ? 'pill--active' : ''}`}
            onClick={() => setFilterMode('packed')}
          >
            Sudah Terkemas ({packedGears.length})
          </button>
          <button
            type="button"
            className={`pill ${filterMode === 'unpacked' ? 'pill--active' : ''}`}
            onClick={() => setFilterMode('unpacked')}
          >
            Belum Terkemas ({gears.length - packedGears.length})
          </button>
        </div>

        <div className="quick-check-btns">
          <button type="button" className="btn btn--outline btn--sm" onClick={handleCheckAll}>
            <Check size={14} /> Tandai Semua
          </button>
          <button type="button" className="btn btn--outline btn--sm" onClick={handleUncheckAll}>
            <RotateCcw size={14} /> Kosongkan
          </button>
        </div>
      </div>

      {/* Checklist List */}
      <div className="checklist-list">
        {displayedGears.length === 0 ? (
          <div className="empty-box">
            <p>Tidak ada perlengkapan pada kategori filter ini.</p>
          </div>
        ) : (
          displayedGears.map((item) => {
            const isChecked = packedIds.includes(item.id)
            return (
              <button
                key={item.id}
                type="button"
                className={`check-row ${isChecked ? 'checked' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                {isChecked ? (
                  <CheckSquare size={22} color="#e67e22" />
                ) : (
                  <Square size={22} color="#94a3b8" />
                )}
                <div className="check-info">
                  <span className="check-title">{item.name}</span>
                  <span className="check-sub">
                    {item.category} &bull; {item.weight_gram} gram &bull; Stok Basecamp: {item.stock}
                  </span>
                </div>
                <span className={`badge ${isChecked ? 'badge--success' : ''}`}>
                  {isChecked ? 'Sudah di Tas' : 'Belum'}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
