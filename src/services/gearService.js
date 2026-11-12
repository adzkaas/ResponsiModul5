import { apiClient, IS_SUPABASE } from '../config/api'
import { INITIAL_GEARS } from '../data/initialGears'

const STORAGE_KEY = 'summitgear_inventory_v1'

/**
 * Normalizer — menyamakan format atribut baik dari Supabase maupun local cache
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
   * Mengambil data dari local cache (offline persistence)
   */
  getLocalCache() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GEARS))
        return INITIAL_GEARS.map(normalizeGear)
      }
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.map(normalizeGear) : INITIAL_GEARS.map(normalizeGear)
    } catch {
      return INITIAL_GEARS.map(normalizeGear)
    }
  }

  /**
   * Menyimpan array data ke local cache
   */
  saveLocalCache(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e)
    }
  }

  /**
   * Ambil semua data (Prioritas Supabase jika online, fallback ke localStorage)
   */
  async getAllGears(params = {}) {
    // 1. Cek apakah Supabase aktif dan perangkat sedang online
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
          // Sinkronisasi data ke cache offline
          this.saveLocalCache(normalized)
          return {
            success: true,
            data: normalized,
            source: 'supabase',
          }
        }
      } catch (err) {
        console.warn('[gearService] Gagal memuat dari Supabase, beralih ke cache lokal:', err)
      }
    }

    // 2. Fallback offline: Ambil dari localStorage
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

    // Jika online dan terhubung ke Supabase
    if (IS_SUPABASE && navigator.onLine) {
      try {
        const res = await apiClient.post('/rest/v1/gears', payload, {
          headers: { Prefer: 'return=representation' },
        })
        const created = Array.isArray(res) ? res[0] : res
        const norm = normalizeGear(created)

        // Update cache lokal
        const localItems = this.getLocalCache().filter((i) => i.id !== norm.id)
        this.saveLocalCache([norm, ...localItems])

        return { success: true, data: norm, source: 'supabase' }
      } catch (err) {
        console.warn('[gearService] Supabase insert gagal, menyimpan ke local cache:', err)
      }
    }

    // Offline fallback insert
    const newItem = normalizeGear({
      ...payload,
      id: `gear-${Date.now()}`,
      created_at: new Date().toISOString(),
    })
    const existing = this.getLocalCache()
    const updated = [newItem, ...existing]
    this.saveLocalCache(updated)

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

    // Cek jika ID adalah UUID valid untuk Supabase
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

        // Update local cache
        const items = this.getLocalCache().map((i) => (i.id === id ? norm : i))
        this.saveLocalCache(items)

        return { success: true, data: norm, source: 'supabase' }
      } catch (err) {
        console.warn('[gearService] Supabase patch gagal, update lokal:', err)
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
    const updatedLocal = items.find((i) => i.id === id)

    return { success: true, data: updatedLocal, source: 'offline_cache' }
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
        console.warn('[gearService] Supabase delete gagal:', err)
      }
    }

    // Hapus dari local cache
    const items = this.getLocalCache().filter((item) => item.id !== id)
    this.saveLocalCache(items)

    return { success: true }
  }

  /**
   * Reset data ke bawaan awal
   */
  resetDefault() {
    this.saveLocalCache(INITIAL_GEARS)
    return INITIAL_GEARS.map(normalizeGear)
  }
}

export default new GearService()
