const mongoose = require('mongoose');

const FitilSchema = new mongoose.Schema({
  renk: String,
  yaprak: String,
  yaprakUzunlugu: Number,
  adet: Number,
  topUzunlugu: Number,
  toplamUzunluk: Number,

  // Ortak stok alanları
  girisTarihi: { type: String },             // giriş tarihi
  satinAlisTarihi: { type: Date },           // satın alma tarihi
  satinAlisFiyati: { type: Number },         // satın alma fiyatı
  dovizKur: { type: Number, default: 1 },    // döviz kuru
  paraBirimi: {                             
    type: String, enum: ['TL','USD','EUR'], default: 'TL'
  },                                         
  tedarikci: String,                        // tedarikçi firması

  girisMiktar: String,                      // giriş miktarı
  cikisMiktar: String,                      // çıkış miktarı
  kalanMiktar: String,                      // kalan miktar
  birim: {
    type: String, enum: ['ADET','KG','METRE','M2'], default: 'ADET'
  },                                         

  rafNo: String,
  imDosyaNo: String,
  izlNo: String,

  malzemeTuru: { type: String, default: 'fitil' },
  durum: {                                   
    type: String,
    enum: ['Stok','Kullanıldı','Proje İçin Ayrılan'],
    default: 'Stok'
  }
}, { timestamps: true });

module.exports = mongoose.model('Fitil', FitilSchema, 'fitil');