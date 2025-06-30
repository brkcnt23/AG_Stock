// backend/controllers/membranController.js
const Membran = require('../models/Membran');
const Log = require('../models/Log');
const { 
  successResponse, 
  errorResponse, 
  getPaginationInfo,
  buildSearchQuery,
  buildPriceRangeQuery,
  sanitizeItems,
  calculateTotalValue
} = require('../utils/helpers');
const { cleanDocument, cleanDocuments } = require('../utils/objectId');

/**
 * @desc    Tüm membran malzemeleri listele
 * @route   GET /api/membran
 * @access  Public
 */
const getMembranItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status,
      malzemeTuru,
      malzemeCinsi,
      proje,
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      minPrice,
      maxPrice 
    } = req.query;

    // Build filter query
    const filter = {};
    
    // Search filter
    if (search) {
      const searchQuery = buildSearchQuery(search, [
        'malzemeTuru', 'malzemeCinsi', 'kalite', 'aciklama', 'stokKodu'
      ]);
      Object.assign(filter, searchQuery);
    }
    
    // Status filter
    if (status) {
      filter.durumu = status;
    }
    
    // Material type filter
    if (malzemeTuru) {
      filter.malzemeTuru = new RegExp(malzemeTuru, 'i');
    }
    
    // Material kind filter
    if (malzemeCinsi) {
      filter.malzemeCinsi = new RegExp(malzemeCinsi, 'i');
    }
    
    // Project filter
    if (proje) {
      if (proje === '!Stok') {
        filter.proje = { $ne: 'Stok' };
      } else {
        filter.proje = proje;
      }
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      const priceQuery = buildPriceRangeQuery(minPrice, maxPrice);
      Object.assign(filter, priceQuery);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute queries
    const [items, totalCount] = await Promise.all([
      Membran.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Membran.countDocuments(filter)
    ]);

    // Clean and sanitize data
    const cleanedItems = sanitizeItems(cleanDocuments(items));
    
    // Calculate pagination info
    const pagination = getPaginationInfo(page, limit, totalCount);

    res.json(successResponse(
      cleanedItems,
      'Membran listesi başarıyla getirildi',
      pagination,
      { search: search || '', status: status || '', malzemeTuru: malzemeTuru || '' }
    ));
  } catch (error) {
    console.error('Membran listesi hatası:', error);
    res.status(500).json(errorResponse('Membran listesi getirilemedi'));
  }
};

/**
 * @desc    Tek membran malzeme getir
 * @route   GET /api/membran/:id
 * @access  Public
 */
const getMembranById = async (req, res) => {
  try {
    const membran = await Membran.findById(req.params.id).lean();
    
    if (!membran) {
      return res.status(404).json(errorResponse('Membran malzeme bulunamadı'));
    }

    res.json(successResponse(
      cleanDocument(membran),
      'Membran malzeme başarıyla getirildi'
    ));
  } catch (error) {
    console.error('Membran getirme hatası:', error);
    res.status(500).json(errorResponse('Membran malzeme getirilemedi'));
  }
};

/**
 * @desc    Yeni membran malzeme ekle
 * @route   POST /api/membran
 * @access  Private
 */
const createMembran = async (req, res) => {
  try {
    // Kalan miktar hesapla
    req.body.kalanMiktar = req.body.adet;
    
    const membran = new Membran(req.body);
    const savedMembran = await membran.save();

    // Log kaydı
    await Log.create({
      action: 'CREATE',
      collection: 'membran',
      documentId: savedMembran._id,
      newData: savedMembran,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.status(201).json(successResponse(
      cleanDocument(savedMembran),
      'Membran malzeme başarıyla eklendi'
    ));
  } catch (error) {
    console.error('Membran ekleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Membran malzeme eklenemedi'));
  }
};

/**
 * @desc    Membran malzeme güncelle
 * @route   PUT /api/membran/:id
 * @access  Private
 */
const updateMembran = async (req, res) => {
  try {
    const oldMembran = await Membran.findById(req.params.id);
    
    if (!oldMembran) {
      return res.status(404).json(errorResponse('Membran malzeme bulunamadı'));
    }

    // Güncelleme verilerini hazırla
    const updateData = { ...req.body };
    updateData.updatedAt = new Date();

    const updatedMembran = await Membran.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log kaydı
    await Log.create({
      action: 'UPDATE',
      collection: 'membran',
      documentId: updatedMembran._id,
      oldData: oldMembran,
      newData: updatedMembran,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      cleanDocument(updatedMembran),
      'Membran malzeme başarıyla güncellendi'
    ));
  } catch (error) {
    console.error('Membran güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Membran malzeme güncellenemedi'));
  }
};

