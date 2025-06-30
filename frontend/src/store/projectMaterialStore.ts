// frontend/src/store/projectMaterialStore.ts - Fixed without MongoDB
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { objectIdToString, createObjectId } from '../utils/objectId'
import { useMaterialSearchStore } from './materialSearchStore'
import { useSarfStore } from './sarfStore'
import { useCelikStore } from './celikStore'
import { useMembranStore } from './membranStore'
import { useHalatStore } from './halatStore'
import { useFitilStore } from './fitilStore'

export interface ProjectMaterial {
  id: string  // String ID for UI
  originalId?: string  // Original ObjectId as string
  materialId?: string // String ID for UI
  materialOriginalId?: string  // Original ObjectId as string
  materialType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'custom'
  
  // Malzeme bilgileri
  name: string
  description?: string
  kalite?: string
  cins?: string
  specifications: Record<string, any>
  
  // Miktar yönetimi
  requestedQuantity: number
  reservedQuantity: number
  usedQuantity: number
  unit: string
  
  // Stok durumu
  stockAvailable: boolean
  availableStock: number
  stockItemId?: string  // String ID for UI
  stockItemOriginalId?: string  // Original ObjectId as string
  
  // Fiyat bilgileri
  unitPrice?: number
  totalPrice?: number
  currency?: 'TL' | 'USD' | 'EUR'
  supplier?: string
  
  // Durum
  status: 'planned' | 'reserved' | 'ordered' | 'received' | 'used' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  // Notlar
  notes?: string
  alternativeOptions?: string[]
}

export interface StockReservation {
  id: string  // String ID for UI
  originalId?: string  // Original ObjectId as string
  stockId: string  // String ID for UI
  stockOriginalId?: string  // Original ObjectId as string
  stockType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil'
  projectId: string  // String ID for UI
  projectOriginalId?: string  // Original ObjectId as string
  projectName: string
  materialName: string
  reservedQuantity: number
  usedQuantity: number
  unit: string
  reservationDate: string
  status: 'reserved' | 'active' | 'completed' | 'cancelled'
  notes?: string
}

