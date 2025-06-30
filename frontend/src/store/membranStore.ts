// frontend/src/store/membranStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { membranService } from '../api/membranService'
import type { Membran } from '../types/membran'
import { getErrorMessage } from '../api/baseApiService'

export const useMembranStore = defineStore('membran', () => {
  // State
  const items = ref<Membran[]>([])
  const currentItem = ref<Membran | null>(null)
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
      
      console.log('🔄 Membran verileri yükleniyor...', params)

      const response = await membranService.getMembranItems(params)

      if (response.success) {
        items.value = response.data
        
        // Update pagination if provided
        if (response.pagination) {
          pagination.value = response.pagination
        }
        
        console.log('✅ Membran verileri yüklendi:', response.data.length, 'adet')
      } else {
        throw new Error(response.message || 'Membran verileri getirilemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      console.error('❌ Membran getirme hatası:', err)
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

      const response = await membranService.getMembran(id)

      if (response.success) {
        currentItem.value = response.data
        return response.data
      } else {
        throw new Error(response.message || 'Membran malzeme bulunamadı')
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
  const createItem = async (itemData: Partial<Membran>) => {
    try {
      setLoading(true)
      clearError()

      const response = await membranService.createMembran(itemData)

      if (response.success) {
        items.value.unshift(response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Membran malzeme eklenemedi')
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
  const updateItem = async (id: string, itemData: Partial<Membran>) => {
    try {
      setLoading(true)
      clearError()

      const response = await membranService.updateMembran(id, itemData)

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
        throw new Error(response.message || 'Membran malzeme güncellenemedi')
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

      const response = await membranService.deleteMembran(id)

      if (response.success) {
        items.value = items.value.filter(item => item._id !== id && item.id !== id)
        
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = null
        }
      } else {
        throw new Error(response.message || 'Membran malzeme silinemedi')
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