import { X, Scale, Package, Shield, Tag, Pencil, Trash2 } from 'lucide-react'

export default function GearDetailModal({ gear, open, onClose, onEdit, onDelete }) {
  if (!open || !gear) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge">{gear.category}</span>
            <h2 style={{ margin: '6px 0 0', fontSize: '1.25rem' }}>{gear.name}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup detail">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="gear-detail-grid">
            <div className="detail-stat">
              <Scale size={18} color="#e67e22" />
              <div>
                <strong>Bobot Satuan</strong>
                <span>{gear.weight_gram} gram ({(gear.weight_gram / 1000).toFixed(2)} kg)</span>
              </div>
            </div>

            <div className="detail-stat">
              <Package size={18} color="#2563eb" />
              <div>
                <strong>Stok Tersedia</strong>
                <span>{gear.stock} Unit di Basecamp</span>
              </div>
            </div>

            <div className="detail-stat">
              <Shield size={18} color={gear.condition === 'Layak Pakai' ? '#16a34a' : '#d97706'} />
              <div>
                <strong>Kondisi Fisik</strong>
                <span className={`status-dot ${gear.condition === 'Layak Pakai' ? 'ok' : 'warn'}`}>
                  {gear.condition}
                </span>
              </div>
            </div>

            <div className="detail-stat">
              <Tag size={18} color="#64748b" />
              <div>
                <strong>ID Identitas</strong>
                <span className="mono-text">{gear.id}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Catatan &amp; Kondisi Lapangan</h4>
            <p className="detail-notes">{gear.notes || 'Tidak ada catatan khusus untuk perlengkapan ini.'}</p>
          </div>

          {Array.isArray(gear.specs) && gear.specs.length > 0 && (
            <div className="detail-section">
              <h4>Spesifikasi Teknis</h4>
              <ul className="spec-bullet-list">
                {gear.specs.map((spec, i) => (
                  <li key={i}>{spec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {onDelete && (
            <button
              type="button"
              className="btn btn--danger-ghost"
              onClick={() => {
                onClose()
                onDelete(gear)
              }}
            >
              <Trash2 size={15} /> Hapus
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                onClose()
                onEdit(gear)
              }}
            >
              <Pencil size={15} /> Edit Data
            </button>
          )}
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

