// frontend/src/types/fitil.ts
export interface Fitil {
  _id?: string
  id?: string
  
  // Temel Bilgiler
  malzeme: string
  cins: string
  kalite?: string
  aciklama?: string
  
  // Teknik Özellikler
  cap?: number // mm
  uzunluk?: number // metre
  renk?: string
  malzemeTuru?: string
  elastikiyet?: string
  sicaklikDirenci?: number
  
  // Stok Bilgileri
  adet: number
  kalanMiktar: number
  birim: string
  stokKodu?: string
  girisMiktar?: number
  cikisMiktar?: number
  
  // Lokasyon
  depoYeri?: string
  rafNo?: string
  bolum?: string
  
  // Proje ve Durum
  proje: string
  durumu: string
  
  // Fiyat Bilgileri
  satinAlisFiyati?: number
  paraBirimi?: string
  tedarikci?: string
  
  // Tarihler
  girisTarihi?: string
  sonKullanimTarihi?: string
  createdAt?: string
  updatedAt?: string
  
  // Ek Bilgiler
  notlar?: string
  resimUrl?: string
  sertifika?: string
  
  // Rezervasyon
  rezerveEdilen?: number
  kullanilanMiktar?: number
}

export interface FitilFilter {
  malzeme?: string
  cins?: string
  kalite?: string
  durumu?: string
  proje?: string
  stockStatus?: 'inStock' | 'lowStock' | 'outOfStock' | 'all'
  priceRange?: {
    min?: number
    max?: number
  }
  sizeRange?: {
    cap?: { min?: number, max?: number }
    uzunluk?: { min?: number, max?: number }
  }
  malzemeTuru?: string
  renk?: string
  tedarikci?: string
  depoYeri?: string
  rafNo?: string
}

export interface FitilStats {
  totalCount: number
  totalValue: number
  activeCount: number
  passiveCount: number
  lowStockCount: number
  outOfStockCount: number
  averagePrice: number
  topSuppliers: Array<{
    name: string
    count: number
    totalValue: number
  }>
  stockByProject: Array<{
    project: string
    count: number
    totalValue: number
  }>
  stockByMaterial: Array<{
    malzeme: string
    count: number
    percentage: number
  }>
  stockByColor: Array<{
    renk: string
    count: number
    percentage: number
  }>
  recentMovements: number
  lastUpdate: string
}

// frontend/src/types/fitil.ts
export interface FitilItem {
  _id: string
  malzeme: string
  cins: string
  kalite: string
  adet: number
  kalanMiktar: number
  birim: string
  satinAlisFiyati: number
  rafFiyati?: number
  aciklama?: string
  durumu: 'Aktif' | 'Pasif'
  proje: string
  stokKodu?: string
  renk?: string
  createdAt: string
  updatedAt: string
}


export interface FitilFormData {
  malzeme: string
  cins: string
  kalite?: string
  aciklama?: string
  cap?: number
  uzunluk?: number
  renk?: string
  malzemeTuru?: string
  elastikiyet?: string
  sicaklikDirenci?: number
  adet: number
  birim: string
  stokKodu?: string
  depoYeri?: string
  rafNo?: string
  bolum?: string
  proje: string
  durumu: string
  satinAlisFiyati?: number
  paraBirimi?: string
  tedarikci?: string
  notlar?: string
  resimUrl?: string
  sertifika?: string
}

export const FITIL_MALZEME_OPTIONS = [
  'Pamuk', 'Polyester', 'Naylon', 'Polipropilen',
  'Aramid', 'Cam Elyafı', 'Karbon Fiber', 'Jüt',
  'Doğal Kauçuk', 'Sentetik Kauçuk'
] as const

export const FITIL_CINS_OPTIONS = [
  'Dokuma', 'Örgü', 'Bükümlü', 'Düz',
  'Elastik', 'Sert', 'Yarı Elastik'
] as const

export const FITIL_RENK_OPTIONS = [
  'Beyaz', 'Siyah', 'Kırmızı', 'Mavi', 'Yeşil',
  'Sarı', 'Turuncu', 'Mor', 'Kahverengi', 'Gri'
] as const

export const FITIL_BIRIM_OPTIONS = [
  'METRE', 'KG', 'ADET', 'RULO', 'PAKET'
] as const

export const FITIL_DURUM_OPTIONS = [
  'Aktif', 'Pasif', 'Beklemede', 'Arızalı'
] as const

export const FITIL_PARA_BIRIMI_OPTIONS = [
  'TL', 'USD', 'EUR'
] as const

export const FITIL_MALZEME_TURU_OPTIONS = [
  'Doğal', 'Sentetik', 'Karma'
] as const

export const FITIL_ELASTIKIYET_OPTIONS = [
  'Yüksek', 'Orta', 'Düşük', 'Esnek Değil'
] as const

export type FitilMalzeme = typeof FITIL_MALZEME_OPTIONS[number]
export type FitilCins = typeof FITIL_CINS_OPTIONS[number]
export type FitilRenk = typeof FITIL_RENK_OPTIONS[number]
export type FitilBirim = typeof FITIL_BIRIM_OPTIONS[number]
export type FitilDurum = typeof FITIL_DURUM_OPTIONS[number]
export type FitilParaBirimi = typeof FITIL_PARA_BIRIMI_OPTIONS[number]
export type FitilMalzemeTuru = typeof FITIL_MALZEME_TURU_OPTIONS[number]
export type FitilElastikiyet = typeof FITIL_ELASTIKIYET_OPTIONS[number]