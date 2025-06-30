// frontend/src/store/baseStore.ts - Alternatif çözüm
import { ref, computed, type Ref } from 'vue'
import { BaseApiService } from '../api/baseApiService'

export interface BaseItem {
  _id?: string
  id?: string
  [key: string]: any
}

export interface BaseStatistics {
  totalItems: number
  totalValue: number
  lowStock: number
  recentlyAdded: number
}

export function createBaseStore<T extends BaseItem>(
  storeName: string, 
  apiService: BaseApiService
) {
  return () => {
    // State - explicit typing
    const items: Ref<T[]> = ref([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const statistics = ref<BaseStatistics>({
      totalItems: 0,
      totalValue: 0,
      lowStock: 0,
      recentlyAdded: 0
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

    const clearError = () => {
      error.value = null
    }

    const fetchItems = async (params?: any) => {
      try {
        setLoading(true)
        clearError()

        const response = await apiService.getItems<T>(params)

        if (response.success) {
          // Direct assignment with proper typing
          items.value.length = 0
          items.value.push(...response.data)
          await fetchStatistics()
        } else {
          error.value = response.message || 'Veri getirme hatası'
          throw new Error(error.value)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
        error.value = message
        console.error(`❌ ${storeName} getirme hatası:`, err)
        throw err
      } finally {
        setLoading(false)
      }
    }

    const fetchStatistics = async () => {
      try {
        const response = await apiService.getStats<BaseStatistics>()
        if (response.success) {
          Object.assign(statistics.value, response.data)
        }
      } catch (err) {
        console.warn(`⚠️ ${storeName} istatistikleri alınamadı:`, err)
        // Don't throw error for stats as it's not critical
      }
    }

    const addItem = async (itemData: Partial<T>) => {
      try {
        setLoading(true)
        clearError()

        const response = await apiService.createItem<T>(itemData)

        if (response.success) {
          items.value.unshift(response.data)
          await fetchStatistics()
        } else {
          error.value = response.message || 'Ekleme hatası'
          throw new Error(error.value)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ekleme hatası'
        error.value = message
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

        const response = await apiService.updateItem<T>(id, itemData)

        if (response.success) {
          const index = items.value.findIndex(item => (item._id || item.id) === id)
          if (index !== -1) {
            // Safe replacement
            items.value.splice(index, 1, response.data)
          }
          await fetchStatistics()
        } else {
          error.value = response.message || 'Güncelleme hatası'
          throw new Error(error.value)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Güncelleme hatası'
        error.value = message
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

        const response = await apiService.deleteItem<T>(id)

        if (response.success) {
          const index = items.value.findIndex(item => (item._id || item.id) === id)
          if (index !== -1) {
            items.value.splice(index, 1)
          }
          await fetchStatistics()
        } else {
          error.value = response.message || 'Silme hatası'
          throw new Error(error.value)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Silme hatası'
        error.value = message
        console.error(`❌ ${storeName} silme hatası:`, err)
        throw err
      } finally {
        setLoading(false)
      }
    }

    const getItem = async (id: string): Promise<T | null> => {
      try {
        const existingItem = items.value.find(item => (item._id || item.id) === id)
        if (existingItem) return existingItem

        const response = await apiService.getItem<T>(id)
        return response.success ? response.data : null
      } catch (err) {
        console.error(`❌ ${storeName} getirme hatası:`, err)
        return null
      }
    }

    const reset = () => {
      items.value.length = 0
      loading.value = false
      error.value = null
      Object.assign(statistics.value, {
        totalItems: 0,
        totalValue: 0,
        lowStock: 0,
        recentlyAdded: 0
      })
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