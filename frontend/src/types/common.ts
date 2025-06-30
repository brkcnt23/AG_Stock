// frontend/src/types/common.ts - Fixed common types
export interface BaseApiItem {
  _id?: string
  id?: string
  createdAt?: string
  updatedAt?: string
}

// Sarf Item
export interface SarfItem extends BaseApiItem {
  malzeme?: string
  kalite?: string
  cins?: string
  malzemeCinsi?: 'KAYNAK' | 'Vida' | 'Keski' | 'Bakım' | 'Temizlik' | 'Yağlayıcı' | 'Elektrik' | 'Emniyet' | 'Diğer'
  en?: string
  boy?: string
  kalinlik?: string
  renk?: string
  birim?: string
  girisMiktar?: string
  cikisMiktar?: string
  kalanMiktar?: string
  girisTarihi?: string
  sonKullanma?: string
  satinAlisFiyati?: number
  paraBirimi?: 'TL' | 'USD' | 'EUR'
  tedarikci?: string
  lokasyon?: string
  aciklama?: string
  durumu?: 'Aktif' | 'Pasif' | 'Tukendi'
  kategori?: string
  barkod?: string
  seriNo?: string
  garanti?: string
  minStokMiktari?: string
  kritikSeviye?: number
  minSiparis?: number
  kullanimAlani?: string
  kullanimTalimati?: string
  sarfTuru?: string
  depoKonumu?: string
  rafNo?: string
  gonderilenProjeler?: Array<{
    projeAdi: string
    gonderimTarihi: string
    miktar: string
    durum: string
  }>
  projeReservasyonlari?: Array<{
    projeId: string
    projeAdi: string
    rezerveMiktar: string
    rezerveTarihi: string
    durum: string
  }>
}

// Celik Item
export interface CelikItem extends BaseApiItem {
  no?: number
  boruCap?: string
  etKalinlik?: string
  tip?: 'siyah' | 'paslanmaz' | 'aluminyum'
  malzemeCinsi?: string
  kalite?: string
  adet?: number
  birim?: string
  uzunluk?: number
  girisTarihi?: string
  satinAlisFiyati?: number
  paraBirimi?: 'TL' | 'USD' | 'EUR'
  tedarikci?: string
  lokasyon?: string
  aciklama?: string
  durumu?: 'Aktif' | 'Pasif'
  kategori?: string
  barkod?: string
  seriNo?: string
  minStokMiktari?: number
  depoKonumu?: string
  rafNo?: string
}

// Membran Item
export interface MembranItem extends BaseApiItem {
  paletNo?: number
  marka?: string
  model?: string
  tip?: string
  olcu?: string
  kalite?: string
  adet?: number
  birim?: string
  girisTarihi?: string
  satinAlisFiyati?: number
  paraBirimi?: 'TL' | 'USD' | 'EUR'
  tedarikci?: string
  lokasyon?: string
  aciklama?: string
  durumu?: 'Aktif' | 'Kullanımda' | 'Tamamlandı' | 'İptal'
  proje?: string
  sahibi?: string
  note?: string
  kategori?: string
  barkod?: string
  seriNo?: string
  minStokMiktari?: number
  depoKonumu?: string
  rafNo?: string
}

// Fitil Item
export interface FitilItem extends BaseApiItem {
  malzeme?: string
  kalite?: string
  cins?: string
  cap?: number
  uzunluk?: number
  birim?: string
  adet?: number
  girisTarihi?: string
  satinAlisFiyati?: number
  paraBirimi?: 'TL' | 'USD' | 'EUR'
  tedarikci?: string
  lokasyon?: string
  aciklama?: string
  durumu?: 'Aktif' | 'Pasif'
  kategori?: string
  barkod?: string
  seriNo?: string
  minStokMiktari?: number
  depoKonumu?: string
  rafNo?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface Statistics {
  totalItems: number
  totalValue: number
  lowStock: number
  recentlyAdded: number
}

// Common Enums
export const CURRENCIES = ['TL', 'USD', 'EUR'] as const
export const STATUS_OPTIONS = ['Aktif', 'Pasif', 'Tukendi'] as const
export const UNITS = ['adet', 'kg', 'metre', 'litre', 'paket', 'kutu', 'rulo'] as const

export type Currency = typeof CURRENCIES[number]
export type Status = typeof STATUS_OPTIONS[number]
export type Unit = typeof UNITS[number]