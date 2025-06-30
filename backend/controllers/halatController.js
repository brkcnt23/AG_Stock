// backend/controllers/halatController.js
const Halat = require('../models/Halat');
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
 * @desc    Tüm halat malzemeleri listele
 * @route   GET /api/halat
 * @access  Public
 */
const getHalatItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status,
      malzemeTuru,
      cins,
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
        'malzemeTuru', 'cins', 'aciklama', 'stokKodu', 'kalite'
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
    
    // Type filter
    if (cins) {
      filter.cins = new RegExp(cins, 'i');
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
      Halat.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Halat.countDocuments(filter)
    ]);

    // Clean and sanitize data
    const cleanedItems = sanitizeItems(cleanDocuments(items));
    
    // Calculate pagination info
    const pagination = getPaginationInfo(page, limit, totalCount);

    res.json(successResponse(
      cleanedItems,
      'Halat listesi başarıyla getirildi',
      pagination,
      { search: search || '', status: status || '', malzemeTuru: malzemeTuru || '' }
    ));
  } catch (error) {
    console.error('Halat listesi hatası:', error);
    res.status(500).json(errorResponse('Halat listesi getirilemedi'));
  }
};

/**
 * @desc    Tek halat malzeme getir
 * @route   GET /api/halat/:id
 * @access  Public
 */
const getHalatById = async (req, res) => {
  try {
    const halat = await Halat.findById(req.params.id).lean();
    
    if (!halat) {
      return res.status(404).json(errorResponse('Halat malzeme bulunamadı'));
    }

    res.json(successResponse(
      cleanDocument(halat),
      'Halat malzeme başarıyla getirildi'
    ));
  } catch (error) {
    console.error('Halat getirme hatası:', error);
    res.status(500).json(errorResponse('Halat malzeme getirilemedi'));
  }
};

/**
 * @desc    Yeni halat malzeme ekle
 * @route   POST /api/halat
 * @access  Private
 */
const createHalat = async (req, res) => {
  try {
    // Kalan miktar hesapla
    req.body.kalanMiktar = req.body.adet;
    
    const halat = new Halat(req.body);
    const savedHalat = await halat.save();

    // Log kaydı
    await Log.create({
      action: 'CREATE',
      collection: 'halat',
      documentId: savedHalat._id,
      newData: savedHalat,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.status(201).json(successResponse(
      cleanDocument(savedHalat),
      'Halat malzeme başarıyla eklendi'
    ));
  } catch (error) {
    console.error('Halat ekleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Halat malzeme eklenemedi'));
  }
};

/**
 * @desc    Halat malzeme güncelle
 * @route   PUT /api/halat/:id
 * @access  Private
 */
const updateHalat = async (req, res) => {
  try {
    const oldHalat = await Halat.findById(req.params.id);
    
    if (!oldHalat) {
      return res.status(404).json(errorResponse('Halat malzeme bulunamadı'));
    }

    // Güncelleme verilerini hazırla
    const updateData = { ...req.body };
    updateData.updatedAt = new Date();

    const updatedHalat = await Halat.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log kaydı
    await Log.create({
      action: 'UPDATE',
      collection: 'halat',
      documentId: updatedHalat._id,
      oldData: oldHalat,
      newData: updatedHalat,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      cleanDocument(updatedHalat),
      'Halat malzeme başarıyla güncellendi'
    ));
  } catch (error) {
    console.error('Halat güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Halat malzeme güncellenemedi'));
  }
};

/**
 * @desc    Halat malzeme sil
 * @route   DELETE /api/halat/:id
 * @access  Private
 */
const deleteHalat = async (req, res) => {
  try {
    const halat = await Halat.findById(req.params.id);
    
    if (!halat) {
      return res.status(404).json(errorResponse('Halat malzeme bulunamadı'));
    }

    await Halat.findByIdAndDelete(req.params.id);

    // Log kaydı
    await Log.create({
      action: 'DELETE',
      collection: 'halat',
      documentId: req.params.id,
      oldData: halat,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      null,
      'Halat malzeme başarıyla silindi'
    ));
  } catch (error) {
    console.error('Halat silme hatası:', error);
    res.status(500).json(errorResponse('Halat malzeme silinemedi'));
  }
};

/**
 * @desc    Halat istatistikleri
 * @route   GET /api/halat/stats
 * @access  Public
 */
const getHalatStats = async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      passiveCount,
      totalValue,
      lowStockCount,
      recentCount
    ] = await Promise.all([
      Halat.countDocuments(),
      Halat.countDocuments({ durumu: 'Aktif' }),
      Halat.countDocuments({ durumu: 'Pasif' }),
      Halat.aggregate([
        { $match: { satinAlisFiyati: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$adet', '$satinAlisFiyati'] } } } }
      ]),
      Halat.countDocuments({ kalanMiktar: { $lt: 10 } }),
      Halat.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    const stats = {
      totalCount,
      activeCount,
      passiveCount,
      totalValue: totalValue[0]?.total || 0,
      lowStockCount,
      outOfStockCount: await Halat.countDocuments({ kalanMiktar: { $lte: 0 } }),
      recentCount,
      lastUpdate: new Date().toISOString()
    };

    res.json(successResponse(stats, 'Halat istatistikleri başarıyla getirildi'));
  } catch (error) {
    console.error('Halat istatistikleri hatası:', error);
    res.status(500).json(errorResponse('İstatistikler getirilemedi'));
  }
};

/**
 * @desc    Toplu halat işlemleri
 * @route   POST /api/halat/bulk
 * @access  Private
 */
const bulkHalatOperations = async (req, res) => {
  try {
    const { operation, items, filters } = req.body;

    switch (operation) {
      case 'delete':
        if (items && items.length > 0) {
          await Halat.deleteMany({ _id: { $in: items } });
          res.json(successResponse(null, `${items.length} halat malzeme silindi`));
        } else {
          res.status(400).json(errorResponse('Silinecek öğeler belirtilmedi'));
        }
        break;

      case 'update':
        if (items && items.length > 0 && req.body.updateData) {
          await Halat.updateMany(
            { _id: { $in: items } },
            { ...req.body.updateData, updatedAt: new Date() }
          );
          res.json(successResponse(null, `${items.length} halat malzeme güncellendi`));
        } else {
          res.status(400).json(errorResponse('Güncellenecek öğeler veya veriler belirtilmedi'));
        }
        break;

      default:
        res.status(400).json(errorResponse('Geçersiz toplu işlem'));
    }
  } catch (error) {
    console.error('Toplu halat işlemi hatası:', error);
    res.status(500).json(errorResponse('Toplu işlem gerçekleştirilemedi'));
  }
};

module.exports = {
  getHalatItems,
  getHalatById,
  createHalat,
  updateHalat,
  deleteHalat,
  getHalatStats,
  bulkHalatOperations
};