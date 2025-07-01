import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { membranService } from '../services/membranService'
import type { MembranItem } from '../types/common'
import { getErrorMessage } from '../utils/errorHelpers'

export const useMembranStore = defineStore('membran', () => {
  // State
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

  // Methods
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

  // Actions
  const fetchItems = async (params?: any) => {
    try {
      setLoading(true)
      clearError()

      const response = await membranService.getMembran(params)
      const res = response.data

      if (res.success) {
        const dataArray = Array.isArray(res.data) ? res.data : [res.data]
        items.value = dataArray.map((item: Partial<MembranItem>) => ({
          ...item,
          _id: item._id || item.id,
          id: item._id || item.id,
          malzemeTuru: 'membran' as const
        }))

        if (res.pagination) {
          pagination.value = res.pagination
        }
      } else {
        throw new Error(res.message || 'Membran verileri getirilemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchItem = async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await membranService.getMembranById(id)
      const res = response.data

      if (res.success) {
        currentItem.value = {
          ...res.data,
          _id: res.data._id || res.data.id,
          id: res.data._id || res.data.id,
          malzemeTuru: 'membran' as const
        }
        return currentItem.value
      } else {
        throw new Error(res.message || 'Membran bulunamadı')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createItem = async (data: Partial<MembranItem>) => {
    try {
      setLoading(true)
      clearError()

      const response = await membranService.createMembran(data)
      const res = response.data

      if (res.success) {
        const newItem = {
          ...res.data,
          _id: res.data._id || res.data.id,
          id: res.data._id || res.data.id,
          malzemeTuru: 'membran' as const
        }
        items.value.unshift(newItem)
        return newItem
      } else {
        throw new Error(res.message || 'Membran eklenemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (id: string, data: Partial<MembranItem>) => {
    try {
      setLoading(true)
      clearError()

      const response = await membranService.updateMembran(id, data)
      const res = response.data

      if (res.success) {
        const updatedItem = {
          ...res.data,
          _id: res.data._id || res.data.id,
          id: res.data._id || res.data.id,
          malzemeTuru: 'membran' as const
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
        throw new Error(res.message || 'Membran güncellenemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setLoading(true)
      clearError()

      const response = await membranService.deleteMembran(id)
      const res = response.data

      if (res.success) {
        items.value = items.value.filter(item => item._id !== id && item.id !== id)
        if (currentItem.value && (currentItem.value._id === id || currentItem.value.id === id)) {
          currentItem.value = null
        }
      } else {
        throw new Error(res.message || 'Membran silinemedi')
      }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Alias for compatibility
  const addItem = createItem

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
    addItem,
    clearError
  }
})