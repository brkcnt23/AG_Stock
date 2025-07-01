// backend/controllers/sarfController.js - Standardize edilmiş
const Sarf = require('../models/Sarf');
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
 * @desc    Tüm sarf malzemeleri listele
 * @route   GET /api/sarf
 * @access  Public
 */
const getSarfItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status,
      malzemeCinsi,
      cins,
      kalite,
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
        'malzemeCinsi', 'cins', 'kalite', 'aciklama', 'stokKodu'
      ]);
      Object.assign(filter, searchQuery);
    }
    
    // Status filter
    if (status) {
      filter.durumu = status;
    }
    
    // Material type filter
    if (malzemeCinsi) {
      filter.malzemeCinsi = new RegExp(malzemeCinsi, 'i');
    }
    
    // Type filter
    if (cins) {
      filter.cins = new RegExp(cins, 'i');
    }
    
    // Quality filter
    if (kalite) {
      filter.kalite = new RegExp(kalite, 'i');
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
      Sarf.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Sarf.countDocuments(filter)
    ]);

    // Clean and sanitize data
    const cleanedItems = sanitizeItems(cleanDocuments(items));
    
    // Calculate pagination info
    const pagination = getPaginationInfo(page, limit, totalCount);

    res.json(successResponse(
      cleanedItems,
      'Sarf listesi başarıyla getirildi',
      pagination,
      { search: search || '', status: status || '', malzemeCinsi: malzemeCinsi || '' }
    ));
  } catch (error) {
    console.error('Sarf listesi hatası:', error);
    res.status(500).json(errorResponse('Sarf listesi getirilemedi'));
  }
};

/**
 * @desc    Tek sarf malzeme getir
 * @route   GET /api/sarf/:id
 * @access  Public
 */
const getSarfById = async (req, res) => {
  try {
    const sarf = await Sarf.findById(req.params.id).lean();
    
    if (!sarf) {
      return res.status(404).json(errorResponse('Sarf malzeme bulunamadı'));
    }

    res.json(successResponse(
      cleanDocument(sarf),
      'Sarf malzeme başarıyla getirildi'
    ));
  } catch (error) {
    console.error('Sarf getirme hatası:', error);
    res.status(500).json(errorResponse('Sarf malzeme getirilemedi'));
  }
};

/**
 * @desc    Yeni sarf malzeme ekle
 * @route   POST /api/sarf
 * @access  Private
 */
const createSarf = async (req, res) => {
  try {
    // Kalan miktar hesapla
    req.body.kalanMiktar = req.body.adet;
    
    const sarf = new Sarf(req.body);
    const savedSarf = await sarf.save();

    // Log kaydı
    await Log.create({
      action: 'CREATE',
      collection: 'sarf',
      documentId: savedSarf._id,
      newData: savedSarf,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.status(201).json(successResponse(
      cleanDocument(savedSarf),
      'Sarf malzeme başarıyla eklendi'
    ));
  } catch (error) {
    console.error('Sarf ekleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Sarf malzeme eklenemedi'));
  }
};

/**
 * @desc    Sarf malzeme güncelle
 * @route   PUT /api/sarf/:id
 * @access  Private
 */
const updateSarf = async (req, res) => {
  try {
    const oldSarf = await Sarf.findById(req.params.id);
    
    if (!oldSarf) {
      return res.status(404).json(errorResponse('Sarf malzeme bulunamadı'));
    }

    const updateData = { ...req.body };
    updateData.updatedAt = new Date();

    const updatedSarf = await Sarf.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log kaydı
    await Log.create({
      action: 'UPDATE',
      collection: 'sarf',
      documentId: updatedSarf._id,
      oldData: oldSarf,
      newData: updatedSarf,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      cleanDocument(updatedSarf),
      'Sarf malzeme başarıyla güncellendi'
    ));
  } catch (error) {
    console.error('Sarf güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Sarf malzeme güncellenemedi'));
  }
};