/**
 * @desc    Membran malzeme sil
 * @route   DELETE /api/membran/:id
 * @access  Private
 */
const deleteMembran = async (req, res) => {
  try {
    const membran = await Membran.findById(req.params.id);
    
    if (!membran) {
      return res.status(404).json(errorResponse('Membran malzeme bulunamadı'));
    }

    await Membran.findByIdAndDelete(req.params.id);

    // Log kaydı
    await Log.create({
      action: 'DELETE',
      collection: 'membran',
      documentId: req.params.id,
      oldData: membran,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      null,
      'Membran malzeme başarıyla silindi'
    ));
  } catch (error) {
    console.error('Membran silme hatası:', error);
    res.status(500).json(errorResponse('Membran malzeme silinemedi'));
  }
};

/**
 * @desc    Membran istatistikleri
 * @route   GET /api/membran/stats
 * @access  Public
 */
const getMembranStats = async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      passiveCount,
      totalValue,
      lowStockCount,
      recentCount
    ] = await Promise.all([
      Membran.countDocuments(),
      Membran.countDocuments({ durumu: 'Aktif' }),
      Membran.countDocuments({ durumu: 'Pasif' }),
      Membran.aggregate([
        { $match: { satinAlisFiyati: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$adet', '$satinAlisFiyati'] } } } }
      ]),
      Membran.countDocuments({ kalanMiktar: { $lt: 10 } }),
      Membran.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    const stats = {
      totalCount,
      activeCount,
      passiveCount,
      totalValue: totalValue[0]?.total || 0,
      lowStockCount,
      outOfStockCount: await Membran.countDocuments({ kalanMiktar: { $lte: 0 } }),
      recentCount,
      lastUpdate: new Date().toISOString()
    };

    res.json(successResponse(stats, 'Membran istatistikleri başarıyla getirildi'));
  } catch (error) {
    console.error('Membran istatistikleri hatası:', error);
    res.status(500).json(errorResponse('İstatistikler getirilemedi'));
  }
};

/**
 * @desc    Toplu membran işlemleri
 * @route   POST /api/membran/bulk
 * @access  Private
 */
const bulkMembranOperations = async (req, res) => {
  try {
    const { operation, items, filters } = req.body;

    switch (operation) {
      case 'delete':
        if (items && items.length > 0) {
          await Membran.deleteMany({ _id: { $in: items } });
          res.json(successResponse(null, `${items.length} membran malzeme silindi`));
        } else {
          res.status(400).json(errorResponse('Silinecek öğeler belirtilmedi'));
        }
        break;

      case 'update':
        if (items && items.length > 0 && req.body.updateData) {
          await Membran.updateMany(
            { _id: { $in: items } },
            { ...req.body.updateData, updatedAt: new Date() }
          );
          res.json(successResponse(null, `${items.length} membran malzeme güncellendi`));
        } else {
          res.status(400).json(errorResponse('Güncellenecek öğeler veya veriler belirtilmedi'));
        }
        break;

      default:
        res.status(400).json(errorResponse('Geçersiz toplu işlem'));
    }
  } catch (error) {
    console.error('Toplu membran işlemi hatası:', error);
    res.status(500).json(errorResponse('Toplu işlem gerçekleştirilemedi'));
  }
};

module.exports = {
  getMembranItems,
  getMembranById,
  createMembran,
  updateMembran,
  deleteMembran,
  getMembranStats,
  bulkMembranOperations
};