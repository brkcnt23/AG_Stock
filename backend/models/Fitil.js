const mongoose = require('mongoose');

const fitilSchema = new mongoose.Schema({
  malzeme: String,
  kalite: String,
  cins: String,
  cap: Number,
  uzunluk: Number,
  birim: { type: String, default: 'ADET' },
  adet: { type: Number, default: 0 },
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

module.exports = mongoose.models.Fitil || mongoose.model('Fitil', fitilSchema, 'fitil');