import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fitilService } from '../api/fitilService'
import type { Fitil } from '../types/fitil'
import { getErrorMessage } from '../utils/errorHelpers'

export const useFitilStore = defineStore('fitil', () => {
  // State
  const items = ref<Fitil[]>([])
  const currentItem = ref<Fitil | null>(null)
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

      const response = await fitilService.getFitils(params)

      if (response.success) {
        items.value = response.data
        
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        throw new Error(response.message || 'Fitil verileri getirilemedi')
      }
    } catch (err) {  // FIXED: Added err parameter
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get single item  
  const fetchItem = async (id: string) => {  // ADDED: Missing fetchItem
    try {
      setLoading(true)
      clearError()

      const response = await fitilService.getFitil(id)

      if (response.success) {
        currentItem.value = response.data
        return response.data
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
  const createItem = async (itemData: Partial<Fitil>) => {
    try {
      setLoading(true)
      clearError()

      // Ensure durumu is of the correct type
      const mappedItemData = {
        ...itemData,
        durumu:
          itemData.durumu === 'Aktif' || itemData.durumu === 'Pasif'
            ? itemData.durumu as 'Aktif' | 'Pasif'
            : undefined
      }

      const response = await fitilService.createFitil(mappedItemData)

      if (response.success) {
        items.value.unshift(response.data)
        return response.data
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
  const updateItem = async (id: string, itemData: Partial<Fitil>) => {
    try {
      setLoading(true)
      clearError()

      // Ensure durumu is of the correct type
      const mappedItemData = {
        ...itemData,
        durumu:
          itemData.durumu === 'Aktif' || itemData.durumu === 'Pasif'
            ? itemData.durumu as 'Aktif' | 'Pasif'
            : undefined
      }

      const response = await fitilService.updateFitil(id, mappedItemData)

      if (response.success) {
        const index = items.value.findIndex(item => item._id === id || item.id === id)
        if (index !== -1) {
          items.value[index] = response.data
        }
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = response.data
        }
        
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
        items.value = items.value.filter(item => item._id !== id && item.id !== id)
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = null
        }
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
    fetchItem,  // ADDED: Missing fetchItem
    createItem,
    updateItem,
    deleteItem,
    addItem,
    clearError,
    reset
  }
})