/**
 * @desc    Sarf malzeme sil
 * @route   DELETE /api/sarf/:id
 * @access  Private
 */
const deleteSarf = async (req, res) => {
  try {
    const sarf = await Sarf.findById(req.params.id);
    
    if (!sarf) {
      return res.status(404).json(errorResponse('Sarf malzeme bulunamadı'));
    }

    await Sarf.findByIdAndDelete(req.params.id);

    // Log kaydı
    await Log.create({
      action: 'DELETE',
      collection: 'sarf',
      documentId: req.params.id,
      oldData: sarf,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      null,
      'Sarf malzeme başarıyla silindi'
    ));
  } catch (error) {
    console.error('Sarf silme hatası:', error);
    res.status(500).json(errorResponse('Sarf malzeme silinemedi'));
  }
};

/**
 * @desc    Sarf istatistikleri
 * @route   GET /api/sarf/stats
 * @access  Public
 */
const getSarfStats = async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      passiveCount,
      totalValue,
      lowStockCount,
      recentCount
    ] = await Promise.all([
      Sarf.countDocuments(),
      Sarf.countDocuments({ durumu: 'Aktif' }),
      Sarf.countDocuments({ durumu: 'Pasif' }),
      Sarf.aggregate([
        { $match: { satinAlisFiyati: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$adet', '$satinAlisFiyati'] } } } }
      ]),
      Sarf.countDocuments({ kalanMiktar: { $lt: 10 } }),
      Sarf.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    const stats = {
      totalCount,
      activeCount,
      passiveCount,
      totalValue: totalValue[0]?.total || 0,
      lowStockCount,
      outOfStockCount: await Sarf.countDocuments({ kalanMiktar: { $lte: 0 } }),
      recentCount,
      lastUpdate: new Date().toISOString()
    };

    res.json(successResponse(stats, 'Sarf istatistikleri başarıyla getirildi'));
  } catch (error) {
    console.error('Sarf istatistikleri hatası:', error);
    res.status(500).json(errorResponse('İstatistikler getirilemedi'));
  }
};

/**
 * @desc    Toplu sarf işlemleri
 * @route   POST /api/sarf/bulk
 * @access  Private
 */
const bulkSarfOperations = async (req, res) => {
  try {
    const { operation, items, filters } = req.body;

    switch (operation) {
      case 'delete':
        if (items && items.length > 0) {
          await Sarf.deleteMany({ _id: { $in: items } });
          res.json(successResponse(null, `${items.length} sarf malzeme silindi`));
        } else {
          res.status(400).json(errorResponse('Silinecek öğeler belirtilmedi'));
        }
        break;

      case 'update':
        if (items && items.length > 0 && req.body.updateData) {
          await Sarf.updateMany(
            { _id: { $in: items } },
            { ...req.body.updateData, updatedAt: new Date() }
          );
          res.json(successResponse(null, `${items.length} sarf malzeme güncellendi`));
        } else {
          res.status(400).json(errorResponse('Güncellenecek öğeler veya veriler belirtilmedi'));
        }
        break;

      default:
        res.status(400).json(errorResponse('Geçersiz toplu işlem'));
    }
  } catch (error) {
    console.error('Toplu sarf işlemi hatası:', error);
    res.status(500).json(errorResponse('Toplu işlem gerçekleştirilemedi'));
  }
};

// Legacy methods için uyumluluk (eski API çağrıları)
const getAll = getSarfItems;
const create = createSarf;
const update = updateSarf;
const deleteItem = deleteSarf;

module.exports = {
  // Yeni standardize edilmiş methodlar
  getSarfItems,
  getSarfById,
  createSarf,
  updateSarf,
  deleteSarf,
  getSarfStats,
  bulkSarfOperations,
  
  // Legacy methodlar (geriye uyumluluk için)
  getAll,
  create,
  update,
  delete: deleteItem
};