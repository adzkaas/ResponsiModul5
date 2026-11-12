import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Package,
  X,
} from 'lucide-react'
import ConfirmModal from '../components/modals/ConfirmModal'

const EMPTY_FORM = {
  name: '',
  category: 'Shelter',
  weightGram: 500,
  stock: 1,
  condition: 'Layak Pakai',
  notes: '',
  specInput: '',
  specs: [],
}

export default function InventoryPage({
  gears,
  onAdd,
  onEdit,
  onDelete,
  onReset,
  editingTarget,
  onCancelEditTarget,
  dataSource,
  isOffline,
}) {
  const [form, setForm] = useState(() => {
    if (editingTarget) {
      return {
        name: editingTarget.name,
        category: editingTarget.category,
        weightGram: editingTarget.weight_gram,
        stock: editingTarget.stock,
        condition: editingTarget.condition,
        notes: editingTarget.notes || '',
        specInput: '',
        specs: editingTarget.specs || [],
      }
    }
    return EMPTY_FORM
  })

  const [editingId, setEditingId] = useState(() => editingTarget?.id || null)
  const [toast, setToast] = useState({ text: '', type: 'success' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const showToast = (text, type = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast({ text: '', type: 'success' }), 3500)
  }

  const handleAddSpecTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault()
      const val = form.specInput.trim()
      if (val && !form.specs.includes(val)) {
        setForm((prev) => ({
          ...prev,
          specs: [...prev.specs, val],
          specInput: '',
        }))
      }
    }
  }

  const handleRemoveSpecTag = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== indexToRemove),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      showToast('Nama perlengkapan tidak boleh kosong!', 'error')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        name: form.name.trim(),
        category: form.category,
        weightGram: Number(form.weightGram) || 0,
        stock: Number(form.stock) || 1,
        condition: form.condition,
        notes: form.notes.trim(),
        specs: form.specs,
      }

      if (editingId) {
        await onEdit(editingId, payload)
        showToast(`"${form.name}" berhasil diperbarui.`, 'success')
        cancelEdit()
      } else {
        await onAdd(payload)
        showToast(`"${form.name}" berhasil ditambahkan ke inventaris.`, 'success')
        setForm(EMPTY_FORM)
      }
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan perubahan.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setForm({
      name: item.name,
      category: item.category,
      weightGram: item.weight_gram,
      stock: item.stock,
      condition: item.condition,
      notes: item.notes || '',
      specInput: '',
      specs: Array.isArray(item.specs) ? [...item.specs] : [],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    if (onCancelEditTarget) onCancelEditTarget()
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await onDelete(deleteTarget.id)
      if (editingId === deleteTarget.id) cancelEdit()
      showToast(`"${deleteTarget.name}" berhasil dihapus dari inventaris.`, 'success')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err.message || 'Gagal menghapus perlengkapan.', 'error')
    }
  }

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <h1>Manajemen Inventaris (CRUD)</h1>
          <p className="lede">
            Kelola data logistik perlengkapan basecamp (Create, Read, Update, Delete) secara instan.
          </p>
        </div>

        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => setResetConfirm(true)}
          title="Kembalikan semua item ke data awal modul"
        >
          <RotateCcw size={14} /> Reset Data Bawaan
        </button>
      </div>

      {/* Toast Feedback */}
      {toast.text && (
        <div className={`toast ${toast.type === 'error' ? 'toast--error' : 'toast--success'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Form Tambah / Edit (CRUD: CREATE & UPDATE) */}
      <form className="crud-form" onSubmit={handleSubmit}>
        <div className="crud-form-header">
          <h2>{editingId ? 'Edit Data Perlengkapan' : 'Tambah Perlengkapan Baru'}</h2>
          <span className="form-sub-note">
            {editingId
              ? 'Ubah informasi atribut dan simpan ke database.'
              : 'Isi formulir di bawah untuk mendaftarkan alat ekspedisi baru.'}
          </span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Nama Perlengkapan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Matras Foil Aluminium"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Kategori Logistik</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="Shelter">Shelter</option>
              <option value="Tas & Carrier">Tas &amp; Carrier</option>
              <option value="Logistik Masak">Logistik Masak</option>
              <option value="Navigasi & Cahaya">Navigasi &amp; Cahaya</option>
              <option value="P3K & Safety">P3K &amp; Safety</option>
              <option value="Aksesoris & Trekking">Aksesoris &amp; Trekking</option>
            </select>
          </div>

          <div className="form-group">
            <label>Bobot Satuan (gram) *</label>
            <input
              type="number"
              min="0"
              required
              placeholder="Contoh: 350"
              value={form.weightGram}
              onChange={(e) => setForm({ ...form, weightGram: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Jumlah Stok Tersedia (unit) *</label>
            <input
              type="number"
              min="0"
              required
              placeholder="Contoh: 5"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Status Kondisi Fisik</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            >
              <option value="Layak Pakai">Layak Pakai</option>
              <option value="Perlu Cek Baterai">Perlu Cek Baterai</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
              <option value="Perlu Dicuci">Perlu Dicuci</option>
            </select>
          </div>

          <div className="form-group">
            <label>Catatan Singkat / Kondisi</label>
            <input
              type="text"
              placeholder="Catatan material, kekurangan, kelengkapan..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        {/* Tag Spesifikasi Tambahan */}
        <div className="form-group spec-input-group">
          <label>Spesifikasi Tambahan (Opsional)</label>
          <div className="spec-input-row">
            <input
              type="text"
              placeholder="Ketik spesifikasi lalu tekan enter (misal: Bahan Nylon 20D)"
              value={form.specInput}
              onChange={(e) => setForm({ ...form, specInput: e.target.value })}
              onKeyDown={handleAddSpecTag}
            />
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleAddSpecTag}
            >
              + Tambah Tag
            </button>
          </div>
          {form.specs.length > 0 && (
            <div className="tags-container">
              {form.specs.map((sp, idx) => (
                <span key={idx} className="spec-tag">
                  {sp}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecTag(idx)}
                    aria-label="Hapus tag"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          {editingId && (
            <button
              type="button"
              className="btn btn--outline"
              onClick={cancelEdit}
              disabled={submitting}
            >
              Batal Edit
            </button>
          )}
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            <Plus size={16} />
            {submitting
              ? 'Menyimpan...'
              : editingId
              ? 'Simpan Perubahan'
              : 'Simpan ke Inventaris'}
          </button>
        </div>
      </form>

      {/* Tabel CRUD READ, UPDATE, & DELETE */}
      <div className="table-section">
        <div className="table-header-title">
          <h3>Daftar Inventaris Terdaftar ({gears.length} Item)</h3>
          <span className="sub-text">Klik ikon edit atau hapus untuk memodifikasi record.</span>
        </div>

        <div className="table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Nama Perlengkapan</th>
                <th>Kategori</th>
                <th>Bobot</th>
                <th>Stok</th>
                <th>Kondisi</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {gears.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    <Package size={36} color="#94a3b8" />
                    <p style={{ margin: '8px 0 0', color: '#64748b' }}>
                      Belum ada perlengkapan yang tersimpan.
                    </p>
                  </td>
                </tr>
              ) : (
                gears.map((item) => (
                  <tr key={item.id} className={editingId === item.id ? 'row-editing' : ''}>
                    <td>
                      <strong className="item-title">{item.name}</strong>
                      <div className="sub-text">{item.notes || '—'}</div>
                      {Array.isArray(item.specs) && item.specs.length > 0 && (
                        <div className="table-tags">
                          {item.specs.slice(0, 2).map((s, i) => (
                            <span key={i} className="mini-tag">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge">{item.category}</span>
                    </td>
                    <td>
                      <strong>{item.weight_gram}</strong> g
                    </td>
                    <td>
                      <span className={`stock-badge ${item.stock <= 2 ? 'low' : ''}`}>
                        {item.stock} unit
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-dot ${
                          item.condition === 'Layak Pakai' ? 'ok' : 'warn'
                        }`}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEdit(item)}
                        title="Edit data"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => setDeleteTarget(item)}
                        title="Hapus data"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus (DELETE) */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Perlengkapan"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}" dari sistem inventaris basecamp?`}
        confirmLabel="Hapus Item"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal Konfirmasi Reset Bawaan */}
      <ConfirmModal
        open={resetConfirm}
        title="Reset ke Data Bawaan"
        message="Tindakan ini akan mengembalikan seluruh daftar inventaris ke konfigurasi awal modul praktikum."
        confirmLabel="Reset Sekarang"
        danger
        onConfirm={() => {
          onReset()
          setResetConfirm(false)
          cancelEdit()
          showToast('Data berhasil di-reset ke bawaan awal.', 'success')
        }}
        onCancel={() => setResetConfirm(false)}
      />
    </div>
  )
}

