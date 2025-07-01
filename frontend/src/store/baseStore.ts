export interface BaseItem {
  _id?: string
  id?: string
  malzemeTuru: string  // ZORUNLU ALAN
  malzemeCinsi?: string
  cins?: string
  malzeme?: string
  kalite?: string
  tip?: string
  aciklama?: string
  olcu?: string
  boyut?: string
  cap?: number
  en?: number
  boy?: number
  kalinlik?: number
  uzunluk?: number
  adet?: number
  stok?: number
  kalanMiktar?: number
  girisMiktar?: number
  cikisMiktar?: number
  kullanilanMiktar?: number
  birim?: string
  satinAlisFiyati?: number
  rafFiyati?: number
  birimFiyat?: number
  dovizKur?: number
  paraBirimi?: string
  parabirimi?: string
  tedarikci?: string
  proje?: string
  rafNo?: string
  girisTarihi?: string
  satinAlisTarihi?: string | Date
  createdAt?: string
  updatedAt?: string
  imDosyaNo?: string
  izlNo?: string
}

// Sarf Item - malzemeTuru zorunlu
export interface SarfItem extends BaseItem {
  malzemeTuru: 'sarf'
  sarfTuru?: 'KAYNAK' | 'VIDA' | 'KESKI' | 'BAKIM' | 'TEMIZLIK' | 'YAGLAYICI' | 'DIĞER'
  kritikSeviye?: number
  minSiparis?: number
  sonKullanma?: string
  kullanimAlani?: 'IMALAT' | 'BAKIM' | 'TEMIZLIK' | 'MONTAJ' | 'GENEL'
  kullanimTalimati?: string
}

// Çelik Item - malzemeTuru zorunlu
export interface CelikItem extends BaseItem {
  malzemeTuru: 'celik'
  no?: number
  boruCap?: string
  etKalınlık?: string
}

// Membran Item - malzemeTuru zorunlu
export interface MembranItem extends BaseItem {
  malzemeTuru: 'membran'
  paletNo?: string
  marka?: string
  model?: string
  topSayisi?: number
  durumu?: 'Beklemede' | 'Kullanımda' | 'Tamamlandı' | 'İptal'
  durum?: 'Beklemede' | 'Kullanımda' | 'Tamamlandı' | 'İptal'
}

// Halat Item - malzemeTuru zorunlu
export interface HalatItem extends BaseItem {
  malzemeTuru: 'halat'
  _id: string
  id: string
  name: string
  kalite?: string
  cins: 'celik' | 'sentetik' | 'karma'
  cap: number
  uzunluk?: number
  stok: number
  birim: string
  birimFiyat?: number
  parabirimi?: 'TL' | 'USD' | 'EUR'
  tedarikci?: string
  createdAt: string
  updatedAt: string
}

// Fitil Item - malzemeTuru zorunlu
export interface FitilItem extends BaseItem {
  malzemeTuru: 'fitil'
  marka?: string
  renk?: string
  renkKodu?: string
  dayanim?: number
  elastikiyet?: string | number  // STRING veya NUMBER kabul et
  lotNo?: string
  uretimTarihi?: string
}

// 2. DÜZELTILMIŞ BASE STORE - src/store/baseStore.ts
import { ref, computed, type Ref } from 'vue'
import { BaseApiService } from '../api/baseApiService'

export interface Statistics {
  totalItems: number
  totalValue: number
  lowStock: number
  recentlyAdded: number
}

export interface StoreState<T> {
  items: Ref<T[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  statistics: Ref<Statistics>
}

export interface StoreActions<T> {
  fetchItems: (params?: any) => Promise<void>
  fetchStatistics: () => Promise<void>
  addItem: (itemData: Partial<T>) => Promise<void>
  updateItem: (id: string, itemData: Partial<T>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  getItem: (id: string) => Promise<T | null>
  clearError: () => void
  reset: () => void
}

export function createBaseStore<T extends BaseItem>(
  storeName: string, 
  apiService: BaseApiService
): () => StoreState<T> & StoreActions<T> & { 
  hasData: any, 
  isLoading: any, 
  hasError: any 
} {
  return () => {
    // State
    const items: Ref<T[]> = ref([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const statistics = ref<Statistics>({
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
        const response = await apiService.getItems<T>(params)
        if (response.success) {
          items.value = response.data
          await fetchStatistics()
        } else {
          throw new Error(response.message || 'Veri getirme hatası')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
        error.value = message
        throw err
      } finally {
        setLoading(false)
      }
    }

    const fetchStatistics = async () => {
      try {
        const response = await apiService.getStats<Statistics>()
        if (response.success) {
          Object.assign(statistics.value, response.data)
        }
      } catch (err) {
        console.warn(`⚠️ ${storeName} istatistikleri alınamadı:`, err)
      }
    }

    const addItem = async (itemData: Partial<T>) => {
      try {
        setLoading(true)
        const response = await apiService.createItem<T>(itemData)
        if (response.success) {
          items.value.unshift(response.data)
          await fetchStatistics()
        } else {
          throw new Error(response.message || 'Ekleme hatası')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ekleme hatası'
        error.value = message
        throw err
      } finally {
        setLoading(false)
      }
    }

    const updateItem = async (id: string, itemData: Partial<T>) => {
      try {
        setLoading(true)
        const response = await apiService.updateItem<T>(id, itemData)
        if (response.success) {
          const index = items.value.findIndex(item => (item._id || item.id) === id)
          if (index !== -1) {
            items.value.splice(index, 1, response.data)
          }
          await fetchStatistics()
        } else {
          throw new Error(response.message || 'Güncelleme hatası')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Güncelleme hatası'
        error.value = message
        throw err
      } finally {
        setLoading(false)
      }
    }

    const deleteItem = async (id: string) => {
      try {
        setLoading(true)
        const response = await apiService.deleteItem<T>(id)
        if (response.success) {
          const index = items.value.findIndex(item => (item._id || item.id) === id)
          if (index !== -1) {
            items.value.splice(index, 1)
          }
          await fetchStatistics()
        } else {
          throw new Error(response.message || 'Silme hatası')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Silme hatası'
        error.value = message
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
      items.value = []
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
      // State
      items,
      loading,
      error,
      statistics,
      
      // Computed
      hasData,
      isLoading,
      hasError,
      
      // Actions
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