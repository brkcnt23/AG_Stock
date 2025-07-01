// 1. DÜZELTILMIŞ COMMON TYPES - src/types/common.ts
export interface BaseItem {
  _id?: string
  id?: string
  malzemeTuru?: string  // OPTIONAL yapıldı çünkü API'den gelmeye bilir
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
  // Çelik-specific fields
  no?: number
  boruCap?: string
  etKalınlık?: string
  // Fitil-specific fields
  marka?: string
  renk?: string
  renkKodu?: string
  dayanim?: number
  elastikiyet?: string | number
  lotNo?: string
  uretimTarihi?: string
  // Membran-specific fields
  paletNo?: string
  model?: string
  topSayisi?: number
  durumu?: 'Aktif' | 'Pasif' | 'Beklemede' | 'Kullanımda' | 'Tamamlandı' | 'İptal'
  durum?: 'Beklemede' | 'Kullanımda' | 'Tamamlandı' | 'İptal'
  sahibi?: string
  note?: string
  mesh?: boolean
  // Halat-specific fields
  yapisi?: string
  gramaj?: number
  sertifikaNo?: string
  testRaporu?: string
  paslanmaz?: boolean
  kullanimAlani?: string
}

// Sarf Item
export interface SarfItem extends BaseItem {
  malzemeTuru: 'sarf'
  sarfTuru?: 'KAYNAK' | 'VIDA' | 'KESKI' | 'BAKIM' | 'TEMIZLIK' | 'YAGLAYICI' | 'DIĞER'
  kritikSeviye?: number
  minSiparis?: number
  sonKullanma?: string
  kullanimAlani?: 'IMALAT' | 'BAKIM' | 'TEMIZLIK' | 'MONTAJ' | 'GENEL'
  kullanimTalimati?: string
}

// Çelik Item
export interface CelikItem extends BaseItem {
  malzemeTuru: 'celik'
}

// Membran Item  
export interface MembranItem extends BaseItem {
  malzemeTuru: 'membran'
}

// Halat Item
export interface HalatItem extends BaseItem {
  malzemeTuru: 'halat'
  _id: string
  id: string
  name: string
  cins: 'celik' | 'sentetik' | 'karma'
  cap: number
  stok: number
  birim: string
  createdAt: string
  updatedAt: string
}

// Fitil Item
export interface FitilItem extends BaseItem {
  malzemeTuru: 'fitil'
}

// Project Material - EKSİK ALANLAR EKLENDİ
export interface ProjectMaterial {
  id?: string                    // ✅ EKLENEN
  materialId: string
  materialType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil'
  name: string
  requestedQuantity: number
  reservedQuantity: number
  usedQuantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  status: 'requested' | 'reserved' | 'used' | 'returned'
  stockAvailable: boolean
  availableStock: number
  stockItemId?: string           // ✅ EKLENEN
  specifications: Record<string, any>  // ✅ EKLENEN
  priority: 'low' | 'medium' | 'high' | 'critical'  // ✅ EKLENEN
  notes?: string
}

// Project Item - Statistics için düzeltme
export interface ProjectItem {
  _id?: string
  id?: string
  name: string
  description: string
  projectCode?: string
  customer?: string
  status: 'planning' | 'reserved' | 'active' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high'
  startDate?: string
  endDate?: string
  reserveUntil?: string
  estimatedCost: number
  actualCost: number
  budget: number
  totalMaterialCost?: number
  projectManager: string
  team: string[]
  materials: ProjectMaterial[]
  tags: string[]
  notes: string
  createdAt?: string
  updatedAt?: string
  // Calculated fields
  totalItems: number
  availableItems: number
  reservedItems: number
  missingItems: number
  stockSufficiency: number
}

// Statistics Interface
export interface Statistics {
  totalItems: number
  totalValue: number
  lowStock: number
  recentlyAdded: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}