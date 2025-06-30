require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const sarfRoutes = require('./routes/sarf');
const fitilRoutes = require('./routes/fitil');
const halatRoutes = require('./routes/halat');
const celikRoutes = require('./routes/celik');
const logRoutes = require('./routes/log');
const membranRoutes = require('./routes/membran');
const projectRoutes = require('./routes/project');

// API Routes
app.use('/api/sarf', sarfRoutes);
app.use('/api/fitil', fitilRoutes);
app.use('/api/halat', halatRoutes);
app.use('/api/celik', celikRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/membran', membranRoutes);
app.use('/api/projects', projectRoutes);
// Health Check Routes - FRONTEND İÇİN EKLENDİ
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server çalışıyor', 
    timestamp: new Date(),
    port: process.env.PORT || 5000
  });
});

app.get('/api/', (req, res) => {
  res.json({ 
    message: 'API çalışıyor 🚀', 
    endpoints: [
      '/api/sarf',
      '/api/fitil', 
      '/api/halat', 
      '/api/celik', 
      '/api/membran',
      '/api/projects',
      '/api/logs'
    ],
    timestamp: new Date()
  });
});

// Ana route (opsiyonel)
app.get('/', (req, res) => {
  res.send('Stok Takip API Server 🚀 - /api/ adresini ziyaret edin');
});

// Socket
const http = require('http').createServer(app);
const socketManager = require('./socket');
socketManager.init(http);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB bağlantısı başarılı");

    // Sunucuyu başlat
    http.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portunda çalışıyor...`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api/`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB bağlantı hatası:", err);
  });