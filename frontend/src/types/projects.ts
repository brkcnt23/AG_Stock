// frontend/src/types/projects.ts

export interface Project {
  _id?: string
  id?: string
  createdAt?: string
  updatedAt?: string

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
  id?: string
  materialId: string
  materialType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'custom'

  // MALZEME BİLGİLERİ
  name: string
  description?: string
  kalite?: string
  
  // Specifications artık required
  specifications: Record<string, any>

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

export interface StockReservation {
  _id?: string
  id?: string
  createdAt?: string
  updatedAt?: string

  stockId: string
  stockType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil'
  projectId: string
  projectName: string
  materialName: string
  reservedQuantity: number
  usedQuantity: number
  unit: string
  reservationDate: string
  status: 'reserved' | 'active' | 'completed' | 'cancelled'
  notes?: string
}

export interface ProjectStatistics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalBudget: number
  totalMaterialCost: number
  averageCompletion: number
  mostUsedMaterials: Array<{ materialType: string; count: number; totalValue: number }>
  topCustomers: Array<{ name: string; projectCount: number; totalValue: number }>
}

export interface MaterialSearchFilters {
  type?: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'all'
  search?: string
  kalite?: string
  cins?: string
  stockAvailable?: boolean
  priceRange?: { min: number; max: number }
}

export interface CreateProjectRequest {
  project: Omit<Project, '_id' | 'id' | 'createdAt' | 'updatedAt' | 'materials' | 'totalItems' | 'availableItems' | 'missingItems' | 'reservedItems' | 'stockSufficiency' | 'totalMaterialCost'>
  materials: Omit<ProjectMaterial, 'id' | 'stockAvailable' | 'availableStock' | 'totalPrice' | 'status'>[]
}

export interface ReservationRequest {
  projectId: string
  materials: Array<{ materialId: string; stockId: string; stockType: string; quantity: number }>
}
export interface UpdateProjectRequest {
  projectId: string
  updates: Partial<Omit<Project, '_id' | 'id' | 'createdAt' | 'updatedAt' | 'materials' | 'totalItems' | 'availableItems' | 'missingItems' | 'reservedItems' | 'stockSufficiency' | 'totalMaterialCost'>>
  materials?: Partial<ProjectMaterial>[]
}
export interface ProjectFilter {
  status?: 'planning' | 'reserved' | 'active' | 'completed' | 'cancelled'
  customer?: string
  startDateRange?: { start?: string; end?: string }
  endDateRange?: { start?: string; end?: string }
  budgetRange?: { min?: number; max?: number }
  materialType?: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'custom'
  search?: string
}
export interface ProjectStats {
  totalCount: number
  activeCount: number
  completedCount: number
  cancelledCount: number
  totalBudget: number
  totalMaterialCost: number
  averageDuration: number
  topCustomers: Array<{
    name: string
    projectCount: number
    totalValue: number
  }>
  stockByMaterialType: Array<{
    materialType: string
    totalQuantity: number
    totalValue: number
  }>
}
export interface ProjectFormData {
  name: string
  description?: string
  customer?: string
  projectCode?: string
  status: 'planning' | 'reserved' | 'active' | 'completed' | 'cancelled'
  startDate?: string
  endDate?: string
  estimatedDuration?: number
  budget?: number
  currency?: 'TL' | 'USD' | 'EUR'
  exchangeRate?: number
  materials: ProjectMaterial[]
  notes?: string
  requirements?: string
}
export interface ProjectUpdateFormData {
  projectId: string
  name?: string
  description?: string
  customer?: string
  projectCode?: string
  status?: 'planning' | 'reserved' | 'active' | 'completed' | 'cancelled'
  startDate?: string
  endDate?: string
  estimatedDuration?: number
  budget?: number
  currency?: 'TL' | 'USD' | 'EUR'
  exchangeRate?: number
  materials?: ProjectMaterial[]
  notes?: string
  requirements?: string
}
export interface ProjectSearchFilters {
  status?: 'planning' | 'reserved' | 'active' | 'completed' | 'cancelled'
  customer?: string
  projectCode?: string
  startDateRange?: { start?: string; end?: string }
  endDateRange?: { start?: string; end?: string }
  budgetRange?: { min?: number; max?: number }
  search?: string
}
export interface ProjectMaterialSearchFilters {
  materialType?: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'custom'
  search?: string
  kalite?: string
  cins?: string
  stockAvailable?: boolean
  priceRange?: { min: number; max: number }
  projectId?: string
}
export interface ProjectMaterialStats {
  totalCount: number
  totalValue: number
  availableCount: number
  missingCount: number
  reservedCount: number
  averagePrice: number
  topMaterials: Array<{
    name: string
    count: number
    totalValue: number
  }>
  stockByType: Array<{
    materialType: string
    count: number
    percentage: number
  }>
  stockByQuality: Array<{
    kalite: string
    count: number
    percentage: number
  }>
}
// frontend/src/types/project.ts
export interface ProjectItem {
  _id: string
  name: string
  description: string
  status: 'planning' | 'reserved' | 'completed'
  priority: 'low' | 'medium' | 'high'
  startDate?: string
  endDate?: string
  reserveUntil?: string
  estimatedCost: number
  actualCost: number
  budget: number
  projectManager: string
  team: string[]
  materials: ProjectMaterial[]
  tags: string[]
  reservationHistory: ReservationHistory[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface ProjectMaterial {
  materialId: string
  materialType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'custom'
  name: string
  requestedQuantity: number
  reservedQuantity: number
  usedQuantity: number
  unit: string
  unitPrice?: number
  totalPrice?: number
  status: 'planned' | 'reserved' | 'ordered' | 'received' | 'used' | 'completed'
  stockAvailable: boolean
  availableStock?: number
  notes?: string
}

export interface ReservationHistory {
  date: string
  action: 'reserve' | 'use' | 'return' | 'cancel'
  materialId: string
  quantity: number
  notes?: string
  userId?: string
  userName?: string
}


export interface ProjectMaterialFormData {
  materialId: string
  materialType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil' | 'custom'
  name: string
  description?: string
  kalite?: string
  specifications: Record<string, any>
  requestedQuantity: number
  reservedQuantity?: number
  usedQuantity?: number
  unit: string
  stockAvailable?: boolean
  availableStock?: number
  stockItemId?: string
  unitPrice?: number
  totalPrice?: number
  currency?: 'TL' | 'USD' | 'EUR'
  supplier?: string
  status: 'planned' | 'reserved' | 'ordered' | 'received' | 'used' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
  alternativeOptions?: string[]
}
export interface ProjectMaterialUpdateFormData {
  materialId: string
  name?: string
  description?: string
  kalite?: string
  specifications?: Record<string, any>
  requestedQuantity?: number
  reservedQuantity?: number
  usedQuantity?: number
  unit?: string
  stockAvailable?: boolean
  availableStock?: number
  stockItemId?: string
  unitPrice?: number
  totalPrice?: number
  currency?: 'TL' | 'USD' | 'EUR'
  supplier?: string
  status?: 'planned' | 'reserved' | 'ordered' | 'received' | 'used' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  notes?: string
  alternativeOptions?: string[]
}
export interface ProjectMaterialReservationRequest {
  projectId: string
  materials: Array<{
    materialId: string
    stockId: string
    stockType: 'sarf' | 'celik' | 'membran' | 'halat' | 'fitil'
    quantity: number
  }>
}
export interface ProjectMaterialUpdateRequest {
  projectId: string
  materialId: string
  updates: Partial<Omit<ProjectMaterial, 'id' | 'materialId' | 'stockAvailable' | 'availableStock' | 'totalPrice' | 'status'>>
}