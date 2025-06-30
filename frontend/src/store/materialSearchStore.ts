// frontend/src/store/materialSearchStore.ts - Fixed without MongoDB
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { objectIdToString, createObjectId } from '../utils/objectId'
import { useSarfStore } from './sarfStore'
import { useCelikStore } from './celikStore'
import { useMembranStore } from './membranStore'
import { useHalatStore } from './halatStore'
import { useFitilStore } from './fitilStore'

export interface UnifiedMaterial {
  id: string  // String olarak tutulacak (UI compatibility)
  type: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil'
  name: string
  description?: string
  kalite?: string
  cins?: string
  specifications: Record<string, any>
  unit: string
  stockAvailable: boolean
  availableStock: number
  unitPrice?: number
  currency?: string
  supplier?: string
  originalId?: string  // Original ObjectId as string
}

export const useMaterialSearchStore = defineStore('materialSearch', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Store references
  const sarfStore = useSarfStore()
  const celikStore = useCelikStore()
  const membranStore = useMembranStore()
  const halatStore = useHalatStore()
  const fitilStore = useFitilStore()

  // Convert different material types to unified format
  const convertToUnified = (item: any, type: string): UnifiedMaterial => {
    // ID'yi string'e çevir
    const itemId = item._id || item.id
    const stringId = typeof itemId === 'string' ? itemId : objectIdToString(itemId)
    
    return {
      id: stringId,  // UI için string ID
      originalId: stringId,  // Original ObjectId string olarak sakla
      type: type as any,
      name: item.malzeme || item.name || item.tip || 'Unknown',
      description: item.aciklama || item.description,
      kalite: item.kalite,
      cins: item.cins,
      specifications: {
        en: item.en,
        boy: item.boy,
        kalinlik: item.kalinlik,
        uzunluk: item.uzunluk,
        cap: item.cap || item.halatCapi,
        renk: item.renk
      },
      unit: item.birim || 'ADET',
      stockAvailable: (item.kalanMiktar || item.adet || item.stok || 0) > 0,
      availableStock: parseFloat(item.kalanMiktar || item.adet || item.stok || '0'),
      unitPrice: item.satinAlisFiyati || item.birimFiyat,
      currency: item.paraBirimi || item.parabirimi || 'TL',
      supplier: item.tedarikci
    }
  }

  // Search all materials
  const searchAllMaterials = async (filters: any): Promise<UnifiedMaterial[]> => {
    loading.value = true
    error.value = null

    try {
      const results: UnifiedMaterial[] = []

      // Search each store based on type filter
      if (filters.type === 'all' || filters.type === 'sarf') {
        const sarfItems = sarfStore.items.filter(item => 
          matchesFilters(item, filters)
        ).map(item => convertToUnified(item, 'sarf'))
        results.push(...sarfItems)
      }

      if (filters.type === 'all' || filters.type === 'celik') {
        const celikItems = celikStore.items.filter(item => 
          matchesFilters(item, filters)
        ).map(item => convertToUnified(item, 'celik'))
        results.push(...celikItems)
      }

      if (filters.type === 'all' || filters.type === 'membran') {
        const membranItems = membranStore.items.filter(item => 
          matchesFilters(item, filters)
        ).map(item => convertToUnified(item, 'membran'))
        results.push(...membranItems)
      }

      if (filters.type === 'all' || filters.type === 'halat') {
        const halatItems = halatStore.halats.filter(item => 
          matchesFilters(item, filters)
        ).map(item => convertToUnified(item, 'halat'))
        results.push(...halatItems)
      }

      if (filters.type === 'all' || filters.type === 'fitil') {
        const fitilItems = fitilStore.items.filter(item => 
          matchesFilters(item, filters)
        ).map(item => convertToUnified(item, 'fitil'))
        results.push(...fitilItems)
      }

      return results
    } catch (err) {
      error.value = 'Arama sırasında hata oluştu'
      return []
    } finally {
      loading.value = false
    }
  }

  const matchesFilters = (item: any, filters: any): boolean => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [
        item.malzeme, item.name, item.tip, item.aciklama, 
        item.description, item.kalite, item.cins
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchableText.includes(searchTerm)) return false
    }

    // Kalite filter
    if (filters.kalite && item.kalite) {
      if (!item.kalite.toLowerCase().includes(filters.kalite.toLowerCase())) {
        return false
      }
    }

    // Stock availability filter
    if (filters.stockAvailable !== '') {
      const hasStock = (item.kalanMiktar || item.adet || item.stok || 0) > 0
      if (filters.stockAvailable === 'true' && !hasStock) return false
      if (filters.stockAvailable === 'false' && hasStock) return false
    }

    // Price range filter
    if (filters.priceRange?.min && (item.satinAlisFiyati || item.birimFiyat)) {
      const price = item.satinAlisFiyati || item.birimFiyat
      if (price < parseFloat(filters.priceRange.min)) return false
    }
    if (filters.priceRange?.max && (item.satinAlisFiyati || item.birimFiyat)) {
      const price = item.satinAlisFiyati || item.birimFiyat
      if (price > parseFloat(filters.priceRange.max)) return false
    }

    return true
  }

  // Create custom material
  const createCustomMaterial = (materialData: any): UnifiedMaterial => {
    const customId = createObjectId()  // Yeni ObjectId oluştur
    
    return {
      id: customId,  // String ID
      originalId: customId,  // Original ObjectId string olarak
      type: 'custom' as any,
      name: materialData.name,
      description: materialData.description,
      kalite: materialData.kalite,
      cins: materialData.cins,
      specifications: materialData.specifications || {},
      unit: materialData.unit || 'ADET',
      stockAvailable: false,
      availableStock: 0,
      unitPrice: materialData.unitPrice,
      currency: materialData.currency || 'TL',
      supplier: materialData.supplier
    }
  }

  return {
    loading,
    error,
    searchAllMaterials,
    createCustomMaterial
  }
})