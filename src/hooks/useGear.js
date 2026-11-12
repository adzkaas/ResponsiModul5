import { useState, useEffect, useCallback } from 'react'
import gearService from '../services/gearService'

export function useGear(filterParams = {}) {
  const [gears, setGears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('offline_cache')

  const paramKey = JSON.stringify(filterParams)

  const fetchGears = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await gearService.getAllGears(filterParams)
      if (res.success) {
        setGears(res.data)
        setSource(res.source)
      } else {
        setError('Gagal memuat inventaris perlengkapan.')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem saat memuat data.')
    } finally {
      setLoading(false)
    }
  }, [paramKey])

  useEffect(() => {
    fetchGears()

    // Dengarkan event online/offline untuk auto refetch
    const handleOnline = () => fetchGears()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [fetchGears])

  const addGear = async (data) => {
    try {
      const res = await gearService.createGear(data)
      await fetchGears()
      return res
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const editGear = async (id, data) => {
    try {
      const res = await gearService.updateGear(id, data)
      await fetchGears()
      return res
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const removeGear = async (id) => {
    try {
      const res = await gearService.deleteGear(id)
      await fetchGears()
      return res
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const resetGears = () => {
    const defaults = gearService.resetDefault()
    setGears(defaults)
    setSource('offline_cache')
    return defaults
  }

  return {
    gears,
    loading,
    error,
    source,
    addGear,
    editGear,
    removeGear,
    resetGears,
    refetch: fetchGears,
  }
}

