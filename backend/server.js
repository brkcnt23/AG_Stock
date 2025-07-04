// backend/server.js - Socket.io düzeltilmiş versiyon + CORS fix
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

// ✅ IMPROVED CORS Configuration - Docker portlarını da dahil et
app.use(cors({
  origin: [
    'http://localhost:5173',     // Vite dev server
    'http://localhost:8080',     // Docker frontend
    'http://localhost:80',       // Docker frontend alternative
    'http://localhost:3000',     // Alternative port
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cache-Control'
  ]
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ HTTP Server oluştur
const server = http.createServer(app);

// ✅ Socket.io Server oluştur - CORS güncellemesi
const io = socketIO(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:80',
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ Socket.io connection handler
io.on('connection', (socket) => {
  console.log('🟢 Yeni Socket bağlantısı:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('🔴 Socket bağlantısı koptu:', socket.id, reason);
  });

  // Test eventi
  socket.emit('welcome', { message: 'Socket.io bağlantısı başarılı!' });
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
    socketio: 'active' // ✅ Socket.io durumu
  });
});

app.get('/api/', (req, res) => {
  res.json({ 
    message: 'Stok Takip API v1.0 🚀', 
    endpoints: ['/api/halat', '/api/sarf', '/api/celik', '/api/membran', '/api/fitil', '/api/projects'],
    timestamp: new Date().toISOString()
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
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/stoktakip';

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
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB bağlantı hatası:", err);
    process.exit(1);
  });

module.exports = { app, server, io };