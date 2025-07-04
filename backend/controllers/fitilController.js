// backend/controllers/fitilController.js - Fixed
const Fitil = require('../models/Fitil');
const { 
  successResponse, 
  errorResponse, 
  getPaginationInfo,
  buildSearchQuery,
  sanitizeItems
} = require('../utils/helpers');
const { cleanDocument, cleanDocuments } = require('../utils/objectId');

/**
 * @desc    Tüm fitilleri getir
 * @route   GET /api/fitil
 * @access  Public
 */
const getFitils = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status,
      malzemeTuru,
      sortBy = 'createdAt', 
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};
    
    // Search filter
    if (search) {
      const searchQuery = buildSearchQuery(search, [
        'malzeme', 'cins', 'kalite', 'aciklama'
      ]);
      Object.assign(filter, searchQuery);
    }
    
    // Status filter
    if (status) {
      filter.durumu = status;
    }
    
    // Material type filter
    if (malzemeTuru) {
      filter.malzemeTuru = malzemeTuru;
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
      { search: search || '', status: status || '', malzemeTuru: malzemeTuru || '' }
    ));
  } catch (error) {
    console.error('Fitil listesi hatası:', error);
    res.status(500).json(errorResponse('Fitil listesi getirilemedi'));
  }
};

/**
 * @desc    Tek fitil getir
 * @route   GET /api/fitil/:id
 * @access  Public
 */
const getFitilById = async (req, res) => {
  try {
    const fitil = await Fitil.findById(req.params.id).lean();
    
    if (!fitil) {
      return res.status(404).json(errorResponse('Fitil bulunamadı'));
    }

    res.json(successResponse(
      cleanDocument(fitil),
      'Fitil başarıyla getirildi'
    ));
  } catch (error) {
    console.error('Fitil getirme hatası:', error);
    res.status(500).json(errorResponse('Fitil getirilemedi'));
  }
};

/**
 * @desc    Yeni fitil oluştur
 * @route   POST /api/fitil
 * @access  Private
 */
const createFitil = async (req, res) => {
  try {
    const newFitil = new Fitil({
      ...req.body,
      malzemeTuru: 'fitil' // Her zaman 'fitil' olarak ayarla
    });
    
    const savedFitil = await newFitil.save();
    console.log('✅ Yeni fitil oluşturuldu:', savedFitil._id);
    
    res.status(201).json(successResponse(
      cleanDocument(savedFitil),
      'Fitil başarıyla oluşturuldu'
    ));
  } catch (error) {
    console.error('❌ Fitil oluşturma hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Fitil oluşturulamadı'));
  }
};

/**
 * @desc    Fitil güncelle
 * @route   PUT /api/fitil/:id
 * @access  Private
 */
const updateFitil = async (req, res) => {
  try {
    const updatedFitil = await Fitil.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedFitil) {
      return res.status(404).json(errorResponse('Fitil bulunamadı'));
    }

    console.log('✅ Fitil güncellendi:', req.params.id);
    res.json(successResponse(
      cleanDocument(updatedFitil), 
      'Fitil başarıyla güncellendi'
    ));
  } catch (error) {
    console.error('❌ Fitil güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Fitil güncellenemedi'));
  }
};

/**
 * @desc    Fitil sil
 * @route   DELETE /api/fitil/:id
 * @access  Private
 */
const deleteFitil = async (req, res) => {
  try {
    const deletedFitil = await Fitil.findByIdAndDelete(req.params.id);
    
    if (!deletedFitil) {
      return res.status(404).json(errorResponse('Fitil bulunamadı'));
    }

    console.log('✅ Fitil silindi:', req.params.id);
    res.json(successResponse(null, 'Fitil başarıyla silindi'));
  } catch (error) {
    console.error('❌ Fitil silme hatası:', error);
    res.status(500).json(errorResponse('Fitil silinemedi'));
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
      lowStockCount,
      recentCount
    ] = await Promise.all([
      Fitil.countDocuments(),
      Fitil.countDocuments({ durumu: 'Aktif' }),
      Fitil.countDocuments({ kalanMiktar: { $lt: '10' } }),
      Fitil.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    const stats = {
      totalCount,
      activeCount,
      lowStockCount,
      recentCount,
      lastUpdate: new Date().toISOString()
    };

    res.json(successResponse(stats, 'Fitil istatistikleri başarıyla getirildi'));
  } catch (error) {
    console.error('Fitil istatistikleri hatası:', error);
    res.status(500).json(errorResponse('İstatistikler getirilemedi'));
  }
};

module.exports = {
  getFitils,
  getFitilById,
  createFitil,
  updateFitil,
  deleteFitil,
  getFitilStats
};