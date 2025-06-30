let io = null;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: { origin: "*" }
    });

    io.on('connection', (socket) => {
      console.log('Yeni bir client bağlandı');
      socket.on('disconnect', () => {
        console.log('Client ayrıldı');
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io henüz başlatılmadı");
    }
    return io;
  }
};
