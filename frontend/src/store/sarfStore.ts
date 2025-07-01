import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sarfService } from '../api/sarfService'
import type { SarfItem } from '../types/common'  // SarfItem kullan
import { getErrorMessage } from '../utils/errorHelpers'

export const useSarfStore = defineStore('sarf', () => {
  // State - SarfItem kullan
  const items = ref<SarfItem[]>([])
  const currentItem = ref<SarfItem | null>(null)
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
      setLoading(true)
      clearError()

      const response = await sarfService.getSarf(params)

      if (response.success) {
        // API'den gelen Sarf'ı SarfItem'a dönüştür
        const dataArray = Array.isArray(response.data) ? response.data : [response.data]
        items.value = dataArray.map(item => ({
          ...item,
          malzemeTuru: 'sarf' as const  // SarfItem için zorunlu alan
        }))
        
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        throw new Error(response.message || 'Sarf verileri getirilemedi')
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

      const response = await sarfService.getSarf(id)

      if (response.success) {
        // API'den gelen Sarf'ı SarfItem'a dönüştür
        currentItem.value = {
          ...response.data,
          malzemeTuru: 'sarf' as const  // SarfItem için zorunlu alan
        }
        return currentItem.value
      } else {
        throw new Error(response.message || 'Sarf malzeme bulunamadı')
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
  const createItem = async (itemData: Partial<SarfItem>) => {
    try {
      setLoading(true)
      clearError()

      // SarfItem'dan Sarf'a dönüştür (API için)
      const apiData = {
        ...itemData,
        malzemeTuru: 'sarf' as const  // Ensure type
      }

      const response = await sarfService.createSarf(apiData)

      if (response.success) {
        // API'den gelen Sarf'ı SarfItem'a dönüştür
        const newItem: SarfItem = {
          ...response.data,
          malzemeTuru: 'sarf' as const
        }
        items.value.unshift(newItem)
        return newItem
      } else {
        throw new Error(response.message || 'Sarf malzeme eklenemedi')
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
  const updateItem = async (id: string, itemData: Partial<SarfItem>) => {
    try {
      setLoading(true)
      clearError()

      // SarfItem'dan Sarf'a dönüştür (API için)
      const apiData = {
        ...itemData,
        malzemeTuru: 'sarf' as const  // Ensure type
      }

      const response = await sarfService.updateSarf(id, apiData)

      if (response.success) {
        // API'den gelen Sarf'ı SarfItem'a dönüştür
        const updatedItem: SarfItem = {
          ...response.data,
          malzemeTuru: 'sarf' as const
        }

        const index = items.value.findIndex(item => item._id === id || item.id === id)
        if (index !== -1) {
          items.value[index] = updatedItem
        }
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = updatedItem
        }
        
        return updatedItem
      } else {
        throw new Error(response.message || 'Sarf malzeme güncellenemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete item - değişiklik yok
  const deleteItem = async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await sarfService.deleteSarf(id)

      if (response.success) {
        items.value = items.value.filter(item => item._id !== id && item.id !== id)
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = null
        }
      } else {
        throw new Error(response.message || 'Sarf malzeme silinemedi')
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
  const statistics = ref({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    recentlyAdded: 0
  })

  // Reset store
  const reset = () => {
    items.value = []
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
    deleteItem,
    addItem,
    clearError,
    reset
  }
})