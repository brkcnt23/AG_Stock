const mongoose = require('mongoose');
const SarfSchema = new mongoose.Schema({
  malzeme: String,
  kalite: String,
  malzemeCinsi: { type: String, enum: ['KAYNAK','Vida','Keski','Bakım','Temizlik','Yağlayıcı','Elektrik','Emniyet','Diğer'], required: true },
  en: String,
  boy: String,
  kalinlik: String,
  uzunluk: String,
  proje: String,
  yon: String,
  imDosyaNo: String,
  izlNo: String,
  rafNo: String,

  // Ortak stok alanları
  girisTarihi: String,
  girisMiktar: String,
  cikisMiktar: String,
  kalanMiktar: String,
  birim: { type: String, enum: ['ADET','KG','METRE','M2'], default: 'ADET' },

  malzemeTuru: { type: String, enum: ['sarf','paslanmaz','aluminyum','çelik','diğer'], default: 'sarf' },
  satinAlisTarihi: Date,
  satinAlisFiyati: Number,
  dovizKur: { type: Number, default: 1 },
  paraBirimi: { type: String, enum: ['TL','USD','EUR'], default: 'TL' },
  tedarikci: String
}, { timestamps: true });

module.exports = mongoose.model('Sarf', SarfSchema , 'sarf');