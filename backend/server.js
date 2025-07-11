// backend/server.js - Socket.io CORS düzeltilmiş versiyon
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// Model çakışmalarını önlemek için mongoose cache'i temizle
mongoose.models = {};
mongoose.modelSchemas = {};

const app = express();

// ✅ Frontend URL'i doğru tanımla
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ HTTP Server oluştur
const server = http.createServer(app);

// ✅ Socket.io Server oluştur - CORS ayarları düzeltildi
const io = socketIO(server, {
  cors: {
    origin: FRONTEND_URL, // ✅ 8080 yerine 5173 kullan
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// ✅ Socket.io connection handler
io.on('connection', (socket) => {
  console.log('🟢 Yeni Socket bağlantısı:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('🔴 Socket bağlantısı koptu:', socket.id, reason);
  });

  // Test eventi
  socket.emit('welcome', { message: 'Socket.io bağlantısı başarılı!' });
  
  // Test için ping-pong
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
});

// ✅ Socket.io instance'ını app'e ekle
app.set('io', io);

// Routes import etmeden önce modelleri temizle
const clearModels = () => {
  for (let modelName in mongoose.models) {
    delete mongoose.models[modelName];
  }
  for (let schemaName in mongoose.modelSchemas) {
    delete mongoose.modelSchemas[schemaName];
  }
};

// Routes - güvenli import
const importRoutesSafely = () => {
  try {
    clearModels();
    const halatRoutes = require('./routes/halat');
    app.use('/api/halat', halatRoutes);
    console.log('✅ Halat routes loaded');
  } catch (err) {
    console.log('⚠️ Halat routes not found');
  }

  try {
    const sarfRoutes = require('./routes/sarf');
    app.use('/api/sarf', sarfRoutes);
    console.log('✅ Sarf routes loaded');
  } catch (err) {
    console.log('⚠️ Sarf routes not found');
  }

  try {
    const celikRoutes = require('./routes/celik');
    app.use('/api/celik', celikRoutes);
    console.log('✅ Celik routes loaded');
  } catch (err) {
    console.log('⚠️ Celik routes not found');
  }

  try {
    const membranRoutes = require('./routes/membran');
    app.use('/api/membran', membranRoutes);
    console.log('✅ Membran routes loaded');
  } catch (err) {
    console.log('⚠️ Membran routes not found');
  }

  try {
    const fitilRoutes = require('./routes/fitil');
    app.use('/api/fitil', fitilRoutes);
    console.log('✅ Fitil routes loaded');
  } catch (err) {
    console.log('⚠️ Fitil routes not found');
  }

  try {
    const projectRoutes = require('./routes/project');
    app.use('/api/projects', projectRoutes);
    console.log('✅ Project routes loaded');
  } catch (err) {
    console.log('⚠️ Project routes not found');
  }
};

// Routes'ları yükle
importRoutesSafely();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server çalışıyor', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    socketio: 'active',
    frontend_url: FRONTEND_URL // ✅ Debug için frontend URL'i göster
  });
});

app.get('/api/', (req, res) => {
  res.json({ 
    message: 'Stok Takip API v1.0 🚀', 
    endpoints: ['/api/halat', '/api/sarf', '/api/celik', '/api/membran', '/api/fitil', '/api/projects'],
    timestamp: new Date().toISOString(),
    cors_origin: FRONTEND_URL
  });
});

// ✅ Socket.io test endpoint
app.get('/api/socket-test', (req, res) => {
  const connectedClients = io.engine.clientsCount;
  res.json({
    message: 'Socket.io test endpoint',
    connected_clients: connectedClients,
    socket_url: `http://localhost:${PORT}/socket.io/`,
    cors_origin: FRONTEND_URL
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Sunucu hatası'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stok-takip';

// MongoDB bağlantısı
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB bağlantısı başarılı");
    
    // ✅ Server'ı dinlemeye başla (app.listen değil server.listen!)
    server.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portunda çalışıyor...`);
      console.log(`📡 API: http://localhost:${PORT}/api/`);
      console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Socket.io: http://localhost:${PORT}/socket.io/`);
      console.log(`✅ CORS Origin: ${FRONTEND_URL}`); // ✅ CORS ayarını logla
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB bağlantı hatası:", err);
    process.exit(1);
  });

module.exports = { app, server, io };