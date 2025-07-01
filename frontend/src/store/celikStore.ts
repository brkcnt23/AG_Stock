
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { celikService } from '../services/celikService'
import type { CelikItem } from '../types/common'
import { getErrorMessage } from '../utils/errorHelpers'
import { convertToStoreItem, convertFromStoreItem } from '../utils/storeHelpers'

export const useCelikStore = defineStore('celik', () => {
  // State - Use BaseItem with safe typing
  const items = ref<CelikItem[]>([])
  const currentItem = ref<CelikItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const pagination = ref({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Statistics
  const statistics = ref({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    recentlyAdded: 0
  })

  // Computed
  const hasData = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Helper functions
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

  // Fetch items with safe conversion
  const fetchItems = async (params?: any) => {
    try {
      setLoading(true)
      clearError()

      const response = await celikService.getCeliks(params)

      if (response.success) {
        // Convert API items to store items with type safety
        items.value = response.data.map((item: any) => 
          convertToStoreItem<CelikItem>(item, 'celik')
        )
        
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        throw new Error(response.message || 'Çelik verileri getirilemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create item with safe conversion
  const createItem = async (itemData: Partial<CelikItem>) => {
    try {
      setLoading(true)
      clearError()

      // Convert store item to API format
      const apiData = convertFromStoreItem(itemData)

      const response = await celikService.createCelik(apiData)

      if (response.success) {
        const newItem = convertToStoreItem<CelikItem>(response.data, 'celik')
        items.value.unshift(newItem)
        return newItem
      } else {
        throw new Error(response.message || 'Çelik malzeme eklenemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update item with safe conversion
  const updateItem = async (id: string, itemData: Partial<CelikItem>) => {
    try {
      setLoading(true)
      clearError()

      const apiData = convertFromStoreItem(itemData)
      const response = await celikService.updateCelik(id, apiData)

      if (response.success) {
        const updatedItem = convertToStoreItem<CelikItem>(response.data, 'celik')
        
        const index = items.value.findIndex(item => 
          (item._id || item.id) === id
        )
        if (index !== -1) {
          items.value[index] = updatedItem
        }
        
        if (currentItem.value && ((currentItem.value._id || currentItem.value.id) === id)) {
          currentItem.value = updatedItem
        }
        
        return updatedItem
      } else {
        throw new Error(response.message || 'Çelik malzeme güncellenemedi')
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

      const response = await celikService.deleteCelik(id)

      if (response.success) {
        items.value = items.value.filter(item => 
          (item._id || item.id) !== id
        )
        
        if (currentItem.value && ((currentItem.value._id || currentItem.value.id) === id)) {
          currentItem.value = null
        }
      } else {
        throw new Error(response.message || 'Çelik malzeme silinemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch single item
  const fetchItem = async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await celikService.getCelik(id)

      if (response.success) {
        currentItem.value = convertToStoreItem<CelikItem>(response.data, 'celik')
        return currentItem.value
      } else {
        throw new Error(response.message || 'Çelik malzeme bulunamadı')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Aliases for compatibility
  const addItem = createItem

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
    statistics.value = {
      totalItems: 0,
      totalValue: 0,
      lowStock: 0,
      recentlyAdded: 0
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