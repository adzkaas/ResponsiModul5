import { apiClient, IS_SUPABASE } from '../config/api'

/**
 * Normalizer — menyamakan format atribut dari Supabase
 */
export const normalizeGear = (item) => {
  if (!item) return null
  return {
    id: item.id,
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
   * Ambil semua data langsung dari tabel `gears` di Supabase
   */
  async getAllGears(params = {}) {
    if (!IS_SUPABASE) {
      throw new Error('Kredensial Supabase belum dikonfigurasi di file .env')
    }

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

    if (!Array.isArray(data)) {
      return { success: true, data: [] }
    }

    return {
      success: true,
      data: data.map(normalizeGear),
    }
  }

  /**
   * Tambah item inventaris baru langsung ke Supabase
   */
  async createGear(data) {
    if (!IS_SUPABASE) {
      throw new Error('Kredensial Supabase belum dikonfigurasi di file .env')
    }

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

    const res = await apiClient.post('/rest/v1/gears', payload, {
      headers: { Prefer: 'return=representation' },
    })
    const created = Array.isArray(res) ? res[0] : res
    return { success: true, data: normalizeGear(created) }
  }

  /**
   * Perbarui item inventaris langsung di Supabase
   */
  async updateGear(id, data) {
    if (!IS_SUPABASE) {
      throw new Error('Kredensial Supabase belum dikonfigurasi di file .env')
    }

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

    const res = await apiClient.patch(`/rest/v1/gears?id=eq.${id}`, payload, {
      headers: { Prefer: 'return=representation' },
    })
    const updatedItem = Array.isArray(res) ? res[0] : res
    return { success: true, data: normalizeGear(updatedItem) }
  }

  /**
   * Hapus item inventaris langsung dari Supabase
   */
  async deleteGear(id) {
    if (!IS_SUPABASE) {
      throw new Error('Kredensial Supabase belum dikonfigurasi di file .env')
    }

    await apiClient.delete(`/rest/v1/gears?id=eq.${id}`)
    return { success: true }
  }
}

export default new GearService()
