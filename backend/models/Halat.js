const mongoose = require('mongoose');

const halatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  kalite: String,
  cins: { 
    type: String, 
    enum: ['celik', 'sentetik', 'karma'],
    required: true 
  },
  cap: { type: Number, required: true }, // mm
  uzunluk: Number, // meter
  stok: { type: Number, required: true, default: 0 },
  birim: { type: String, required: true, default: 'metre' },
  birimFiyat: Number,
  parabirimi: { type: String, enum: ['TL', 'USD', 'EUR'], default: 'TL' },
  tedarikci: String,
  minStokSeviyesi: { type: Number, default: 5 },
  maxStokSeviyesi: Number,
  depo: String,
  raf: String,
  aciklama: String,
  ozellikler: {
    yuk_kapasitesi: Number,
    kopma_yukleri: Number,
    elastikiyet: String,
    isi_direnci: String,
    kimyasal_direnç: String
  }
}, {
  timestamps: true
});

// Index oluştur
halatSchema.index({ name: 1, cap: 1, cins: 1 });

module.exports = mongoose.models.Halat || mongoose.model('Halat', halatSchema, 'halat');