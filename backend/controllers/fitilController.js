// backend/controllers/fitilController.js - Düzeltilmiş
const Fitil = require('../models/Fitil');
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
 * @desc    Tüm fitil malzemeleri listele
 * @route   GET /api/fitil
 * @access  Public
 */
const getFitilItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status,
      malzeme,
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
        'malzeme', 'cins', 'kalite', 'aciklama', 'stokKodu', 'renk'
      ]);
      Object.assign(filter, searchQuery);
    }
    
    // Status filter
    if (status) {
      filter.durumu = status;
    }
    
    // Material filter
    if (malzeme) {
      filter.malzeme = new RegExp(malzeme, 'i');
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
      Fitil.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Fitil.countDocuments(filter)
    ]);

    // Clean and sanitize data
    const cleanedItems = sanitizeItems(cleanDocuments(items));
    
    // Calculate pagination info
    const pagination = getPaginationInfo(page, limit, totalCount);

    res.json(successResponse(
      cleanedItems,
      'Fitil listesi başarıyla getirildi',
      pagination,
      { search: search || '', status: status || '', malzeme: malzeme || '' }
    ));
  } catch (error) {
    console.error('Fitil listesi hatası:', error);
    res.status(500).json(errorResponse('Fitil listesi getirilemedi'));
  }
};

/**
 * @desc    Tek fitil malzeme getir
 * @route   GET /api/fitil/:id
 * @access  Public
 */
const getFitilById = async (req, res) => {
  try {
    const fitil = await Fitil.findById(req.params.id).lean();
    
    if (!fitil) {
      return res.status(404).json(errorResponse('Fitil malzeme bulunamadı'));
    }

    res.json(successResponse(
      cleanDocument(fitil),
      'Fitil malzeme başarıyla getirildi'
    ));
  } catch (error) {
    console.error('Fitil getirme hatası:', error);
    res.status(500).json(errorResponse('Fitil malzeme getirilemedi'));
  }
};

/**
 * @desc    Yeni fitil malzeme ekle
 * @route   POST /api/fitil
 * @access  Private
 */
const createFitil = async (req, res) => {
  try {
    // Kalan miktar hesapla
    req.body.kalanMiktar = req.body.adet;
    
    const fitil = new Fitil(req.body);
    const savedFitil = await fitil.save();

    // Log kaydı
    await Log.create({
      action: 'CREATE',
      collection: 'fitil',
      documentId: savedFitil._id,
      newData: savedFitil,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.status(201).json(successResponse(
      cleanDocument(savedFitil),
      'Fitil malzeme başarıyla eklendi'
    ));
  } catch (error) {
    console.error('Fitil ekleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Fitil malzeme eklenemedi'));
  }
};

/**
 * @desc    Fitil malzeme güncelle
 * @route   PUT /api/fitil/:id
 * @access  Private
 */
const updateFitil = async (req, res) => {
  try {
    const oldFitil = await Fitil.findById(req.params.id);
    
    if (!oldFitil) {
      return res.status(404).json(errorResponse('Fitil malzeme bulunamadı'));
    }

    // Güncelleme verilerini hazırla
    const updateData = { ...req.body };
    updateData.updatedAt = new Date();

    const updatedFitil = await Fitil.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log kaydı
    await Log.create({
      action: 'UPDATE',
      collection: 'fitil',
      documentId: updatedFitil._id,
      oldData: oldFitil,
      newData: updatedFitil,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      cleanDocument(updatedFitil),
      'Fitil malzeme başarıyla güncellendi'
    ));
  } catch (error) {
    console.error('Fitil güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Fitil malzeme güncellenemedi'));
  }
};

/**
 * @desc    Fitil malzeme sil
 * @route   DELETE /api/fitil/:id
 * @access  Private
 */
const deleteFitil = async (req, res) => {
  try {
    const fitil = await Fitil.findById(req.params.id);
    
    if (!fitil) {
      return res.status(404).json(errorResponse('Fitil malzeme bulunamadı'));
    }

    await Fitil.findByIdAndDelete(req.params.id);

    // Log kaydı
    await Log.create({
      action: 'DELETE',
      collection: 'fitil',
      documentId: req.params.id,
      oldData: fitil,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      null,
      'Fitil malzeme başarıyla silindi'
    ));
  } catch (error) {
    console.error('Fitil silme hatası:', error);
    res.status(500).json(errorResponse('Fitil malzeme silinemedi'));
  }
};

/**
 * @desc    Fitil istatistikleri
 * @route   GET /api/fitil/stats
 * @access  Public
 */
const getFitilStats = async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      passiveCount,
      totalValue,
      lowStockCount,
      recentCount
    ] = await Promise.all([
      Fitil.countDocuments(),
      Fitil.countDocuments({ durumu: 'Aktif' }),
      Fitil.countDocuments({ durumu: 'Pasif' }),
      Fitil.aggregate([
        { $match: { satinAlisFiyati: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$adet', '$satinAlisFiyati'] } } } }
      ]),
      Fitil.countDocuments({ kalanMiktar: { $lt: 10 } }),
      Fitil.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    const stats = {
      totalCount,
      activeCount,
      passiveCount,
      totalValue: totalValue[0]?.total || 0,
      lowStockCount,
      outOfStockCount: await Fitil.countDocuments({ kalanMiktar: { $lte: 0 } }),
      recentCount,
      lastUpdate: new Date().toISOString()
    };

    res.json(successResponse(stats, 'Fitil istatistikleri başarıyla getirildi'));
  } catch (error) {
    console.error('Fitil istatistikleri hatası:', error);
    res.status(500).json(errorResponse('İstatistikler getirilemedi'));
  }
};

/**
 * @desc    Toplu fitil işlemleri
 * @route   POST /api/fitil/bulk
 * @access  Private
 */
const bulkFitilOperations = async (req, res) => {
  try {
    const { operation, items, filters } = req.body;

    switch (operation) {
      case 'delete':
        if (items && items.length > 0) {
          await Fitil.deleteMany({ _id: { $in: items } });
          res.json(successResponse(null, `${items.length} fitil malzeme silindi`));
        } else {
          res.status(400).json(errorResponse('Silinecek öğeler belirtilmedi'));
        }
        break;

      case 'update':
        if (items && items.length > 0 && req.body.updateData) {
          await Fitil.updateMany(
            { _id: { $in: items } },
            { ...req.body.updateData, updatedAt: new Date() }
          );
          res.json(successResponse(null, `${items.length} fitil malzeme güncellendi`));
        } else {
          res.status(400).json(errorResponse('Güncellenecek öğeler veya veriler belirtilmedi'));
        }
        break;

      default:
        res.status(400).json(errorResponse('Geçersiz toplu işlem'));
    }
  } catch (error) {
    console.error('Toplu fitil işlemi hatası:', error);
    res.status(500).json(errorResponse('Toplu işlem gerçekleştirilemedi'));
  }
};

module.exports = {
  getFitilItems,
  getFitilById,
  createFitil,
  updateFitil,
  deleteFitil,
  getFitilStats,
  bulkFitilOperations
};