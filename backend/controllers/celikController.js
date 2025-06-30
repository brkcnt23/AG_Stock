// backend/controllers/celikController.js
const Celik = require('../models/Celik');
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
 * @desc    Tüm çelik malzemeleri listele
 * @route   GET /api/celik
 * @access  Public
 */
const getCelikItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status,
      kalite,
      tip,
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
        'malzemeCinsi', 'kalite', 'tip', 'aciklama', 'stokKodu'
      ]);
      Object.assign(filter, searchQuery);
    }
    
    // Status filter
    if (status) {
      filter.durumu = status;
    }
    
    // Quality filter
    if (kalite) {
      filter.kalite = new RegExp(kalite, 'i');
    }
    
    // Type filter
    if (tip) {
      filter.tip = new RegExp(tip, 'i');
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
      Celik.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Celik.countDocuments(filter)
    ]);

    // Clean and sanitize data
    const cleanedItems = sanitizeItems(cleanDocuments(items));
    
    // Calculate pagination info
    const pagination = getPaginationInfo(page, limit, totalCount);

    res.json(successResponse(
      cleanedItems,
      'Çelik listesi başarıyla getirildi',
      pagination,
      { search: search || '', status: status || '', kalite: kalite || '' }
    ));
  } catch (error) {
    console.error('Çelik listesi hatası:', error);
    res.status(500).json(errorResponse('Çelik listesi getirilemedi'));
  }
};

/**
 * @desc    Tek çelik malzeme getir
 * @route   GET /api/celik/:id
 * @access  Public
 */
const getCelikById = async (req, res) => {
  try {
    const celik = await Celik.findById(req.params.id).lean();
    
    if (!celik) {
      return res.status(404).json(errorResponse('Çelik malzeme bulunamadı'));
    }

    res.json(successResponse(
      cleanDocument(celik),
      'Çelik malzeme başarıyla getirildi'
    ));
  } catch (error) {
    console.error('Çelik getirme hatası:', error);
    res.status(500).json(errorResponse('Çelik malzeme getirilemedi'));
  }
};

/**
 * @desc    Yeni çelik malzeme ekle
 * @route   POST /api/celik
 * @access  Private
 */
const createCelik = async (req, res) => {
  try {
    // Kalan miktar hesapla
    req.body.kalanMiktar = req.body.adet;
    
    const celik = new Celik(req.body);
    const savedCelik = await celik.save();

    // Log kaydı
    await Log.create({
      action: 'CREATE',
      collection: 'celik',
      documentId: savedCelik._id,
      newData: savedCelik,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.status(201).json(successResponse(
      cleanDocument(savedCelik),
      'Çelik malzeme başarıyla eklendi'
    ));
  } catch (error) {
    console.error('Çelik ekleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Çelik malzeme eklenemedi'));
  }
};

/**
 * @desc    Çelik malzeme güncelle
 * @route   PUT /api/celik/:id
 * @access  Private
 */
const updateCelik = async (req, res) => {
  try {
    const oldCelik = await Celik.findById(req.params.id);
    
    if (!oldCelik) {
      return res.status(404).json(errorResponse('Çelik malzeme bulunamadı'));
    }

    // Güncelleme verilerini hazırla
    const updateData = { ...req.body };
    updateData.updatedAt = new Date();

    const updatedCelik = await Celik.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log kaydı
    await Log.create({
      action: 'UPDATE',
      collection: 'celik',
      documentId: updatedCelik._id,
      oldData: oldCelik,
      newData: updatedCelik,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      cleanDocument(updatedCelik),
      'Çelik malzeme başarıyla güncellendi'
    ));
  } catch (error) {
    console.error('Çelik güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Çelik malzeme güncellenemedi'));
  }
};

/**
 * @desc    Çelik malzeme sil
 * @route   DELETE /api/celik/:id
 * @access  Private
 */
const deleteCelik = async (req, res) => {
  try {
    const celik = await Celik.findById(req.params.id);
    
    if (!celik) {
      return res.status(404).json(errorResponse('Çelik malzeme bulunamadı'));
    }

    await Celik.findByIdAndDelete(req.params.id);

    // Log kaydı
    await Log.create({
      action: 'DELETE',
      collection: 'celik',
      documentId: req.params.id,
      oldData: celik,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      null,
      'Çelik malzeme başarıyla silindi'
    ));
  } catch (error) {
    console.error('Çelik silme hatası:', error);
    res.status(500).json(errorResponse('Çelik malzeme silinemedi'));
  }
};

/**
 * @desc    Çelik istatistikleri
 * @route   GET /api/celik/stats
 * @access  Public
 */
const getCelikStats = async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      passiveCount,
      totalValue,
      lowStockCount,
      recentCount
    ] = await Promise.all([
      Celik.countDocuments(),
      Celik.countDocuments({ durumu: 'Aktif' }),
      Celik.countDocuments({ durumu: 'Pasif' }),
      Celik.aggregate([
        { $match: { satinAlisFiyati: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$adet', '$satinAlisFiyati'] } } } }
      ]),
      Celik.countDocuments({ kalanMiktar: { $lt: 10 } }),
      Celik.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    const stats = {
      totalCount,
      activeCount,
      passiveCount,
      totalValue: totalValue[0]?.total || 0,
      lowStockCount,
      outOfStockCount: await Celik.countDocuments({ kalanMiktar: { $lte: 0 } }),
      recentCount,
      lastUpdate: new Date().toISOString()
    };

    res.json(successResponse(stats, 'Çelik istatistikleri başarıyla getirildi'));
  } catch (error) {
    console.error('Çelik istatistikleri hatası:', error);
    res.status(500).json(errorResponse('İstatistikler getirilemedi'));
  }
};

/**
 * @desc    Toplu çelik işlemleri
 * @route   POST /api/celik/bulk
 * @access  Private
 */
const bulkCelikOperations = async (req, res) => {
  try {
    const { operation, items, filters } = req.body;

    switch (operation) {
      case 'delete':
        if (items && items.length > 0) {
          await Celik.deleteMany({ _id: { $in: items } });
          res.json(successResponse(null, `${items.length} çelik malzeme silindi`));
        } else {
          res.status(400).json(errorResponse('Silinecek öğeler belirtilmedi'));
        }
        break;

      case 'update':
        if (items && items.length > 0 && req.body.updateData) {
          await Celik.updateMany(
            { _id: { $in: items } },
            { ...req.body.updateData, updatedAt: new Date() }
          );
          res.json(successResponse(null, `${items.length} çelik malzeme güncellendi`));
        } else {
          res.status(400).json(errorResponse('Güncellenecek öğeler veya veriler belirtilmedi'));
        }
        break;

      default:
        res.status(400).json(errorResponse('Geçersiz toplu işlem'));
    }
  } catch (error) {
    console.error('Toplu çelik işlemi hatası:', error);
    res.status(500).json(errorResponse('Toplu işlem gerçekleştirilemedi'));
  }
};

module.exports = {
  getCelikItems,
  getCelikById,
  createCelik,
  updateCelik,
  deleteCelik,
  getCelikStats,
  bulkCelikOperations
};