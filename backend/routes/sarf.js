const express = require('express');
const mongoose = require('mongoose');
const sarfRouter = express.Router();
const Sarf = require('../models/Sarf');
const Log = require('../models/Log');
const socketManager = require('../socket');

// ObjectId validation middleware
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ 
      success: false,
      message: 'Geçersiz ObjectId formatı' 
    });
  }
  next();
};

// GET /api/sarf - Tüm sarf malzemeleri listele
sarfRouter.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter query
    const filter = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { malzeme: searchRegex },
        { kalite: searchRegex },
        { cins: searchRegex },
        { malzemeCinsi: searchRegex }
      ];
    }
    
    if (status) {
      filter.durumu = status;
    }

    if (type) {
      filter.malzemeCinsi = type;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute queries
    const [items, totalCount] = await Promise.all([
      Sarf.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Sarf.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search: search || '',
        status: status || '',
        type: type || ''
      }
    });
  } catch (err) {
    console.error('Sarf listesi hatası:', err);
    res.status(500).json({ 
      success: false,
      message: 'Sarf listesi getirilemedi',
      error: err.message 
    });
  }
});

// GET /api/sarf/stats - Sarf istatistikleri
sarfRouter.get('/stats', async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      lowStockCount,
      totalValue,
      recentCount,
      byType
    ] = await Promise.all([
      Sarf.countDocuments(),
      Sarf.countDocuments({ durumu: 'Aktif' }),
      Sarf.countDocuments({ 
        $expr: { 
          $lt: [
            { $toDouble: { $ifNull: ['$kalanMiktar', '0'] } },
            { $multiply: [{ $toDouble: { $ifNull: ['$girisMiktar', '1'] } }, 0.2] }
          ]
        }
      }),
      Sarf.aggregate([
        { $match: { satinAlisFiyati: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$satinAlisFiyati' } } }
      ]),
      Sarf.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Sarf.aggregate([
        { $group: { _id: '$malzemeCinsi', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalItems: totalCount,
        totalValue: totalValue[0]?.total || 0,
        lowStock: lowStockCount,
        recentlyAdded: recentCount,
        activeItems: activeCount,
        byType
      }
    });
  } catch (err) {
    console.error('Sarf istatistikleri hatası:', err);
    res.status(500).json({ 
      success: false,
      message: 'İstatistikler hesaplanamadı',
      error: err.message 
    });
  }
});

// GET /api/sarf/:id - Belirli bir sarf getir
sarfRouter.get('/:id', validateObjectId, async (req, res) => {
  try {
    const item = await Sarf.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Sarf malzemesi bulunamadı' 
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    console.error('Sarf getirme hatası:', err);
    res.status(500).json({ 
      success: false,
      message: 'Sarf malzemesi getirilemedi',
      error: err.message 
    });
  }
});

// POST /api/sarf - Yeni sarf ekle
sarfRouter.post('/', async (req, res) => {
  try {
    const newItem = new Sarf(req.body);
    const savedItem = await newItem.save();

    // Log kaydet
    await Log.create({ 
      bolum: 'Sarf', 
      islem: 'ekle', 
      dokumanId: savedItem._id, 
      detay: savedItem 
    });

    // Socket emit
    socketManager.getIO().emit('log', { 
      bolum: 'Sarf', 
      islem: 'ekle', 
      detay: savedItem 
    });

    res.status(201).json({
      success: true,
      message: 'Sarf malzemesi başarıyla eklendi',
      data: savedItem
    });
  } catch (err) {
    console.error('Sarf ekleme hatası:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Sarf malzemesi eklenemedi',
      error: err.message 
    });
  }
});

// PUT /api/sarf/:id - Sarf güncelle
sarfRouter.put('/:id', validateObjectId, async (req, res) => {
  try {
    const updates = req.body;
    delete updates._id; // _id güncellenmesini engelle

    const updatedItem = await Sarf.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Sarf malzemesi bulunamadı' 
      });
    }

    // Log kaydet
    await Log.create({ 
      bolum: 'Sarf', 
      islem: 'güncelle', 
      dokumanId: req.params.id, 
      detay: updatedItem 
    });

    // Socket emit
    socketManager.getIO().emit('log', { 
      bolum: 'Sarf', 
      islem: 'güncelle', 
      detay: updatedItem 
    });

    res.json({
      success: true,
      message: 'Sarf malzemesi başarıyla güncellendi',
      data: updatedItem
    });
  } catch (err) {
    console.error('Sarf güncelleme hatası:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Sarf malzemesi güncellenemedi',
      error: err.message 
    });
  }
});

// DELETE /api/sarf/:id - Sarf sil
sarfRouter.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const deletedItem = await Sarf.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Sarf malzemesi bulunamadı' 
      });
    }

    // Log kaydet
    await Log.create({ 
      bolum: 'Sarf', 
      islem: 'sil', 
      dokumanId: req.params.id 
    });

    // Socket emit
    socketManager.getIO().emit('log', { 
      bolum: 'Sarf', 
      islem: 'sil', 
      detay: { id: req.params.id } 
    });

    res.json({
      success: true,
      message: 'Sarf malzemesi başarıyla silindi',
      data: deletedItem
    });
  } catch (err) {
    console.error('Sarf silme hatası:', err);
    res.status(500).json({ 
      success: false,
      message: 'Sarf malzemesi silinemedi',
      error: err.message 
    });
  }
});

module.exports = sarfRouter;