export const useProjectMaterialStore = defineStore('projectMaterial', () => {
  // Store references
  const sarfStore = useSarfStore()
  const celikStore = useCelikStore()
  const membranStore = useMembranStore()
  const halatStore = useHalatStore()
  const fitilStore = useFitilStore()

  // State
  const reservations = ref<StockReservation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const getReservationsByProject = computed(() => {
    return (projectId: string) => {
      const stringProjectId = typeof projectId === 'string' ? projectId : objectIdToString(projectId)
      return reservations.value.filter(r => r.projectId === stringProjectId)
    }
  })

  const getReservationsByStock = computed(() => {
    return (stockId: string, stockType: string) => {
      const stringStockId = typeof stockId === 'string' ? stockId : objectIdToString(stockId)
      return reservations.value.filter(r => 
        r.stockId === stringStockId && r.stockType === stockType
      )
    }
  })

  const getActiveReservations = computed(() => {
    return reservations.value.filter(r => 
      r.status === 'reserved' || r.status === 'active'
    )
  })

  // Actions
  const createProjectMaterialFromStock = (unifiedMaterial: any, quantity: number): ProjectMaterial => {
    const materialId = createObjectId()
    
    return {
      id: materialId,  // String ID
      originalId: materialId,  // Original ObjectId as string
      materialId: unifiedMaterial.id,  // String ID from unified material
      materialOriginalId: unifiedMaterial.originalId,  // Original ObjectId as string
      materialType: unifiedMaterial.type,
      name: unifiedMaterial.name,
      description: unifiedMaterial.description,
      kalite: unifiedMaterial.kalite,
      cins: unifiedMaterial.cins,
      specifications: unifiedMaterial.specifications,
      requestedQuantity: quantity,
      reservedQuantity: 0,
      usedQuantity: 0,
      unit: unifiedMaterial.unit,
      stockAvailable: unifiedMaterial.stockAvailable,
      availableStock: unifiedMaterial.availableStock,
      stockItemId: unifiedMaterial.id,  // String ID
      stockItemOriginalId: unifiedMaterial.originalId,  // Original ObjectId as string
      unitPrice: unifiedMaterial.unitPrice,
      totalPrice: (unifiedMaterial.unitPrice || 0) * quantity,
      currency: unifiedMaterial.currency as 'TL' | 'USD' | 'EUR',
      supplier: unifiedMaterial.supplier,
      status: 'planned',
      priority: 'medium',
      notes: '',
      alternativeOptions: []
    }
  }

  const createCustomProjectMaterial = (materialData: any): ProjectMaterial => {
    const materialId = createObjectId()
    
    return {
      id: materialId,  // String ID
      originalId: materialId,  // Original ObjectId as string
      materialType: 'custom',
      name: materialData.name,
      description: materialData.description,
      kalite: materialData.kalite,
      cins: materialData.cins,
      specifications: materialData.specifications || {},
      requestedQuantity: materialData.quantity || 1,
      reservedQuantity: 0,
      usedQuantity: 0,
      unit: materialData.unit || 'ADET',
      stockAvailable: false,
      availableStock: 0,
      unitPrice: materialData.unitPrice,
      totalPrice: (materialData.unitPrice || 0) * (materialData.quantity || 1),
      currency: (materialData.currency || 'TL') as 'TL' | 'USD' | 'EUR',
      supplier: materialData.supplier,
      status: 'ordered', // Özel malzemeler sipariş edilmeli
      priority: (materialData.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical',
      notes: materialData.notes || '',
      alternativeOptions: []
    }
  }

  const reserveMaterial = async (
    projectId: string, 
    projectName: string, 
    material: ProjectMaterial
  ): Promise<boolean> => {
    if (!material.materialId || material.materialType === 'custom') {
      throw new Error('Bu malzeme rezerve edilemez (özel malzeme veya stokta yok)')
    }

    if (!material.stockAvailable || material.availableStock < material.requestedQuantity) {
      throw new Error('Yeterli stok bulunmuyor')
    }

    try {
      loading.value = true

      const reservationId = createObjectId()
      const stringProjectId = typeof projectId === 'string' ? projectId : objectIdToString(projectId)

      // Rezervasyon oluştur
      const reservation: StockReservation = {
        id: reservationId,  // String ID
        originalId: reservationId,  // Original ObjectId as string
        stockId: material.stockItemId!,  // String ID
        stockOriginalId: material.stockItemOriginalId,  // Original ObjectId as string
        stockType: material.materialType,
        projectId: stringProjectId,  // String ID
        projectOriginalId: projectId as string,  // Original ObjectId as string
        projectName,
        materialName: material.name,
        reservedQuantity: material.requestedQuantity,
        usedQuantity: 0,
        unit: material.unit,
        reservationDate: new Date().toISOString(),
        status: 'reserved',
        notes: material.notes || ''
      }

      reservations.value.push(reservation)

      // Stokta rezerve miktarını güncelle
      await updateStockReservation(
        material.materialType, 
        material.materialOriginalId || material.materialId!, 
        material.requestedQuantity, 
        'reserve'
      )

      // Malzeme durumunu güncelle
      material.reservedQuantity = material.requestedQuantity
      material.status = 'reserved'

      return true

    } catch (err) {
      error.value = 'Rezervasyon hatası: ' + (err as Error).message
      return false
    } finally {
      loading.value = false
    }
  }

  const startProject = async (projectId: string): Promise<boolean> => {
    try {
      const stringProjectId = typeof projectId === 'string' ? projectId : objectIdToString(projectId)
      
      // Projeye ait rezervasyonları aktif yap
      const projectReservations = reservations.value.filter(r => 
        r.projectId === stringProjectId && r.status === 'reserved'
      )

      for (const reservation of projectReservations) {
        reservation.status = 'active'
      }

      return true

    } catch (err) {
      error.value = 'Proje başlatma hatası: ' + (err as Error).message
      return false
    }
  }

  const completeProject = async (projectId: string): Promise<boolean> => {
    try {
      const stringProjectId = typeof projectId === 'string' ? projectId : objectIdToString(projectId)
      
      // Projeye ait aktif rezervasyonları tamamla
      const projectReservations = reservations.value.filter(r => 
        r.projectId === stringProjectId && r.status === 'active'
      )

      for (const reservation of projectReservations) {
        // Kullanılan miktarı = rezerve edilen miktar olarak varsay
        reservation.usedQuantity = reservation.reservedQuantity
        reservation.status = 'completed'

        // Stoktan kullanılan miktarı çıkar
        await updateStockUsage(
          reservation.stockType, 
          reservation.stockOriginalId || reservation.stockId, 
          reservation.usedQuantity
        )
      }

      return true

    } catch (err) {
      error.value = 'Proje tamamlama hatası: ' + (err as Error).message
      return false
    }
  }

  const cancelReservation = async (reservationId: string): Promise<boolean> => {
    try {
      const stringReservationId = typeof reservationId === 'string' ? reservationId : objectIdToString(reservationId)
      const reservation = reservations.value.find(r => r.id === stringReservationId)
      
      if (!reservation) {
        throw new Error('Rezervasyon bulunamadı')
      }

      // Stokta rezerve miktarını geri al
      await updateStockReservation(
        reservation.stockType, 
        reservation.stockOriginalId || reservation.stockId, 
        reservation.reservedQuantity, 
        'cancel'
      )

      // Rezervasyonu iptal et
      reservation.status = 'cancelled'

      return true

    } catch (err) {
      error.value = 'Rezervasyon iptali hatası: ' + (err as Error).message
      return false
    }
  }

  const updateStockReservation = async (
    stockType: string, 
    stockId: string, 
    quantity: number, 
    action: 'reserve' | 'cancel'
  ): Promise<void> => {
    const store = getStoreByType(stockType)
    if (!store) return

    const stringStockId = typeof stockId === 'string' ? stockId : objectIdToString(stockId)
    let item: any

    // Store'dan item'ı bul - store türüne göre farklı property'ler
    if (stockType === 'halat') {
      item = (store as any).halats.find((item: any) => {
        const itemId = item._id || item.id
        const itemStringId = typeof itemId === 'string' ? itemId : objectIdToString(itemId)
        return itemStringId === stringStockId
      })
    } else {
      item = (store as any).items.find((item: any) => {
        const itemId = item._id || item.id
        const itemStringId = typeof itemId === 'string' ? itemId : objectIdToString(itemId)
        return itemStringId === stringStockId
      })
    }
    
    if (!item) return

    // Rezerve edilen miktar alanını ekle (yoksa)
    if (!item.hasOwnProperty('rezerveEdilen')) {
      (item as any).rezerveEdilen = 0
    }

    if (action === 'reserve') {
      (item as any).rezerveEdilen = ((item as any).rezerveEdilen || 0) + quantity
    } else if (action === 'cancel') {
      (item as any).rezerveEdilen = Math.max(0, ((item as any).rezerveEdilen || 0) - quantity)
    }

    // Store'u güncelle
    const rawId = item._id ?? item.id
    if (!rawId) {
      throw new Error('Güncellenecek stok kalemi için id bulunamadı')
    }
    const updateId = typeof rawId === 'string' ? rawId : objectIdToString(rawId)
    
    // Store türüne göre güncelleme fonksiyonu çağır
    if (stockType === 'halat') {
      await (store as any).updateHalat(updateId, item as any)
    } else {
      await (store as any).updateItem(updateId, item as any)
    }
  }

  const updateStockUsage = async (
    stockType: string, 
    stockId: string, 
    usedQuantity: number
  ): Promise<void> => {
    const store = getStoreByType(stockType)
    if (!store) return

    const stringStockId = typeof stockId === 'string' ? stockId : objectIdToString(stockId)
    let item: any

    // Store'dan item'ı bul - store türüne göre farklı property'ler
    if (stockType === 'halat') {
      item = (store as any).halats.find((item: any) => {
        const itemId = item._id || item.id
        const itemStringId = typeof itemId === 'string' ? itemId : objectIdToString(itemId)
        return itemStringId === stringStockId
      })
    } else {
      item = (store as any).items.find((item: any) => {
        const itemId = item._id || item.id
        const itemStringId = typeof itemId === 'string' ? itemId : objectIdToString(itemId)
        return itemStringId === stringStockId
      })
    }
    
    if (!item) return

    // Farklı stok tiplerinin farklı alan isimleri var
    let currentUsed = 0
    let currentRemaining = 0

    // Çıkış miktarını güncelle
    if ('cikisMiktar' in item) {
      currentUsed = parseFloat(item.cikisMiktar as string || '0')
      item.cikisMiktar = String(currentUsed + usedQuantity)
    }

    // Kalan miktarı güncelle
    if ('kalanMiktar' in item) {
      currentRemaining = parseFloat(item.kalanMiktar as string || '0')
      item.kalanMiktar = String(Math.max(0, currentRemaining - usedQuantity))
    } else if ('adet' in item && typeof item.adet === 'number') {
      currentRemaining = item.adet
      item.adet = Math.max(0, currentRemaining - usedQuantity)
    } else if ('stok' in item && typeof item.stok === 'number') {
      currentRemaining = item.stok
      item.stok = Math.max(0, currentRemaining - usedQuantity)
    } else if ('topSayisi' in item) {
      currentRemaining = parseFloat(item.topSayisi as string || '0')
      item.topSayisi = String(Math.max(0, currentRemaining - usedQuantity))
    }

    // Rezerve edilen miktarı azalt
    if ('rezerveEdilen' in item) {
      const rezerveEdilen: number = typeof (item as any).rezerveEdilen === 'number'
        ? (item as any).rezerveEdilen
        : parseFloat((item as any).rezerveEdilen) || 0
      ;(item as any).rezerveEdilen = Math.max(0, rezerveEdilen - usedQuantity)
    }

    // Store'u güncelle
    const rawId = item._id ?? item.id
    if (!rawId) {
      throw new Error('Güncellenecek stok kalemi için id bulunamadı')
    }
    const updateId = typeof rawId === 'string' ? rawId : objectIdToString(rawId)
    
    // Store türüne göre güncelleme fonksiyonu çağır
    if (stockType === 'halat') {
      await (store as any).updateHalat(updateId, item as any)
    } else {
      await (store as any).updateItem(updateId, item as any)
    }
  }

  const getStoreByType = (stockType: string) => {
    switch (stockType) {
      case 'sarf': return sarfStore
      case 'celik': return celikStore
      case 'membran': return membranStore
      case 'halat': return halatStore
      case 'fitil': return fitilStore
      default: return null
    }
  }

  const calculateStockSufficiency = (materials: ProjectMaterial[]): number => {
    if (materials.length === 0) return 100

    const sufficientCount = materials.filter(m => 
      m.stockAvailable && m.availableStock >= m.requestedQuantity
    ).length

    return Math.round((sufficientCount / materials.length) * 100)
  }

  const getProjectStatistics = (materials: ProjectMaterial[]) => {
    const total = materials.length
    const available = materials.filter(m => m.stockAvailable).length
    const missing = materials.filter(m => !m.stockAvailable).length
    const reserved = materials.filter(m => m.status === 'reserved').length
    const sufficiency = calculateStockSufficiency(materials)

    return {
      totalItems: total,
      availableItems: available,
      missingItems: missing,
      reservedItems: reserved,
      stockSufficiency: sufficiency
    }
  }

  // Material çakışma kontrolü
  const checkMaterialConflicts = (materials: ProjectMaterial[]): any[] => {
    const conflicts: any[] = []
    
    materials.forEach(material => {
      if (material.stockAvailable && material.materialId) {
        const reservedAmount = getReservationsByStock.value(
          material.materialOriginalId || material.materialId, 
          material.materialType
        )
          .filter(r => r.status === 'reserved' || r.status === 'active')
          .reduce((sum, r) => sum + r.reservedQuantity, 0)
        
        const totalNeeded = reservedAmount + material.requestedQuantity
        
        if (totalNeeded > material.availableStock) {
          conflicts.push({
            material,
            needed: material.requestedQuantity,
            available: material.availableStock - reservedAmount,
            shortage: totalNeeded - material.availableStock
          })
        }
      }
    })

    return conflicts
  }

  return {
    // State
    reservations,
    loading,
    error,
    
    // Computed
    getReservationsByProject,
    getReservationsByStock,
    getActiveReservations,
    
    // Actions
    createProjectMaterialFromStock,
    createCustomProjectMaterial,
    reserveMaterial,
    startProject,
    completeProject,
    cancelReservation,
    calculateStockSufficiency,
    getProjectStatistics,
    checkMaterialConflicts
  }
})