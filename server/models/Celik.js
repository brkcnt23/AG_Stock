// models/Celik.js - DÜZELTİLMİŞ

const mongoose = require('mongoose');

const CelikSchema = new mongoose.Schema({
  // Çelik özel alanları
  no: Number,
  boruCap: String,              // Ø90, Ø100 vs
  etKalınlık: String,           // 4mm vs  
  adet: Number,
  uzunluk: Number,              // mm cinsinden
  proje: String,                // proje adı
  aciklama: String,
  tip: { 
    type: String, 
    enum: ['siyah', 'paslanmaz', 'aluminyum'],
    default: 'siyah'
  },
  kalite: String,               // S235, S355 vs
  
  // ORTAK STOK ALANLARI - TÜM STOK TİPLERİNDE OLACAK
  girisTarihi: { type: String },              // giriş tarihi
  satinAlisTarihi: { type: Date },            // satın alma tarihi
  satinAlisFiyati: { type: Number },          // satın alma fiyatı
  dovizKur: { type: Number, default: 1 },     // döviz kuru
  paraBirimi: { 
    type: String, 
    enum: ['TL', 'USD', 'EUR'], 
    default: 'TL' 
  },
  tedarikci: String,                          // tedarikçi firma
  
  // STOK BİLGİLERİ
  girisMiktar: String,                        // giriş miktarı
  cikisMiktar: String,                        // çıkış miktarı
  kalanMiktar: String,                        // kalan miktar
  birim: { 
    type: String, 
    enum: ['ADET', 'KG', 'METRE', 'M2'], 
    default: 'ADET' 
  },
  
  // LOKASYON
  rafNo: String,                              // raf numarası
  imDosyaNo: String,                         // imalat dosya no
  izlNo: String,                             // izleme no
  
  // SİSTEM
  malzemeTuru: { type: String, default: 'çelik' },
  durum: { 
    type: String, 
    enum: ['Stok', 'Kullanıldı', 'Proje İçin Ayrılan'], 
    default: 'Stok' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Celik', CelikSchema , 'celik');