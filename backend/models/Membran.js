const mongoose = require('mongoose');

const membranSchema = new mongoose.Schema({
  paletNo: Number,
  marka: String,
  model: String,
  tip: String,
  olcu: String,
  kalite: String,
  adet: { type: Number, default: 0 },
  birim: { type: String, default: 'ADET' },
  girisTarihi: { type: Date, default: Date.now },
  satinAlisFiyati: Number,
  paraBirimi: { type: String, enum: ['TL', 'USD', 'EUR'], default: 'TL' },
  tedarikci: String,
  lokasyon: String,
  aciklama: String,
  durumu: { 
    type: String, 
    enum: ['Aktif', 'Kullanımda', 'Tamamlandı', 'İptal'], 
    default: 'Aktif' 
  },
  proje: String,
  sahibi: String,
  note: String,
  kategori: String,
  barkod: String,
  seriNo: String,
  minStokMiktari: Number,
  depoKonumu: String,
  rafNo: String
}, {
  timestamps: true
});

module.exports = mongoose.models.Membran || mongoose.model('Membran', membranSchema, 'membran');