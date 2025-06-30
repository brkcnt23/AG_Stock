const mongoose = require('mongoose');

const sarfSchema = new mongoose.Schema({
  malzeme: { type: String, required: true },
  kalite: String,
  cins: String,
  malzemeCinsi: {
    type: String,
    enum: ['KAYNAK', 'Vida', 'Keski', 'Bakım', 'Temizlik', 'Yağlayıcı', 'Elektrik', 'Emniyet', 'Diğer']
  },
  en: String,
  boy: String,
  kalinlik: String,
  renk: String,
  birim: { type: String, default: 'ADET' },
  girisMiktar: String,
  cikisMiktar: { type: String, default: '0' },
  kalanMiktar: String,
  girisTarihi: { type: Date, default: Date.now },
  sonKullanma: Date,
  satinAlisFiyati: Number,
  paraBirimi: { type: String, enum: ['TL', 'USD', 'EUR'], default: 'TL' },
  tedarikci: String,
  lokasyon: String,
  aciklama: String,
  durumu: { type: String, enum: ['Aktif', 'Pasif', 'Tukendi'], default: 'Aktif' },
  kategori: String,
  barkod: String,
  seriNo: String,
  garanti: String,
  minStokMiktari: String,
  kritikSeviye: Number,
  minSiparis: Number,
  kullanimAlani: String,
  kullanimTalimati: String,
  sarfTuru: String,
  depoKonumu: String,
  rafNo: String
}, {
  timestamps: true
});

// Model'i export etmeden önce zaten var mı kontrol et
module.exports = mongoose.models.Sarf || mongoose.model('Sarf', sarfSchema, 'sarf');