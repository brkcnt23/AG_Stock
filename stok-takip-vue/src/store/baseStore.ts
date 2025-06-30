// stores/baseStore.ts
import { ref, computed } from 'vue'
import type { BaseItem, BaseFilters, ApiResponse } from '../types/common'

export function createBaseStore<T extends BaseItem>(
  storeName: string,
  apiService: any
) {
  return () => {
    // State
    const items = ref<T[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

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
    const hasError = computed(() => !!error.value)

    const clearError = () => {
      error.value = null
    }

    const setLoading = (state: boolean) => {
      loading.value = state
    }

    const fetchItems = async (filters: BaseFilters = {}, page = 1, limit = 100) => {
      try {
        setLoading(true)
        clearError()

        const response = await apiService.getItems({ ...filters, page, limit })

        if (response.success) {
          items.value = response.data
          await fetchStatistics()
        } else {
          error.value = response.message || 'Veriler yüklenemedi'
        }
      } catch (err) {
        error.value = 'Veriler yüklenirken hata oluştu'
        console.error(`❌ ${storeName} fetch hatası:`, err)
      } finally {
        setLoading(false)
      }
    }

    const fetchStatistics = async () => {
      try {
        const response = await apiService.getStatistics()
        if (response.success) {
          statistics.value = response.data
        }
      } catch (err) {
        console.error(`❌ ${storeName} istatistik hatası:`, err)
      }
    }

    const addItem = async (itemData: Omit<T, '_id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setLoading(true)
        clearError()

        const response = await apiService.createItem(itemData)

        if (response.success) {
          items.value.unshift(response.data)
          await fetchStatistics()
        } else {
          error.value = response.message || 'Ekleme hatası'
          throw new Error(error.value ?? 'Bilinmeyen hata')
        }
      } catch (err) {
        console.error(`❌ ${storeName} ekleme hatası:`, err)
        throw err
      } finally {
        setLoading(false)
      }
    }

    const updateItem = async (id: string, itemData: Partial<T>) => {
      try {
        setLoading(true)
        clearError()

        const response = await apiService.updateItem(id, itemData)

        if (response.success) {
          const index = items.value.findIndex(item => (item._id || item.id) === id)
          if (index !== -1) {
            items.value[index] = response.data
          }
          await fetchStatistics()
        } else {
          error.value = response.message || 'Güncelleme hatası'
          throw new Error(error.value ?? 'Güncelleme hatası')
        }
      } catch (err) {
        console.error(`❌ ${storeName} güncelleme hatası:`, err)
        throw err
      } finally {
        setLoading(false)
      }
    }

    const deleteItem = async (id: string) => {
      try {
        setLoading(true)
        clearError()

        const response = await apiService.deleteItem(id)

        if (response.success) {
          items.value = items.value.filter(item => (item._id || item.id) !== id)
          await fetchStatistics()
        } else {
          error.value = response.message || 'Silme hatası'
          throw new Error(error.value ?? 'Silme hatası')
        }
      } catch (err) {
        console.error(`❌ ${storeName} silme hatası:`, err)
        throw err
      } finally {
        setLoading(false)
      }
    }

    const getItem = async (id: string): Promise<T | null> => {
      try {
        const existingItem = items.value.find(item => (item._id || item.id) === id)
        if (existingItem) return existingItem as T

        const response = await apiService.getItem(id)
        return response.success ? response.data : null
      } catch (err) {
        console.error(`❌ ${storeName} getirme hatası:`, err)
        return null
      }
    }

    const reset = () => {
      items.value = []
      loading.value = false
      error.value = null
      statistics.value = {
        totalItems: 0,
        totalValue: 0,
        lowStock: 0,
        recentlyAdded: 0
      }
    }

    return {
      items,
      loading,
      error,
      statistics,
      hasData,
      isLoading,
      hasError,
      fetchItems,
      fetchStatistics,
      addItem,
      updateItem,
      deleteItem,
      getItem,
      clearError,
      reset
    }
  }
}
