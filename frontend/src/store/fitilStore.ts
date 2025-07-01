import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { fitilService } from '../services/fitilService'
import type { FitilItem } from '../types/common'
import { getErrorMessage } from '../utils/errorHelpers'

export const useFitilStore = defineStore('fitil', () => {
  // State
  const items = ref<FitilItem[]>([])
  const fitils = ref<FitilItem[]>([])  // Alias for compatibility
  const currentItem = ref<FitilItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const pagination = ref({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Sync items and fitils
  const syncArrays = () => {
    fitils.value = [...items.value]
  }

  // Computed
  const hasData = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

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

  // Fetch items
  const fetchItems = async (params?: any) => {
    try {
      if (loading.value) return; // Prevent concurrent fetches
      setLoading(true)
      clearError()

      const response = await fitilService.getFitils(params)
      
      if (response.success) {
        const rawItems = response.data || []
        const processedItems = rawItems.map((item: any) => ({
          ...item,
          malzemeTuru: 'fitil' as const,
          _id: item._id,
          id: item.id,
          stok: Number(item.kalanMiktar || item.adet || 0),
          birim: item.birim || 'METRE',
          birimFiyat: Number(item.satinAlisFiyati) || 0,
          paraBirimi: item.paraBirimi || 'TL'
        }))

        // Update items in nextTick to avoid reactivity issues
        nextTick(() => {
          items.value = processedItems
          syncArrays()
          
          // Update statistics after items are processed
          statistics.value = {
            totalItems: items.value.length,
            totalValue: items.value.reduce((sum, item) => sum + (Number(item.birimFiyat) || 0), 0),
            lowStock: items.value.filter(item => (Number(item.stok) / Number(item.adet || 1)) < 0.2).length,
            recentlyAdded: items.value.filter(item => {
              if (!item.createdAt) return false;
              const date = new Date(item.createdAt)
              const now = new Date()
              return now.getTime() - date.getTime() < 30 * 24 * 60 * 60 * 1000 // 30 days
            }).length
          }
        })

        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        throw new Error(response.message || 'Fitil verileri getirilemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get single item
  const fetchItem = async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await fitilService.getFitil(id)

      if (response.success) {
        currentItem.value = { ...response.data, malzemeTuru: 'fitil' as const }
        return { ...response.data, malzemeTuru: 'fitil' as const }
      } else {
        throw new Error(response.message || 'Fitil malzeme bulunamadı')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create item
  const createItem = async (itemData: Partial<FitilItem>) => {
    try {
      setLoading(true)
      clearError()

      // Ensure elastikiyet is string or undefined
      const apiData = {
        ...itemData,
        elastikiyet:
          itemData.elastikiyet !== undefined && itemData.elastikiyet !== null
            ? String(itemData.elastikiyet)
            : undefined
      }

      const response = await fitilService.createFitil(apiData)

      if (response.success) {
        if (!Array.isArray(items.value)) items.value = []
        const newItem = { ...response.data, malzemeTuru: 'fitil' as const }
        items.value.unshift(newItem)
        syncArrays()
        return newItem
      } else {
        throw new Error(response.message || 'Fitil malzeme eklenemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update item
  const updateItem = async (id: string, itemData: Partial<FitilItem>) => {
    try {
      setLoading(true)
      clearError()

      // Ensure elastikiyet is string or undefined
      const apiData = {
        ...itemData,
        elastikiyet:
          itemData.elastikiyet !== undefined && itemData.elastikiyet !== null
            ? String(itemData.elastikiyet)
            : undefined
      }

      const response = await fitilService.updateFitil(id, apiData)

      if (response.success) {
        if (!Array.isArray(items.value)) items.value = []
        const index = items.value.findIndex(item => item._id === id || item.id === id)
        if (index !== -1) {
          items.value[index] = { ...response.data, malzemeTuru: 'fitil' as const }
        }
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = { ...response.data, malzemeTuru: 'fitil' as const }
        }
        
        syncArrays()
        return response.data
      } else {
        throw new Error(response.message || 'Fitil malzeme güncellenemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete item
  const deleteItem = async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await fitilService.deleteFitil(id)

      if (response.success) {
        if (!Array.isArray(items.value)) items.value = []
        items.value = items.value.filter(item => item._id !== id && item.id !== id)
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = null
        }
        
        syncArrays()
      } else {
        throw new Error(response.message || 'Fitil malzeme silinemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Add missing methods for compatibility
  const addItem = createItem
  const updateFitil = updateItem  // Alias for compatibility
  const statistics = ref({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    recentlyAdded: 0
  })

  // Reset store
  const reset = () => {
    items.value = []
    fitils.value = []
    currentItem.value = null
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
  }

  return {
    // State
    items,
    fitils,         // ADDED: fitils array for compatibility
    currentItem,
    loading,
    error,
    pagination,
    statistics,    
    
    // Computed
    hasData,
    isLoading,
    hasError,
    
    // Actions
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    updateFitil,    // ADDED: updateFitil alias
    deleteItem,
    addItem,        // ADDED: addItem alias
    clearError,
    reset
  }
})