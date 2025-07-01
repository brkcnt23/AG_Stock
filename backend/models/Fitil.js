const mongoose = require('mongoose')

const fitilSchema = new mongoose.Schema({
  malzemeTuru: { type: String, default: 'fitil', required: true },
  malzeme: { type: String, required: true },
  cins: { type: String, required: true },
  kalite: String,
  marka: String,
  
  // Teknik Özellikler
  cap: Number,
  uzunluk: Number,
  kalinlik: Number,
  dayanim: Number,
  elastikiyet: mongoose.Schema.Types.Mixed, // string veya number olabilir
  renk: String,
  renkKodu: String,
  antistatik: Boolean,
  uvDayanikli: Boolean,
  kullanimAlani: String,
  
  // Stok Bilgileri
  adet: { type: Number, required: true },
  kalanMiktar: { type: Number, required: true },
  girisMiktar: Number,
  cikisMiktar: Number,
  birim: { type: String, default: 'METRE' },
  stokKodu: String,
  
  // Fiyat Bilgileri
  satinAlisFiyati: Number,
  dovizKur: Number,
  paraBirimi: { type: String, enum: ['TL', 'USD', 'EUR'] },
  tedarikci: String,
  
  // Lokasyon
  depoYeri: String,
  rafNo: String,
  bolum: String,
  
  // Proje Bilgileri
  proje: { type: String, default: 'Stok' },
  durumu: { type: String, enum: ['Aktif', 'Pasif'], default: 'Aktif' },
  
  // Üretim/Parti Bilgileri
  lotNo: String,
  uretimTarihi: Date,
  
  // Ek Bilgiler
  aciklama: String,
  notlar: String,
  
  // Belge/Resim
  resimUrl: String,
  sertifika: String
}, {
  timestamps: true
})

// Indexes for better query performance
fitilSchema.index({ malzeme: 1 })
fitilSchema.index({ cins: 1 })
fitilSchema.index({ proje: 1 })
fitilSchema.index({ durumu: 1 })
fitilSchema.index({ kalanMiktar: 1 })
fitilSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Fitil', fitilSchema)