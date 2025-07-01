import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { membranService } from '../services/membranService'
import type { Membran, MembranItem } from '../types/membran'
import { getErrorMessage } from '../utils/errorHelpers'

export const useMembranStore = defineStore('membran', () => {
  // State - Use MembranItem instead of Membran for better compatibility
  const items = ref<MembranItem[]>([])
  const currentItem = ref<MembranItem | null>(null)
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

      const response = await membranService.getMembrans(params)

      if (response.success) {
        // Convert to MembranItem format with required fields
        items.value = response.data.map(item => ({
          ...item,
          adet: item.adet || 0,
          kalanMiktar: item.kalanMiktar || 0,
          birim: item.birim || 'ADET'
        }))
        
        if (response.pagination) {
          pagination.value = response.pagination
        }
      } else {
        throw new Error(response.message || 'Membran verileri getirilemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)  // FIXED: Added import
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

      const response = await membranService.getMembran(id)

      if (response.success) {
        // Convert to MembranItem format
        currentItem.value = {
          ...response.data,
          adet: response.data.adet || 0,
          kalanMiktar: response.data.kalanMiktar || 0,
          birim: response.data.birim || 'ADET'
        }
        return currentItem.value
      } else {
        throw new Error(response.message || 'Membran malzeme bulunamadı')
      }
    } catch (err) {
      const message = getErrorMessage(err)  // FIXED: Added import
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create item
  const createItem = async (itemData: Partial<MembranItem>) => {
    try {
      setLoading(true)
      clearError()

      // Convert MembranItem to Membran format for API
      const apiData: Partial<Membran> = {
        ...itemData,
        durumu: (itemData.durumu === 'Aktif' || itemData.durumu === 'Pasif') 
          ? itemData.durumu as 'Aktif' | 'Pasif' 
          : undefined
      }

      const response = await membranService.createMembran(apiData)

      if (response.success) {
        // Convert back to MembranItem and add to items
        const newItem: MembranItem = {
          ...response.data,
          adet: response.data.adet || 0,
          kalanMiktar: response.data.kalanMiktar || 0,
          birim: response.data.birim || 'ADET'
        }
        items.value.unshift(newItem)
        return newItem
      } else {
        throw new Error(response.message || 'Membran malzeme eklenemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)  // FIXED: Added import
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update item
  const updateItem = async (id: string, itemData: Partial<MembranItem>) => {
    try {
      setLoading(true)
      clearError()

      // Convert MembranItem to Membran format for API
      const apiData: Partial<Membran> = {
        ...itemData,
        durumu: (itemData.durumu === 'Aktif' || itemData.durumu === 'Pasif') 
          ? itemData.durumu as 'Aktif' | 'Pasif' 
          : undefined
      }

      const response = await membranService.updateMembran(id, apiData)

      if (response.success) {
        // Convert back to MembranItem
        const updatedItem: MembranItem = {
          ...response.data,
          adet: response.data.adet || 0,
          kalanMiktar: response.data.kalanMiktar || 0,
          birim: response.data.birim || 'ADET'
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
        throw new Error(response.message || 'Membran malzeme güncellenemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)  // FIXED: Added import
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
      const message = getErrorMessage(err)  // FIXED: Added import
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