// backend/routes/log.js - Fixed
const express = require('express');
const mongoose = require('mongoose');
const logRouter = express.Router();
const Log = require('../models/Log');

// GET /api/logs -> Tüm logları getir
logRouter.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;
    
    const loglar = await Log.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalCount = await Log.countDocuments();
    
    res.json({
      success: true,
      data: loglar,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error('Log getirme hatası:', err);
    res.status(500).json({ 
      success: false,
      error: 'Log verisi getirilemedi',
      details: err.message 
    });
  }
});

// GET /api/logs/stats -> Log istatistikleri
logRouter.get('/stats', async (req, res) => {
  try {
    const [
      totalLogs,
      todayLogs,
      logsByType,
      recentActivity
    ] = await Promise.all([
      Log.countDocuments(),
      Log.countDocuments({
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        }
      }),
      Log.aggregate([
        { $group: { _id: '$bolum', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Log.aggregate([
        { $group: { _id: '$islem', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalLogs,
        todayLogs,
        logsByType,
        recentActivity
      }
    });
  } catch (err) {
    console.error('Log istatistik hatası:', err);
    res.status(500).json({ 
      success: false,
      error: 'Log istatistikleri hesaplanamadı' 
    });
  }
});

// GET /api/logs/:id -> Tek log getir
logRouter.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        error: 'Geçersiz log ID formatı' 
      });
    }

    const log = await Log.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ 
        success: false,
        error: 'Log bulunamadı' 
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (err) {
    console.error('Log detay hatası:', err);
    res.status(500).json({ 
      success: false,
      error: 'Log detayı getirilemedi' 
    });
  }
});

module.exports = logRouter;