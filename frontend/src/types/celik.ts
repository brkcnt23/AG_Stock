// frontend/src/types/celik.ts
export interface Celik {
  _id?: string
  id?: string
  malzemeTuru?: string
  malzemeCinsi: string
  kalite: string
  tip: string
  aciklama?: string
  en?: number
  boy?: number
  kalinlik?: number
  no?: number
  boruCap?: string
  etKalinlik?: string
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
  durumu?: 'Aktif' | 'Pasif'
}
export interface CelikFilter {
  malzemeCinsi?: string
  kalite?: string
  tip?: string
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
  }
  tedarikci?: string
  depoYeri?: string
  rafNo?: string
}
export interface CelikItem {
  _id: string
  id?: string
  malzemeTuru: 'celik'
  malzemeCinsi: string
  kalite: string
  tip: 'siyah' | 'paslanmaz' | 'aluminyum'
  no?: number
  boruCap?: string
  etKalinlik?: string
  uzunluk?: number
  adet: number
  kalanMiktar: number
  girisMiktar?: number
  cikisMiktar?: number
  birim: string
  satinAlisFiyati: number
  rafFiyati?: number
  dovizKur?: number
  paraBirimi?: 'TL' | 'USD' | 'EUR'
  tedarikci?: string
  proje?: string
  rafNo?: string
  girisTarihi?: string
  satinAlisTarihi?: string
  durumu: 'Aktif' | 'Pasif'
  aciklama?: string
  imDosyaNo?: string
  izlNo?: string
  createdAt: string
  updatedAt: string
}


export interface CelikStats {
  totalItems: number
  totalValue: number
  lowStock: number
  recentlyAdded: number
  activeCount?: number
  passiveCount?: number
  lastUpdate?: string
}

export interface CelikFormData {
  malzemeTuru: 'celik'
  malzemeCinsi: string
  kalite: string
  tip: 'siyah' | 'paslanmaz' | 'aluminyum'
  no?: number
  boruCap?: string
  etKalinlik?: string
  uzunluk?: number
  adet: number
  kalanMiktar: number
  birim: string
  satinAlisFiyati: number
  paraBirimi?: 'TL' | 'USD' | 'EUR'
  durumu: 'Aktif' | 'Pasif'
  proje?: string
  aciklama?: string
}

export const CELIK_KALITE_OPTIONS = [
  'St37', 'St52', 'S235JR', 'S275JR', 'S355JR',
  'DKP', 'HARDOX', 'WELDOX', 'Paslanmaz',
  'Alaşımlı Çelik', 'Karbon Çelik'
] as const

export const CELIK_TIP_OPTIONS = [
  'Levha', 'Profil', 'Boru', 'Çubuk', 'Tel',
  'Kaynak Çubuğu', 'Vida', 'Somun', 'Pul'
] as const

export const CELIK_BIRIM_OPTIONS = [
  'KG', 'ADET', 'METRE', 'M2', 'M3'
] as const

export const CELIK_DURUM_OPTIONS = [
  'Aktif', 'Pasif', 'Beklemede', 'Arızalı'
] as const

export const CELIK_PARA_BIRIMI_OPTIONS = [
  'TL', 'USD', 'EUR'
] as const

export type CelikKalite = typeof CELIK_KALITE_OPTIONS[number]
export type CelikTip = typeof CELIK_TIP_OPTIONS[number]
export type CelikBirim = typeof CELIK_BIRIM_OPTIONS[number]
export type CelikDurum = typeof CELIK_DURUM_OPTIONS[number]
export type CelikParaBirimi = typeof CELIK_PARA_BIRIMI_OPTIONS[number]