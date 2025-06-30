const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  bolum: String,         // Fitil / Membran / Halat / Çelik / Sarf
  islem: String,         // ekle / sil
  dokumanId: String,     // ilgili kaydın ID'si
  detay: Object          // isteğe bağlı, kaydın özeti (ör. renk, no, proje)
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema, 'logs');
