const socketManager = require('../socket');

function safeSocketEmit(event, data) {
  try {
    if (socketManager && typeof socketManager.getIO === 'function') {
      const io = socketManager.getIO();
      if (io && typeof io.emit === 'function') {
        io.emit(event, data);
        return true;
      }
    }
  } catch (error) {
    // Socket hatalarını sessizce logla, ana işlemi etkileme
    console.log('⚠️ Socket.io hatası (göz ardı edildi):', error.message);
  }
  return false;
}

module.exports = {
  safeSocketEmit
};

// Sonra backend/routes/project.js'te kullanın:
const { safeSocketEmit } = require('../utils/safeSocket');

// Socket kullanımını şöyle değiştirin:
safeSocketEmit('log', {
  bolum: 'Project',
  islem: 'ekle',
  detay: savedProject
});