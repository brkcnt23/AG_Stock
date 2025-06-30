// frontend/src/types/sarf.ts
export interface Sarf {
  _id?: string
  id?: string
  
  // Temel Bilgiler
  malzeme: string
  cins: string
  tip: string
  aciklama?: string
  
  // Boyutlar/Özellikler
  olcu?: string
  boyut?: string
  cap?: number
  uzunluk?: number
  agirlik?: number
  renk?: string
  
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
  barkod?: string
  
  // Rezervasyon
  rezerveEdilen?: number
  kullanilanMiktar?: number
}

export interface SarfFilter {
  malzeme?: string
  cins?: string
  tip?: string
  durumu?: string
  proje?: string
  stockStatus?: 'inStock' | 'lowStock' | 'outOfStock' | 'all'
  priceRange?: {
    min?: number
    max?: number
  }
  renk?: string
  tedarikci?: string
  depoYeri?: string
  rafNo?: string
}

export interface SarfStats {
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
  stockByType: Array<{
    tip: string
    count: number
    percentage: number
  }>
  recentMovements: number
  lastUpdate: string
}

export interface SarfFormData {
  malzeme: string
  cins: string
  tip: string
  aciklama?: string
  olcu?: string
  boyut?: string
  cap?: number
  uzunluk?: number
  agirlik?: number
  renk?: string
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
  barkod?: string
}

export const SARF_MALZEME_OPTIONS = [
  'Kaynak Elektrodları', 'Kesici Diskler', 'Taşlama Diskleri',
  'Zımpara Kağıdı', 'Vida Somunlar', 'Perçinler',
  'Keçeler', 'Fırçalar', 'Yağlar', 'Gresler',
  'Contalar', 'Bantlar', 'Yapıştırıcılar', 'Temizlik Malzemeleri'
] as const

export const SARF_CINS_OPTIONS = [
  'A Kalite', 'B Kalite', 'C Kalite', 'Standart', 'Premium'
] as const

export const SARF_TIP_OPTIONS = [
  'Tüketim Malzemesi', 'Yedek Parça', 'Bakım Malzemesi',
  'Temizlik Malzemesi', 'Güvenlik Malzemesi', 'Ofis Malzemesi'
] as const

export const SARF_BIRIM_OPTIONS = [
  'ADET', 'KG', 'LITRE', 'METRE', 'PAKET', 'KUTU', 'RULO'
] as const

export const SARF_DURUM_OPTIONS = [
  'Aktif', 'Pasif', 'Beklemede', 'Arızalı'
] as const

export const SARF_PARA_BIRIMI_OPTIONS = [
  'TL', 'USD', 'EUR'
] as const

export const SARF_RENK_OPTIONS = [
  'Belirsiz', 'Beyaz', 'Siyah', 'Kırmızı', 'Mavi', 'Yeşil',
  'Sarı', 'Turuncu', 'Mor', 'Kahverengi', 'Gri', 'Şeffaf'
] as const

export type SarfMalzeme = typeof SARF_MALZEME_OPTIONS[number]
export type SarfCins = typeof SARF_CINS_OPTIONS[number]
export type SarfTip = typeof SARF_TIP_OPTIONS[number]
export type SarfBirim = typeof SARF_BIRIM_OPTIONS[number]
export type SarfDurum = typeof SARF_DURUM_OPTIONS[number]
export type SarfParaBirimi = typeof SARF_PARA_BIRIMI_OPTIONS[number]
export type SarfRenk = typeof SARF_RENK_OPTIONS[number]