import { apiClient, IS_SUPABASE } from '../config/api'

const LOCAL_CHECK_KEY = 'summitgear_packed_ids'

class ChecklistService {
  /**
   * Mengambil daftar ID perlengkapan yang sudah dikemas (is_packed = true)
   */
  async getPackedIds() {
    if (IS_SUPABASE) {
      try {
        const data = await apiClient.get('/rest/v1/checklists?is_packed=eq.true&select=gear_id')
        if (Array.isArray(data)) {
          const ids = data.map((row) => row.gear_id)
          localStorage.setItem(LOCAL_CHECK_KEY, JSON.stringify(ids))
          return ids
        }
      } catch (err) {
        console.warn('[checklistService] Gagal memuat dari Supabase:', err.message)
      }
    }

    try {
      const saved = localStorage.getItem(LOCAL_CHECK_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  }

  /**
   * Mengubah status pengepakan suatu gear di Supabase
   */
  async toggleItem(gearId, nextPackedState) {
    // Simpan di local storage
    try {
      const saved = localStorage.getItem(LOCAL_CHECK_KEY)
      let ids = saved ? JSON.parse(saved) : []
      if (nextPackedState) {
        if (!ids.includes(gearId)) ids.push(gearId)
      } else {
        ids = ids.filter((id) => id !== gearId)
      }
      localStorage.setItem(LOCAL_CHECK_KEY, JSON.stringify(ids))
    } catch {}

    if (IS_SUPABASE) {
      try {
        // Cek apakah row checklist untuk gear_id sudah ada
        const existing = await apiClient.get(
          `/rest/v1/checklists?gear_id=eq.${gearId}&select=id&limit=1`,
        )

        if (Array.isArray(existing) && existing.length > 0) {
          await apiClient.patch(
            `/rest/v1/checklists?gear_id=eq.${gearId}`,
            {
              is_packed: nextPackedState,
              packed_at: nextPackedState ? new Date().toISOString() : null,
            },
            { headers: { Prefer: 'return=minimal' } },
          )
        } else {
          await apiClient.post(
            '/rest/v1/checklists',
            {
              gear_id: gearId,
              is_packed: nextPackedState,
              packed_at: nextPackedState ? new Date().toISOString() : null,
            },
            { headers: { Prefer: 'return=minimal' } },
          )
        }
      } catch (err) {
        console.warn('[checklistService] Gagal sync ke Supabase:', err.message)
      }
    }
  }

  /**
   * Tandai semua item
   */
  async setAll(gears, shouldPack) {
    const ids = shouldPack ? gears.map((g) => g.id) : []
    localStorage.setItem(LOCAL_CHECK_KEY, JSON.stringify(ids))

    if (IS_SUPABASE) {
      try {
        for (const g of gears) {
          await this.toggleItem(g.id, shouldPack)
        }
      } catch (err) {
        console.warn('[checklistService] Gagal bulk update ke Supabase:', err.message)
      }
    }
    return ids
  }
}

export default new ChecklistService()
