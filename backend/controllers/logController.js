// backend/controllers/logController.js
const Log = require('../models/Log');
const { 
  successResponse, 
  errorResponse, 
  getPaginationInfo,
  buildSearchQuery,
  sanitizeItems
} = require('../utils/helpers');
const { cleanDocument, cleanDocuments } = require('../utils/objectId');

/**
 * @desc    Tüm logları listele
 * @route   GET /api/logs
 * @access  Private
 */
const getLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search, 
      action,
      collection,
      userId,
      startDate,
      endDate,
      sortBy = 'timestamp', 
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};
    
    // Search filter
    if (search) {
      const searchQuery = buildSearchQuery(search, [
        'action', 'collection', 'userName', 'description'
      ]);
      Object.assign(filter, searchQuery);
    }
    
    // Action filter
    if (action) {
      filter.action = action;
    }
    
    // Collection filter
    if (collection) {
      filter.collection = collection;
    }
    
    // User filter
    if (userId) {
      filter.userId = userId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute queries
    const [items, totalCount] = await Promise.all([
      Log.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Log.countDocuments(filter)
    ]);

    // Clean and sanitize data
    const cleanedItems = sanitizeItems(cleanDocuments(items));
    
    // Calculate pagination info
    const pagination = getPaginationInfo(page, limit, totalCount);

    res.json(successResponse(
      cleanedItems,
      'Log listesi başarıyla getirildi',
      pagination,
      { 
        search: search || '', 
        action: action || '', 
        collection: collection || '',
        startDate: startDate || '',
        endDate: endDate || ''
      }
    ));
  } catch (error) {
    console.error('Log listesi hatası:', error);
    res.status(500).json(errorResponse('Log listesi getirilemedi'));
  }
};

/**
 * @desc    Tek log getir
 * @route   GET /api/logs/:id
 * @access  Private
 */
const getLogById = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id).lean();
    
    if (!log) {
      return res.status(404).json(errorResponse('Log bulunamadı'));
    }

    res.json(successResponse(
      cleanDocument(log),
      'Log başarıyla getirildi'
    ));
  } catch (error) {
    console.error('Log getirme hatası:', error);
    res.status(500).json(errorResponse('Log getirilemedi'));
  }
};

/**
 * @desc    Log oluştur
 * @route   POST /api/logs
 * @access  Private
 */
const createLog = async (req, res) => {
  try {
    const log = new Log(req.body);
    const savedLog = await log.save();

    res.status(201).json(successResponse(
      cleanDocument(savedLog),
      'Log başarıyla oluşturuldu'
    ));
  } catch (error) {
    console.error('Log oluşturma hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Log oluşturulamadı'));
  }
};

/**
 * @desc    Log sil
 * @route   DELETE /api/logs/:id
 * @access  Private
 */
const deleteLog = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json(errorResponse('Log bulunamadı'));
    }

    await Log.findByIdAndDelete(req.params.id);

    res.json(successResponse(
      null,
      'Log başarıyla silindi'
    ));
  } catch (error) {
    console.error('Log silme hatası:', error);
    res.status(500).json(errorResponse('Log silinemedi'));
  }
};

/**
 * @desc    Log istatistikleri
 * @route   GET /api/logs/stats
 * @access  Private
 */
const getLogStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFrom = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [
      totalCount,
      recentCount,
      actionCounts,
      collectionCounts,
      userCounts,
      dailyStats
    ] = await Promise.all([
      Log.countDocuments(),
      Log.countDocuments({ timestamp: { $gte: dateFrom } }),
      Log.aggregate([
        { $match: { timestamp: { $gte: dateFrom } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Log.aggregate([
        { $match: { timestamp: { $gte: dateFrom } } },
        { $group: { _id: '$collection', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Log.aggregate([
        { $match: { timestamp: { $gte: dateFrom }, userName: { $exists: true, $ne: null } } },
        { $group: { _id: '$userName', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Log.aggregate([
        { $match: { timestamp: { $gte: dateFrom } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const stats = {
      totalCount,
      recentCount,
      period: `${days} gün`,
      actionDistribution: actionCounts,
      collectionDistribution: collectionCounts,
      topUsers: userCounts,
      dailyActivity: dailyStats,
      lastUpdate: new Date().toISOString()
    };

    res.json(successResponse(stats, 'Log istatistikleri başarıyla getirildi'));
  } catch (error) {
    console.error('Log istatistikleri hatası:', error);
    res.status(500).json(errorResponse('İstatistikler getirilemedi'));
  }
};

/**
 * @desc    Sistem aktivite özeti
 * @route   GET /api/logs/activity
 * @access  Private
 */
const getActivitySummary = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const dateFrom = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);

    const activities = await Log.find({ 
      timestamp: { $gte: dateFrom } 
    })
    .select('action collection userName timestamp documentId')
    .sort({ timestamp: -1 })
    .limit(100)
    .lean();

    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      action: activity.action,
      collection: activity.collection,
      user: activity.userName || 'Sistem',
      timestamp: activity.timestamp,
      target: activity.documentId,
      timeAgo: getTimeAgo(activity.timestamp)
    }));

    res.json(successResponse(
      formattedActivities,
      `Son ${hours} saatteki aktiviteler`
    ));
  } catch (error) {
    console.error('Aktivite özeti hatası:', error);
    res.status(500).json(errorResponse('Aktivite özeti getirilemedi'));
  }
};

/**
 * @desc    Logları temizle (eski kayıtları sil)
 * @route   DELETE /api/logs/cleanup
 * @access  Private
 */
const cleanupLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const dateThreshold = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const result = await Log.deleteMany({ 
      timestamp: { $lt: dateThreshold } 
    });

    // Temizleme işlemini logla
    await Log.create({
      action: 'CLEANUP',
      collection: 'logs',
      description: `${result.deletedCount} adet log kaydı temizlendi (${days} günden eski)`,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      { deletedCount: result.deletedCount },
      `${result.deletedCount} adet eski log kaydı temizlendi`
    ));
  } catch (error) {
    console.error('Log temizleme hatası:', error);
    res.status(500).json(errorResponse('Log temizleme işlemi başarısız'));
  }
};

/**
 * @desc    Toplu log işlemleri
 * @route   POST /api/logs/bulk
 * @access  Private
 */
const bulkLogOperations = async (req, res) => {
  try {
    const { operation, items, filters } = req.body;

    switch (operation) {
      case 'delete':
        if (items && items.length > 0) {
          await Log.deleteMany({ _id: { $in: items } });
          res.json(successResponse(null, `${items.length} log kaydı silindi`));
        } else {
          res.status(400).json(errorResponse('Silinecek öğeler belirtilmedi'));
        }
        break;

      case 'deleteByFilter':
        if (filters) {
          const result = await Log.deleteMany(filters);
          res.json(successResponse(
            { deletedCount: result.deletedCount },
            `${result.deletedCount} log kaydı silindi`
          ));
        } else {
          res.status(400).json(errorResponse('Filtre belirtilmedi'));
        }
        break;

      default:
        res.status(400).json(errorResponse('Geçersiz toplu işlem'));
    }
  } catch (error) {
    console.error('Toplu log işlemi hatası:', error);
    res.status(500).json(errorResponse('Toplu işlem gerçekleştirilemedi'));
  }
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  return `${diffDays} gün önce`;
};

module.exports = {
  getLogs,
  getLogById,
  createLog,
  deleteLog,
  getLogStats,
  getActivitySummary,
  cleanupLogs,
  bulkLogOperations
};