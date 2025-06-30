const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const LogSchema = new mongoose.Schema({
  _id: { type: ObjectId, auto: true },
  bolum: String,         // Fitil / Membran / Halat / Çelik / Sarf
  islem: String,         // ekle / sil / güncelle
  dokumanId: { type: ObjectId },     // ilgili kaydın ObjectId'si
  detay: Object          // isteğe bağlı, kaydın özeti
}, { 
  timestamps: true,
  toJSON: { 
    virtuals: true, 
    transform: function(doc, ret) {
      ret.id = ret._id;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Log', LogSchema, 'logs');