const mongoose = require('mongoose')

const fitilSchema = new mongoose.Schema({
  malzemeTuru: { 
    type: String, 
    default: 'fitil',
    required: true 
  },
  malzeme: String,
  cins: String,
  kalite: String,
  marka: String,
  renk: String,
  renkKodu: String,
  dayanim: Number,
  kalinlik: Number,
  elastikiyet: mongoose.Schema.Types.Mixed, // String veya Number olabilir
  lotNo: String,
  uretimTarihi: Date,
  antistatik: Boolean,
  uvDayanikli: Boolean,
  kullanimAlani: String,
  aciklama: String,
  birim: { 
    type: String, 
    default: 'ADET' 
  },
  adet: {
    type: Number,
    default: 0
  },
  stok: {
    type: Number,
    default: 0
  },
  kalanMiktar: {
    type: String,
    default: '0'
  },
  rezerveEdilen: {
    type: String,
    default: '0'
  },
  girisMiktar: String,
  cikisMiktar: String,
  kullanilanMiktar: String,
  satinAlisFiyati: Number,
  dovizKur: Number,
  paraBirimi: {
    type: String,
    default: 'TL'
  },
  tedarikci: String,
  rafNo: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Aramalar için index
fitilSchema.index({ 
  malzeme: 'text', 
  cins: 'text', 
  kalite: 'text', 
  aciklama: 'text' 
})

module.exports = mongoose.model('Fitil', fitilSchema, 'fitil')