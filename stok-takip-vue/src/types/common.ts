// types/common.ts - GÜNCELLENMIŞ VE GENİŞLETİLMİŞ
export interface BaseItem {
  _id?: string
  id?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  
  // Rezervasyon için ek alanlar
  rezerveEdilen?: number  // Proje için rezerve edilen miktar
  projeReservasyonlari?: ProjectReservation[]  // Bu malzemeyi rezerve eden projeler
}

export interface ProjectReservation {
  projectId: string
  projectName: string
  quantity: number
  status: 'reserved' | 'active' | 'completed'
  reservedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  total?: number
  page?: number
  limit?: number
}

export interface BaseFilters {
  search?: string
  page?: number
  limit?: number
}

// SARF MALZEME
export interface SarfItem extends BaseItem {
  malzeme: string
  kalite?: string
  cins?: string
  malzemeCinsi?: 'KAYNAK' | 'VIDA' | 'KESKI' | 'BAKIM' | 'TEMIZLIK' | 'YAGLAYICI' | 'ELEKTRIK' | 'EMNIYET' | 'DIĞER'
  en?: string | number
  boy?: string | number
  kalinlik?: string | number
  uzunluk?: string | number
  proje?: string
  yon?: string
  imDosyaNo?: string
  izlNo?: string
  rafNo?: string
  girisTarihi?: string
  girisMiktar?: string | number
  cikisMiktar?: string | number
  kalanMiktar?: string | number
  malzemeTuru?: 'sarf' | 'paslanmaz' | 'aluminyum' | 'çelik' | 'diğer'
  satinAlisTarihi?: Date | string
  satinAlisFiyati?: number
  dovizKur?: number
  tedarikci?: string
  birim?: 'ADET' | 'KG' | 'METRE' | 'M2' | 'PAKET' | 'KUTU'
  paraBirimi?: 'TL' | 'USD' | 'EUR'
  
  // Sarf malzemeye özel alanlar
  sarfTuru?: 'KAYNAK' | 'VIDA' | 'KESKI' | 'BAKIM' | 'TEMIZLIK' | 'YAGLAYICI' | 'DIĞER'
  kritikSeviye?: string | number
  minSiparis?: string | number
  sonKullanma?: string
  kullanimAlani?: 'IMALAT' | 'BAKIM' | 'TEMIZLIK' | 'MONTAJ' | 'GENEL'
  kullanimTalimati?: string
}

// MEMBRAN
export interface MembranItem extends BaseItem {
  paletNo?: string
  marka?: string
  model?: string
  tip?: string
  renk?: string
  renkKodu?: string
  partiNo?: string
  seriNo?: string
  cins?: 'PTFE' | 'ETFE' | 'PVC' | 'POLYESTER' | 'DIĞER'
  topSayisi?: string | number
  en?: string | number
  topUzunlugu?: string | number
  toplamUzunluk?: string | number
  alan?: string | number
  mesh?: boolean
  proje?: string
  durum?: 'Beklemede' | 'Kullanımda' | 'Tamamlandı' | 'İptal'
  note?: string
  sahibi?: string
  satinAlisFiyati?: number
  dovizKur?: number
  paraBirimi?: 'TL' | 'USD' | 'EUR'
  satinAlisTarihi?: Date | string
  malzemeTuru?: 'membran'
  
  // Rezervasyon için stok miktarı alanları
  girisMiktar?: string | number
  cikisMiktar?: string | number  
  kalanMiktar?: string | number
}

// ÇELİK BORU
export interface CelikItem extends BaseItem {
  no?: number
  boruCap?: string
  etKalınlık?: string
  adet?: number
  uzunluk?: number | string  // Hem number hem string kabul et
  proje?: string
  aciklama?: string
  tip?: 'siyah' | 'paslanmaz' | 'aluminyum'
  kalite?: string
  
  // ORTAK ALANLAR
  girisTarihi?: string
  satinAlisTarihi?: Date | string
  satinAlisFiyati?: number
  dovizKur?: number
  paraBirimi?: 'TL' | 'USD' | 'EUR'
  tedarikci?: string
  
  // STOK BİLGİLERİ
  girisMiktar?: string | number
  cikisMiktar?: string | number
  kalanMiktar?: string | number
  birim?: 'ADET' | 'KG' | 'METRE' | 'M2'
  
  // LOKASYON
  rafNo?: string
  imDosyaNo?: string
  izlNo?: string
  
  // SİSTEM
  malzemeTuru?: 'çelik'
  durum?: 'Stok' | 'Kullanıldı' | 'Proje İçin Ayrılan'
}

// HALAT
export interface HalatItem extends BaseItem {
  halatCapi?: string
  adet?: number
  halatTipi?: string
  uzunluk?: string | number
  izoleDurumu?: 'Var' | 'Yok'
  ucTipi1?: string
  ucTipi2?: string
  kullanildigiProje?: string
  aciklama?: string
  durum?: 'Stok' | 'Kullanıldı' | 'Proje İçin Ayrılan'
  kalite?: string
  malzemeTuru?: 'halat'
  girisTarihi?: string
  satinAlisFiyati?: number
  tedarikci?: string
  rafNo?: string
  
  // Rezervasyon için stok miktarı alanları
  girisMiktar?: string | number
  cikisMiktar?: string | number  
  kalanMiktar?: string | number
}

// FİTİL
export interface FitilItem extends BaseItem {
  cap?: string
  renk?: 'Beyaz' | 'Opak' | 'Siyah' | 'Diğer'
  yaprakTipi?: 'Tek' | 'Çift'
  yaprakUzunlugu?: string | number
  adet?: number
  topUzunlugu?: string | number
  toplamUzunluk?: string | number
  proje?: string
  durum?: 'Stok' | 'Kullanımda' | 'Tamamlandı'
  kalite?: string
  malzemeTuru?: 'fitil'
  girisTarihi?: string
  satinAlisFiyati?: number
  tedarikci?: string
  rafNo?: string
  
  // Rezervasyon için stok miktarı alanları
  girisMiktar?: string | number
  cikisMiktar?: string | number  
  kalanMiktar?: string | number
}

// DEPO TAKİP LİSTESİ (GENEL STOK)
export interface DepoItem extends BaseItem {
  malzemeKalitesi?: string
  malzemeCinsi?: 'PLAKA' | 'PROFİL' | 'BORU'
  en?: string | number
  boy?: string | number
  kalinlik?: string | number
  uzunluk?: string | number
  projeYon?: string
  imDosyaNo?: string
  izlNo?: string
  rafNo?: string
  girisTarihi?: string
  girisMiktar?: string | number
  cikisMiktar?: string | number
  kalanMiktar?: string | number
  durum?: 'STOK' | 'KULLANILDI' | 'PROJE'
  malzemeTuru?: 'paslanmaz' | 'aluminyum' | 'çelik' | 'diğer'
}

// MAPA
export interface MapaItem extends BaseItem {
  mapaOlcusu?: string
  adet?: number
  kullanildigiProje?: string
  aciklama?: string
  durum?: 'Stok' | 'Kullanıldı' | 'Proje İçin Ayrılan'
  malzemeTuru?: 'galvaniz'
  tip?: 'MAPA'
  girisTarihi?: string
  satinAlisFiyati?: number
  tedarikci?: string
}