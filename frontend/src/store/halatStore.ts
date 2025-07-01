import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { halatService } from '../api/halatService'
import type { HalatItem } from '../types/halat'
import { getErrorMessage } from '../utils/errorHelpers'

export const useHalatStore = defineStore('halat', () => {
  // State
  const items = ref<HalatItem[]>([])
  const halats = ref<HalatItem[]>([])  // Alias for compatibility
  const currentItem = ref<HalatItem | null>(null)
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

  // Sync items and halats
  const syncArrays = () => {
    halats.value = [...items.value]
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
      setLoading(true)
      clearError()

      const response = await halatService.getHalats(params)

      if (response.success) {
        items.value = response.data
        syncArrays()
        
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        throw new Error(response.message || 'Halat verileri getirilemedi')
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

      const response = await halatService.getHalat(id)

      if (response.success) {
        currentItem.value = response.data
        return response.data
      } else {
        throw new Error(response.message || 'Halat malzeme bulunamadı')
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
  const createItem = async (itemData: Partial<HalatItem>) => {
    try {
      setLoading(true)
      clearError()

      const response = await halatService.createHalat(itemData)

      if (response.success) {
        items.value.unshift(response.data)
        syncArrays()
        return response.data
      } else {
        throw new Error(response.message || 'Halat malzeme eklenemedi')
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
  const updateItem = async (id: string, itemData: Partial<HalatItem>) => {
    try {
      setLoading(true)
      clearError()

      const response = await halatService.updateHalat(id, itemData)

      if (response.success) {
        const index = items.value.findIndex(item => item._id === id || item.id === id)
        if (index !== -1) {
          items.value[index] = response.data
        }
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = response.data
        }
        
        syncArrays()
        return response.data
      } else {
        throw new Error(response.message || 'Halat malzeme güncellenemedi')
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

      const response = await halatService.deleteHalat(id)

      if (response.success) {
        items.value = items.value.filter(item => item._id !== id && item.id !== id)
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = null
        }
        
        syncArrays()
      } else {
        throw new Error(response.message || 'Halat malzeme silinemedi')
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
  const updateHalat = updateItem  // Alias for compatibility
  const statistics = ref({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    recentlyAdded: 0
  })

  // Reset store
  const reset = () => {
    items.value = []
    halats.value = []
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
    halats,        // ADDED: halats array for compatibility
    currentItem,
    loading,
    error,
    pagination,
    statistics,    // ADDED: statistics
    
    // Computed
    hasData,
    isLoading,
    hasError,
    
    // Actions
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    updateHalat,   // ADDED: updateHalat alias
    deleteItem,
    addItem,       // ADDED: addItem alias
    clearError,
    reset
  }
})