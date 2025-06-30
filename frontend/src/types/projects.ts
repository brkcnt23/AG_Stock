// types/projects.ts - GÜNCELLENMIŞ (ObjectId destekli)
import { ObjectId } from 'mongodb'
import { BaseItem } from "./common"

export interface Project extends BaseItem {
  _id?: ObjectId | string  // ObjectId destekli
  
  // TEMEL BİLGİLER
  name: string
  description?: string
  customer?: string
  projectCode?: string
  
  // DURUM YÖNETİMİ
  status: 'planning' | 'reserved' | 'active' | 'completed' | 'cancelled'
  
  // TARİHLER
  startDate?: string
  endDate?: string
  estimatedDuration?: number
  
  // FİNANSAL
  budget?: number
  totalMaterialCost?: number
  currency?: 'TL' | 'USD' | 'EUR'
  exchangeRate?: number
  
  // MALZEMELER
  materials: ProjectMaterial[]
  
  // İSTATİSTİKLER
  totalItems: number
  availableItems: number
  missingItems: number
  reservedItems: number
  stockSufficiency: number
  
  // NOTLAR
  notes?: string
  requirements?: string
}

export interface ProjectMaterial {
  id: ObjectId | string  // ObjectId destekli
  materialId?: ObjectId | string  // ObjectId destekli
  materialType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'custom'
  
  // MALZEME BİLGİLERİ
  name: string
  description?: string
  kalite?: string
  
  // Specifications artık required ve undefined olmayacak
  specifications: Record<string, any>
  
  // MİKTAR YÖNETİMİ
  requestedQuantity: number
  reservedQuantity: number
  usedQuantity: number
  unit: string
  
  // STOK DURUMU
  stockAvailable: boolean
  availableStock?: number
  stockItemId?: ObjectId | string  // ObjectId destekli
  
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

// STOK-PROJE BAĞLANTISI - ObjectId destekli
export interface StockReservation extends BaseItem {
  _id?: ObjectId | string  // ObjectId destekli
  stockId: ObjectId | string  // ObjectId destekli
  stockType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil'
  projectId: ObjectId | string  // ObjectId destekli
  projectName: string
  materialName: string
  reservedQuantity: number
  usedQuantity: number
  unit: string
  reservationDate: string
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
  averageCompletion: number
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

// PROJE OLUŞTURMA REQUESTİ - ObjectId destekli
export interface CreateProjectRequest {
  project: Omit<Project, '_id' | 'materials' | 'totalItems' | 'availableItems' | 'missingItems' | 'reservedItems' | 'stockSufficiency' | 'totalMaterialCost'>
  materials: Omit<ProjectMaterial, 'id' | 'stockAvailable' | 'availableStock' | 'totalPrice' | 'status'>[]
}

// REZERVASYON REQUESTİ - ObjectId destekli
export interface ReservationRequest {
  projectId: ObjectId | string  // ObjectId destekli
  materials: Array<{
    materialId: ObjectId | string  // ObjectId destekli
    stockId: ObjectId | string     // ObjectId destekli
    stockType: string
    quantity: number
  }>
}