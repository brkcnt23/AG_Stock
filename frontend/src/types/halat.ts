// frontend/src/types/halat.ts - Halat type definitions
export interface HalatItem {
  _id: string // MongoDB'den gelen orijinal ID
  name: string
  kalite: string
  cins: 'celik' | 'sentetik' | 'karma'
  cap: number
  uzunluk?: number
  stok: number
  birim: string
  birimFiyat?: number
  paraBirimi?: string
  tedarikci?: string
  minStokSeviyesi?: number
  maxStokSeviyesi?: number
  depo?: string
  raf?: string
  aciklama?: string
  createdAt?: string
  updatedAt?: string
}

export interface HalatFilter {
  search?: string
  status?: 'stokta' | 'tukendi' | 'kritik' | ''
  type?: 'celik' | 'sentetik' | 'karma' | ''
  minCap?: number
  maxCap?: number
  tedarikci?: string
  depo?: string
}

export interface HalatStats {
  totalCount: number
  inStockCount: number
  outOfStockCount: number
  criticalStockCount: number
  totalValue: number
  stockDistribution: Array<{
    _id: string
    count: number
    totalStock: number
  }>
  stockSufficiency: number
}

export interface CreateHalatData {
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
  minStokSeviyesi?: number
  maxStokSeviyesi?: number
  depo?: string
  raf?: string
  aciklama?: string
  ozellikler?: Record<string, any>
}

export interface UpdateHalatData extends Partial<CreateHalatData> {
  // All fields are optional for updates
}

export interface HalatStockOperation {
  stok: number
  operation: 'set' | 'add' | 'subtract'
  reason?: string
  performedBy?: string
}