// frontend/src/store/halatStore.ts - Clean Pinia store without MongoDB
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { halatService } from '../api/halatService'
import type { HalatItem, HalatFilter, HalatStats, CreateHalatData, UpdateHalatData, HalatStockOperation } from '../types/halat'
import type { ApiResponse } from '../api/baseApiService'
import { getErrorMessage } from '../api/baseApiService'

export const useHalatStore = defineStore('halat', () => {
  // State
  const halats = ref<HalatItem[]>([])
  const currentHalat = ref<HalatItem | null>(null)
  const stats = ref<HalatStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination state
  const pagination = ref({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  // Filters state
  const filters = ref<HalatFilter>({
    search: '',
    status: '',
    type: '',
    tedarikci: '',
    depo: ''
  })

  // Computed properties
  const totalItems = computed(() => pagination.value.totalCount)
  
  const inStockHalats = computed(() => 
    halats.value.filter(h => h.stok > 0)
  )
  
  const outOfStockHalats = computed(() => 
    halats.value.filter(h => h.stok === 0)
  )
  
  const criticalStockHalats = computed(() => 
    halats.value.filter(h => h.stok > 0 && h.stok <= (h.minStokSeviyesi || 5))
  )
  
  const stockSufficiency = computed(() => {
    if (totalItems.value === 0) return 100
    return Math.round((inStockHalats.value.length / totalItems.value) * 100)
  })

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
    if (value) error.value = null
  }

  const setError = (message: string) => {
    error.value = message
    loading.value = false
  }

  const clearError = () => {
    error.value = null
  }

  // Fetch halats with pagination and filtering
  const fetchHalats = async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    type?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    try {
      setLoading(true)
      
      const mergedParams = { ...filters.value, ...params }
      // Only allow valid status values
      const validStatuses = ['stokta', 'tukendi', 'kritik']
      if (mergedParams.status && !validStatuses.includes(mergedParams.status)) {
        mergedParams.status = undefined
      }
      // Explicitly cast status to the correct type
      const typedParams = {
        ...mergedParams,
        status: mergedParams.status as 'stokta' | 'tukendi' | 'kritik' | undefined
      }
      const response = await halatService.getHalats(typedParams)
      
      halats.value = response.data
      
      if (response.pagination) {
        pagination.value = response.pagination
      }
      
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch single halat
  const fetchHalat = async (id: string) => {
    try {
      setLoading(true)
      
      const response = await halatService.getHalat(id)
      currentHalat.value = response.data
      
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create new halat
  const createHalat = async (data: CreateHalatData) => {
    try {
      setLoading(true)
      
      const response = await halatService.createHalat(data)
      
      // Add to local state
      halats.value.unshift(response.data)
      pagination.value.totalCount++
      
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update halat
  const updateHalat = async (id: string, data: UpdateHalatData) => {
    try {
      setLoading(true)
      
      const response = await halatService.updateHalat(id, data)
      
      // Update local state
      const index = halats.value.findIndex(h => h._id === id || h.id === id)
      if (index !== -1) {
        halats.value[index] = response.data
      }
      
      if (currentHalat.value && (currentHalat.value._id === id || currentHalat.value.id === id)) {
        currentHalat.value = response.data
      }
      
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete halat
  const deleteHalat = async (id: string) => {
    try {
      setLoading(true)
      
      const response = await halatService.deleteHalat(id)
      
      // Remove from local state
      halats.value = halats.value.filter(h => h._id !== id && h.id !== id)
      pagination.value.totalCount--
      
      if (currentHalat.value && (currentHalat.value._id === id || currentHalat.value.id === id)) {
        currentHalat.value = null
      }
      
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update stock
  const updateStock = async (id: string, stockOperation: HalatStockOperation) => {
    try {
      setLoading(true)
      
      const response = await halatService.updateHalatStock(id, stockOperation)
      
      // Update local state
      const index = halats.value.findIndex(h => h._id === id || h.id === id)
      if (index !== -1) {
        halats.value[index] = response.data
      }
      
      if (currentHalat.value && (currentHalat.value._id === id || currentHalat.value.id === id)) {
        currentHalat.value = response.data
      }
      
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await halatService.getHalatStats()
      stats.value = response.data
      return response
    } catch (err) {
      const message = getErrorMessage(err)
      console.warn('Stats fetch failed:', message)
      // Don't set error for stats as it's not critical
    }
  }

  // Update filters
  const updateFilters = (newFilters: Partial<HalatFilter>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      search: '',
      status: '',
      type: '',
      tedarikci: '',
      depo: ''
    }
  }

  // Pagination helpers
  const setPage = (page: number) => {
    pagination.value.page = page
  }

  const setLimit = (limit: number) => {
    pagination.value.limit = limit
    pagination.value.page = 1 // Reset to first page
  }

  // Export data
  const exportHalats = (data: HalatItem[] = halats.value) => {
    try {
      const csvData = data.map(halat => ({
        'Ad': halat.name,
        'Kalite': halat.kalite || '',
        'Cins': halat.cins,
        'Çap (mm)': halat.cap,
        'Uzunluk (m)': halat.uzunluk || '',
        'Stok': halat.stok,
        'Birim': halat.birim,
        'Birim Fiyat': halat.birimFiyat || '',
        'Para Birimi': halat.parabirimi || '',
        'Tedarikçi': halat.tedarikci || '',
        'Depo': halat.depo || '',
        'Raf': halat.raf || '',
        'Açıklama': halat.aciklama || ''
      }))
      
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n')
      
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `halat-listesi-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      throw new Error('Export işlemi başarısız')
    }
  }

  // Reset store
  const reset = () => {
    halats.value = []
    currentHalat.value = null
    stats.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      page: 1,
      limit: 20,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
    resetFilters()
  }

  return {
    // State
    halats,
    currentHalat,
    stats,
    loading,
    error,
    pagination,
    filters,
    
    // Computed
    totalItems,
    inStockHalats,
    outOfStockHalats,
    criticalStockHalats,
    stockSufficiency,
    
    // Actions
    fetchHalats,
    fetchHalat,
    createHalat,
    updateHalat,
    deleteHalat,
    updateStock,
    fetchStats,
    updateFilters,
    resetFilters,
    setPage,
    setLimit,
    exportHalats,
    clearError,
    reset
  }
})