const mongoose = require('mongoose');

const celikSchema = new mongoose.Schema({
  no: Number,
  boruCap: String,
  etKalinlik: String,
  tip: { type: String, enum: ['siyah', 'paslanmaz', 'aluminyum'] },
  malzemeCinsi: String,
  kalite: String,
  adet: { type: Number, default: 0 },
  birim: { type: String, default: 'ADET' },
  uzunluk: Number,
  girisTarihi: { type: Date, default: Date.now },
  satinAlisFiyati: Number,
  paraBirimi: { type: String, enum: ['TL', 'USD', 'EUR'], default: 'TL' },
  tedarikci: String,
  lokasyon: String,
  aciklama: String,
  durumu: { type: String, enum: ['Aktif', 'Pasif'], default: 'Aktif' },
  kategori: String,
  barkod: String,
  seriNo: String,
  minStokMiktari: Number,
  depoKonumu: String,
  rafNo: String
}, {
  timestamps: true
});

// Model'i export etmeden önce zaten var mı kontrol et
module.exports = mongoose.models.Celik || mongoose.model('Celik', celikSchema, 'celik');