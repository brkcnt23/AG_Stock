// types/project.ts - PROJE-STOK ENTEGRASYONU

import { BaseItem } from "./common"

export interface Project extends BaseItem {
  // TEMEL BİLGİLER
  name: string
  description?: string
  customer?: string                    // müşteri
  projectCode?: string                 // proje kodu
  
  // DURUM YÖNETİMİ
  status: 'planning' | 'reserved' | 'active' | 'completed' | 'cancelled'
  
  // TARİHLER
  startDate?: string
  endDate?: string
  estimatedDuration?: number           // gün cinsinden
  
  // FİNANSAL
  budget?: number
  totalMaterialCost?: number           // hesaplanan malzeme maliyeti
  currency?: 'TL' | 'USD' | 'EUR'
  exchangeRate?: number
  
  // MALZEMELER
  materials: ProjectMaterial[]
  
  // İSTATİSTİKLER
  totalItems: number                   // toplam malzeme kalemi
  availableItems: number               // stokta mevcut
  missingItems: number                 // eksik malzemeler
  reservedItems: number                // rezerve edilenler
  stockSufficiency: number             // % yeterlilik oranı
  
  // NOTLAR
  notes?: string
  requirements?: string                // özel gereksinimler
}

export interface ProjectMaterial {
  id: string
  materialId?: string
  materialType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'custom'
  
  // MALZEME BİLGİLERİ
  name: string
  description?: string
  kalite?: string
  
  // FIX: Make specifications required and non-undefined
  specifications: Record<string, any> // Changed from optional to required
  
  // MİKTAR YÖNETİMİ
  requestedQuantity: number
  reservedQuantity: number
  usedQuantity: number
  unit: string
  
  // STOK DURUMU
  stockAvailable: boolean
  availableStock?: number
  stockItemId?: string
  
  // FİYAT BİLGİLERİ
  unitPrice?: number
  totalPrice?: number
  currency?: 'TL' | 'USD' | 'EUR'
  supplier?: string
  
  // DURUM
  status: 'planned' | 'reserved' | 'ordered' | 'received' | 'used' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  // NOTLAR
  notes?: string
  alternativeOptions?: string[]
}

// STOK-PROJE BAĞLANTISI
export interface StockReservation extends BaseItem {
  stockId: string                     // stok item ID
  stockType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil'
  projectId: string                   // proje ID
  projectName: string                 // proje adı
  materialName: string                // malzeme adı
  reservedQuantity: number            // rezerve edilen miktar
  usedQuantity: number                // kullanılan miktar
  unit: string                        // birim
  reservationDate: string             // rezervasyon tarihi
  status: 'reserved' | 'active' | 'completed' | 'cancelled'
  notes?: string
}

// PROJE İSTATİSTİKLERİ
export interface ProjectStatistics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalBudget: number
  totalMaterialCost: number
  averageCompletion: number           // % ortalama tamamlanma
  mostUsedMaterials: Array<{
    materialType: string
    count: number
    totalValue: number
  }>
  topCustomers: Array<{
    name: string
    projectCount: number
    totalValue: number
  }>
}

// MALZEME ARAMA FİLTRELERİ
export interface MaterialSearchFilters {
  type?: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'all'
  search?: string
  kalite?: string
  cins?: string
  stockAvailable?: boolean
  priceRange?: {
    min: number
    max: number
  }
}

// PROJE OLUŞTURMA REQUESTİ
export interface CreateProjectRequest {
  project: Omit<Project, '_id' | 'materials' | 'totalItems' | 'availableItems' | 'missingItems' | 'reservedItems' | 'stockSufficiency' | 'totalMaterialCost'>
  materials: Omit<ProjectMaterial, 'id' | 'stockAvailable' | 'availableStock' | 'totalPrice' | 'status'>[]
}

// REZERVASYON REQUESTİ
export interface ReservationRequest {
  projectId: string
  materials: Array<{
    materialId: string
    stockId: string
    stockType: string
    quantity: number
  }>
}