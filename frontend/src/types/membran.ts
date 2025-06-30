// frontend/src/types/membran.ts
export interface Membran {
  _id?: string
  id?: string
  
  // Temel Bilgiler
  malzemeTuru: string
  malzemeCinsi: string
  kalite?: string
  aciklama?: string
  
  // Boyutlar
  en?: number // mm
  boy?: number // mm
  kalinlik?: number // mm
  cap?: number // mm (circular membranes için)
  alan?: number // m2
  
  // Teknik Özellikler
  basincDirenci?: number // bar
  sicaklikDirenci?: number // °C
  kimyasalDirenç?: string
  esneklik?: string
  renk?: string
  yuzeyTipi?: string
  
  // Stok Bilgileri
  adet: number
  kalanMiktar: number
  birim: string
  stokKodu?: string
  
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
  girisYarihi?: string
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

export interface MembranFilter {
  malzemeTuru?: string
  malzemeCinsi?: string
  kalite?: string
  durumu?: string
  proje?: string
  stockStatus?: 'inStock' | 'lowStock' | 'outOfStock' | 'all'
  priceRange?: {
    min?: number
    max?: number
  }
  sizeRange?: {
    en?: { min?: number, max?: number }
    boy?: { min?: number, max?: number }
    kalinlik?: { min?: number, max?: number }
    cap?: { min?: number, max?: number }
  }
  basincDirenci?: {
    min?: number
    max?: number
  }
  sicaklikDirenci?: {
    min?: number
    max?: number
  }
  yuzeyTipi?: string
  renk?: string
  tedarikci?: string
  depoYeri?: string
  rafNo?: string
}

export interface MembranStats {
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
  stockByMaterialType: Array<{
    malzemeTuru: string
    count: number
    percentage: number
  }>
  stockByQuality: Array<{
    kalite: string
    count: number
    percentage: number
  }>
  averagePressureResistance: number
  averageTemperatureResistance: number
  recentMovements: number
  lastUpdate: string
}

export interface MembranFormData {
  malzemeTuru: string
  malzemeCinsi: string
  kalite?: string
  aciklama?: string
  en?: number
  boy?: number
  kalinlik?: number
  cap?: number
  alan?: number
  basincDirenci?: number
  sicaklikDirenci?: number
  kimyasalDirenç?: string
  esneklik?: string
  renk?: string
  yuzeyTipi?: string
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

export const MEMBRAN_MALZEME_TURU_OPTIONS = [
  'Kauçuk', 'Plastik', 'Metal', 'Kompozit',
  'Silikon', 'PVC', 'PTFE', 'NBR', 'EPDM',
  'Viton', 'Neopren'
] as const

export const MEMBRAN_CINS_OPTIONS = [
  'Düz Membran', 'Yuvarlak Membran', 'Şekilli Membran',
  'Contalar', 'O-Ring', 'Gasket', 'Diafram'
] as const

export const MEMBRAN_YUZEY_TIPI_OPTIONS = [
  'Düz', 'Dokulu', 'Nervürlü', 'Pürüzlü',
  'Parlak', 'Mat', 'Desenli'
] as const

export const MEMBRAN_ESNEKLIK_OPTIONS = [
  'Çok Esnek', 'Esnek', 'Orta', 'Sert', 'Çok Sert'
] as const

export const MEMBRAN_KIMYASAL_DIRENC_OPTIONS = [
  'Asit Dirençli', 'Alkali Dirençli', 'Yağ Dirençli',
  'Su Dirençli', 'Çözgen Dirençli', 'Genel Amaçlı'
] as const

export const MEMBRAN_RENK_OPTIONS = [
  'Şeffaf', 'Siyah', 'Beyaz', 'Kırmızı', 'Mavi',
  'Yeşil', 'Sarı', 'Turuncu', 'Kahverengi', 'Gri'
] as const

export const MEMBRAN_BIRIM_OPTIONS = [
  'ADET', 'M2', 'KG', 'METRE', 'PAKET'
] as const

export const MEMBRAN_DURUM_OPTIONS = [
  'Aktif', 'Pasif', 'Beklemede', 'Arızalı'
] as const

export const MEMBRAN_PARA_BIRIMI_OPTIONS = [
  'TL', 'USD', 'EUR'
] as const

export type MembranMalzemeTuru = typeof MEMBRAN_MALZEME_TURU_OPTIONS[number]
export type MembranCins = typeof MEMBRAN_CINS_OPTIONS[number]
export type MembranYuzeyTipi = typeof MEMBRAN_YUZEY_TIPI_OPTIONS[number]
export type MembranEsneklik = typeof MEMBRAN_ESNEKLIK_OPTIONS[number]
export type MembranKimyasalDirenc = typeof MEMBRAN_KIMYASAL_DIRENC_OPTIONS[number]
export type MembranRenk = typeof MEMBRAN_RENK_OPTIONS[number]
export type MembranBirim = typeof MEMBRAN_BIRIM_OPTIONS[number]
export type MembranDurum = typeof MEMBRAN_DURUM_OPTIONS[number]
export type MembranParaBirimi = typeof MEMBRAN_PARA_BIRIMI_OPTIONS[number]