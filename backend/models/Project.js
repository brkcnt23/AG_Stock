const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  projectCode: String,
  customer: String,
  description: String,
  startDate: Date,
  endDate: Date,
  budget: { type: Number, default: 0 },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  currency: { type: String, enum: ['TL', 'USD', 'EUR'], default: 'TL' },
  projectManager: String,
  notes: String,
  status: {
    type: String,
    enum: ['planning', 'reserved', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  materials: [{
    materialId: { type: mongoose.Schema.Types.ObjectId, required: true },
    materialType: { 
      type: String, 
      enum: ['sarf', 'celik', 'membran', 'halat', 'fitil', 'custom'],
      required: true 
    },
    name: String,
    requestedQuantity: { type: Number, required: true },
    reservedQuantity: { type: Number, default: 0 },
    usedQuantity: { type: Number, default: 0 },
    unit: String,
    unitPrice: Number,
    totalPrice: Number,
    status: {
      type: String,
      enum: ['planned', 'reserved', 'ordered', 'received', 'used', 'completed'],
      default: 'planned'
    },
    notes: String
  }],
  totalMaterialCost: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 },
  stockSufficiency: { type: Number, default: 0 }, // percentage
  reservedItems: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Calculate totals before saving
projectSchema.pre('save', function(next) {
  this.totalItems = this.materials.length;
  this.totalMaterialCost = this.materials.reduce((sum, material) => 
    sum + (material.totalPrice || 0), 0
  );
  this.reservedItems = this.materials.filter(m => m.status === 'reserved').length;
  
  next();
});

module.exports = mongoose.models.Project || mongoose.model('Project', projectSchema, 'projects');