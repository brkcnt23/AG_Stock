const mongoose = require('mongoose');

const HalatSchema = new mongoose.Schema({
  no: Number,
  cap: String,
  adet: Number,
  tip: String,
  uzunluk: Number,
  izoleDurum: String,
  ucu1: String,
  ucu2: String,
  proje: String,
  aciklama: String,

  // Ortak stok alanları
  girisTarihi: { type: String },
  satinAlisTarihi: { type: Date },
  satinAlisFiyati: { type: Number },
  dovizKur: { type: Number, default: 1 },
  paraBirimi: { type: String, enum: ['TL','USD','EUR'], default: 'TL' },
  tedarikci: String,

  girisMiktar: String,
  cikisMiktar: String,
  kalanMiktar: String,
  birim: { type: String, enum: ['ADET','KG','METRE','M2'], default: 'ADET' },

  rafNo: String,
  imDosyaNo: String,
  izlNo: String,

  malzemeTuru: { type: String, default: 'halat' },
  durum: { type: String, enum: ['Stok','Kullanıldı','Proje İçin Ayrılan'], default: 'Stok' }
}, { timestamps: true });

module.exports = mongoose.model('Halat', HalatSchema , 'halat');