import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { celikService } from '../services/celikService'
import type { CelikItem, CelikStats } from '../types/celik'

export const useCelikStore = defineStore('celik', () => {
  const items = ref<CelikItem[]>([])
  const currentItem = ref<CelikItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const statistics = ref<CelikStats>({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    recentlyAdded: 0,
    activeCount: 0,
    passiveCount: 0,
    lastUpdate: new Date().toISOString()
  })

  // Getters
  const hasData = computed(() => items.value.length > 0)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  // Actions
  const fetchItems = async () => {
    try {
      if (loading.value) return; // Prevent concurrent fetches
      loading.value = true
      const response = await celikService.getAll()

      if (response.success) {
        items.value = response.data
        // Use nextTick to update statistics after items are updated
        nextTick(() => {
          statistics.value = {
            totalItems: items.value.length,
            totalValue: items.value.reduce((sum, item) => sum + (item.satinAlisFiyati || 0), 0),
            lowStock: items.value.filter(item => (item.kalanMiktar / item.adet) < 0.2).length,
            recentlyAdded: items.value.filter(item => {
              const date = new Date(item.createdAt)
              const now = new Date()
              return (now.getTime() - date.getTime()) < 1000 * 60 * 60 * 24 * 30
            }).length,
            activeCount: items.value.filter(item => item.durumu === 'Aktif').length,
            passiveCount: items.value.filter(item => item.durumu === 'Pasif').length,
            lastUpdate: new Date().toISOString()
          }
        })
      } else {
        throw new Error(response.message || 'Veriler alınamadı')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Bir hata oluştu'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchItem = async (id: string) => {
    try {
      loading.value = true
      const response = await celikService.getById(id)

      if (response.success) {
        currentItem.value = response.data
        return response.data
      } else {
        throw new Error(response.message || 'Kayıt bulunamadı')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Bir hata oluştu'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createItem = async (data: Partial<CelikItem>) => {
    try {
      loading.value = true
      const response = await celikService.create({
        ...data,
        malzemeCinsi: data.malzemeCinsi || '',  // required field
        kalite: data.kalite || '',              // required field
        tip: data.tip ?? undefined,             // required field
        adet: data.adet || 0,                   // required field
        kalanMiktar: data.kalanMiktar || 0,     // required field
        birim: data.birim || 'ADET',            // required field
        satinAlisFiyati: data.satinAlisFiyati || 0, // required field
        durumu: data.durumu || 'Aktif',         // required field
        proje: data.proje || 'Stok'             // required field
      })

      if (response.success) {
        items.value.unshift(response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Kayıt oluşturulamadı')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Bir hata oluştu'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (id: string, data: Partial<CelikItem>) => {
    try {
      loading.value = true
      const response = await celikService.update(id, data)

      if (response.success) {
        const index = items.value.findIndex(item => item._id === id || item.id === id)
        if (index !== -1) {
          items.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error(response.message || 'Kayıt güncellenemedi')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Bir hata oluştu'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteItem = async (id: string) => {
    try {
      loading.value = true
      const response = await celikService.delete(id)

      if (response.success) {
        items.value = items.value.filter(item => item._id !== id && item.id !== id)
      } else {
        throw new Error(response.message || 'Kayıt silinemedi')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Bir hata oluştu'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset store state
  const reset = () => {
    items.value = []
    currentItem.value = null
    loading.value = false
    error.value = null
  }

  // Add the addItem alias
  const addItem = createItem

  return {
    // State
    items,
    currentItem,
    loading,
    error,
    statistics, // sadece statistics'i export et

    // Getters
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
    reset
  }
})