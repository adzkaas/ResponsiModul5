import { apiClient, IS_SUPABASE } from '../config/api'

const CACHE_KEY = 'summitgear_gears_cache'

/**
 * Normalizer — menyamakan format atribut dari Supabase
 */
export const normalizeGear = (item) => {
  if (!item) return null
  return {
    id: item.id || `gear-${Date.now()}`,
    name: item.name || 'Perlengkapan Tanpa Nama',
    category: item.category || 'Shelter',
    weight_gram: Number(item.weight_gram ?? item.weightGram ?? 0),
    weightGram: Number(item.weight_gram ?? item.weightGram ?? 0),
    stock: Number(item.stock ?? 1),
    condition: item.condition || 'Layak Pakai',
    notes: item.notes || '',
    specs: Array.isArray(item.specs) ? item.specs : [],
    image_url: item.image_url || '',
    created_at: item.created_at || new Date().toISOString(),
  }
}

class GearService {
  /**
   * Mengambil data dari cache lokal (offline)
   */
  getLocalCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.map(normalizeGear) : []
      }
    } catch {}
    return []
  }

  /**
   * Menyimpan array data ke cache lokal (offline sync)
   */
  saveLocalCache(items) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('Gagal menyimpan cache offline:', e)
    }
  }

  /**
   * Ambil semua data (Online: langsung dari Supabase & update cache, Offline: dari cache)
   */
  async getAllGears(params = {}) {
    // 1. Jika online dan Supabase dikonfigurasi, ambil langsung dari Supabase
    if (IS_SUPABASE && navigator.onLine) {
      try {
        const queryParts = ['select=*']

        if (params.search) {
          queryParts.push(`name=ilike.*${encodeURIComponent(params.search)}*`)
        }
        if (params.category && params.category !== 'Semua') {
          queryParts.push(`category=eq.${encodeURIComponent(params.category)}`)
        }
        queryParts.push('order=created_at.desc')

        const queryString = queryParts.join('&')
        const data = await apiClient.get(`/rest/v1/gears?${queryString}`)

        if (Array.isArray(data)) {
          const normalized = data.map(normalizeGear)
          // Simpan ke cache offline untuk kesiapan saat internet mati
          this.saveLocalCache(normalized)
          return {
            success: true,
            data: normalized,
            source: 'supabase',
          }
        }
      } catch (err) {
        console.warn('[gearService] Gagal memuat dari Supabase, beralih ke cache offline:', err.message)
      }
    }

    // 2. Mode Offline: Baca dari cache lokal
    let items = this.getLocalCache()

    if (params.search) {
      const q = params.search.toLowerCase()
      items = items.filter(
        (g) => g.name.toLowerCase().includes(q) || (g.notes || '').toLowerCase().includes(q),
      )
    }
    if (params.category && params.category !== 'Semua') {
      items = items.filter((g) => g.category === params.category)
    }

    return {
      success: true,
      data: items,
      source: 'offline_cache',
    }
  }

  /**
   * Tambah item inventaris baru
   */
  async createGear(data) {
    const payload = {
      name: data.name.trim(),
      category: data.category || 'Shelter',
      weight_gram: Number(data.weightGram ?? data.weight_gram ?? 0),
      stock: Number(data.stock ?? 1),
      condition: data.condition || 'Layak Pakai',
      notes: data.notes?.trim() || '',
      specs: Array.isArray(data.specs) ? data.specs : [],
      image_url: data.image_url || '',
    }

    // Online: Simpan ke Supabase
    if (IS_SUPABASE && navigator.onLine) {
      try {
        const res = await apiClient.post('/rest/v1/gears', payload, {
          headers: { Prefer: 'return=representation' },
        })
        const created = Array.isArray(res) ? res[0] : res
        const norm = normalizeGear(created)

        // Perbarui cache lokal
        const local = this.getLocalCache().filter((i) => i.id !== norm.id)
        this.saveLocalCache([norm, ...local])

        return { success: true, data: norm, source: 'supabase' }
      } catch (err) {
        console.warn('[gearService] Supabase insert gagal, menyimpan ke offline cache:', err.message)
      }
    }

    // Offline: Simpan langsung ke cache lokal
    const newItem = normalizeGear({
      ...payload,
      id: `gear-${Date.now()}`,
      created_at: new Date().toISOString(),
    })
    const existing = this.getLocalCache()
    this.saveLocalCache([newItem, ...existing])

    return { success: true, data: newItem, source: 'offline_cache' }
  }

  /**
   * Perbarui item inventaris
   */
  async updateGear(id, data) {
    const payload = {
      updated_at: new Date().toISOString(),
    }
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.category !== undefined) payload.category = data.category
    if (data.weightGram !== undefined || data.weight_gram !== undefined) {
      payload.weight_gram = Number(data.weightGram ?? data.weight_gram ?? 0)
    }
    if (data.stock !== undefined) payload.stock = Number(data.stock)
    if (data.condition !== undefined) payload.condition = data.condition
    if (data.notes !== undefined) payload.notes = data.notes.trim()
    if (data.specs !== undefined) payload.specs = data.specs
    if (data.image_url !== undefined) payload.image_url = data.image_url

    // Cek apakah id adalah UUID Supabase
    const isUUID =
      typeof id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

    if (IS_SUPABASE && navigator.onLine && isUUID) {
      try {
        const res = await apiClient.patch(`/rest/v1/gears?id=eq.${id}`, payload, {
          headers: { Prefer: 'return=representation' },
        })
        const updatedItem = Array.isArray(res) ? res[0] : res
        const norm = normalizeGear(updatedItem)

        // Perbarui cache lokal
        const items = this.getLocalCache().map((i) => (i.id === id ? norm : i))
        this.saveLocalCache(items)

        return { success: true, data: norm, source: 'supabase' }
      } catch (err) {
        console.warn('[gearService] Supabase patch gagal, simpan offline:', err.message)
      }
    }

    // Offline update
    const items = this.getLocalCache().map((item) => {
      if (item.id === id) {
        return normalizeGear({
          ...item,
          ...payload,
          weight_gram: payload.weight_gram ?? item.weight_gram,
        })
      }
      return item
    })
    this.saveLocalCache(items)
    const updated = items.find((i) => i.id === id)

    return { success: true, data: updated, source: 'offline_cache' }
  }

  /**
   * Hapus item inventaris
   */
  async deleteGear(id) {
    const isUUID =
      typeof id === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

    if (IS_SUPABASE && navigator.onLine && isUUID) {
      try {
        await apiClient.delete(`/rest/v1/gears?id=eq.${id}`)
      } catch (err) {
        console.warn('[gearService] Supabase delete gagal, hapus offline:', err.message)
      }
    }

    // Hapus dari cache lokal
    const items = this.getLocalCache().filter((item) => item.id !== id)
    this.saveLocalCache(items)

    return { success: true }
  }
}

export default new GearService()
