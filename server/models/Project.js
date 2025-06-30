// models/Project.js (YENİ DOSYA)
const mongoose = require('mongoose');

const ProjectMaterialSchema = new mongoose.Schema({
  materialId: { type: String, required: true },
  materialType: { type: String, enum: ['sarf', 'membran', 'celik', 'halat', 'fitil'], required: true },
  requestedQuantity: { type: Number, required: true },
  allocatedQuantity: { type: Number, default: 0 },
  stockSufficient: { type: Boolean, default: false },
  notes: String
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['planning', 'reserved', 'active', 'completed', 'cancelled'], 
    default: 'planning' 
  },
  startDate: Date,
  endDate: Date,
  reserveUntil: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  
  // Malzeme listesi
  materials: [ProjectMaterialSchema],
  
  // Proje yöneticisi ve ekip
  projectManager: String,
  team: [String],
  
  // Bütçe ve maliyet
  budget: Number,
  estimatedCost: Number,
  actualCost: Number,
  
  // Notlar ve açıklamalar
  notes: String,
  tags: [String],
  
  // Rezervasyon ve kullanım bilgileri
  reservationHistory: [{
    date: { type: Date, default: Date.now },
    action: String, // 'reserved', 'released', 'consumed'
    materialId: String,
    quantity: Number,
    notes: String
  }]
}, { timestamps: true });

// İndeksler - performans için
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Project', ProjectSchema , 'projects');