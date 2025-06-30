const mongoose = require('mongoose');
const MembranSchema = new mongoose.Schema({
  paletNo: String,
  marka: String,
  model: String,
  renk: String,
  renkKodu: String,
  partiNo: String,
  seriNo: String,
  tip: String,
  topSayisi: Number,
  en: Number,
  topUzunlugu: Number,
  toplamUzunluk: Number,
  alan: Number,
  proje: String,
  durum: String,
  note: String,
  sahibi: String,
  cins: { type: String, enum: ['PTFE','ETFE'], required: true },
  mesh: { type: Boolean, default: false },

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

  malzemeTuru: { type: String, default: 'membran' }
}, { timestamps: true });

module.exports = mongoose.model('Membran', MembranSchema ,'membran');
