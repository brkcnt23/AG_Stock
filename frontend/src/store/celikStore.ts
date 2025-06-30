import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { celikService } from '../api/celikService'
import type { Celik } from '../types/celik'
import { getErrorMessage } from '../api/baseApiService'

export const useCelikStore = defineStore('celik', () => {
  // State
  const items = ref<Celik[]>([])
  const currentItem = ref<Celik | null>(null)
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
      
      console.log('🔄 Çelik verileri yükleniyor...', params)

      const response = await celikService.getCelikItems(params)

      if (response.success) {
        items.value = response.data
        
        // Update pagination if provided
        if (response.pagination) {
          pagination.value = response.pagination
        }
        
        console.log('✅ Çelik verileri yüklendi:', response.data.length, 'adet')
      } else {
        throw new Error(response.message || 'Çelik verileri getirilemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      console.error('❌ Çelik getirme hatası:', err)
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

      const response = await celikService.getCelik(id)

      if (response.success) {
        currentItem.value = response.data
        return response.data
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

  // Create item
  const createItem = async (itemData: Partial<Celik>) => {
    try {
      setLoading(true)
      clearError()

      const response = await celikService.createCelik(itemData)

      if (response.success) {
        items.value.unshift(response.data)
        return response.data
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

  // Update item
  const updateItem = async (id: string, itemData: Partial<Celik>) => {
    try {
      setLoading(true)
      clearError()

      const response = await celikService.updateCelik(id, itemData)

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
        items.value = items.value.filter(item => item._id !== id && item.id !== id)
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
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
    clearError,
    reset
  }
})