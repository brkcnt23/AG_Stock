// backend/controllers/projectController.js
const Project = require('../models/Project');
const Log = require('../models/Log');
const Sarf = require('../models/Sarf');
const Membran = require('../models/Membran');
const Celik = require('../models/Celik');
const Halat = require('../models/Halat');
const Fitil = require('../models/Fitil');
const { 
  successResponse, 
  errorResponse, 
  getPaginationInfo,
  buildSearchQuery,
  sanitizeItems
} = require('../utils/helpers');
const { cleanDocument, cleanDocuments } = require('../utils/objectId');

// Model mapping for material types
const getModelByType = (materialType) => {
  const models = {
    'sarf': Sarf,
    'membran': Membran,
    'celik': Celik,
    'halat': Halat,
    'fitil': Fitil
  };
  return models[materialType];
};

/**
 * @desc    Tüm projeleri listele
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status,
      priority,
      sortBy = 'createdAt', 
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};
    
    // Search filter
    if (search) {
      const searchQuery = buildSearchQuery(search, [
        'name', 'description', 'projectManager', 'notes'
      ]);
      Object.assign(filter, searchQuery);
    }
    
    // Status filter
    if (status) {
      filter.status = status;
    }
    
    // Priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute queries
    const [items, totalCount] = await Promise.all([
      Project.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Project.countDocuments(filter)
    ]);

    // Clean and sanitize data
    const cleanedItems = sanitizeItems(cleanDocuments(items));
    
    // Calculate pagination info
    const pagination = getPaginationInfo(page, limit, totalCount);

    res.json(successResponse(
      cleanedItems,
      'Proje listesi başarıyla getirildi',
      pagination,
      { search: search || '', status: status || '', priority: priority || '' }
    ));
  } catch (error) {
    console.error('Proje listesi hatası:', error);
    res.status(500).json(errorResponse('Proje listesi getirilemedi'));
  }
};

/**
 * @desc    Tek proje getir
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    
    if (!project) {
      return res.status(404).json(errorResponse('Proje bulunamadı'));
    }

    res.json(successResponse(
      cleanDocument(project),
      'Proje başarıyla getirildi'
    ));
  } catch (error) {
    console.error('Proje getirme hatası:', error);
    res.status(500).json(errorResponse('Proje getirilemedi'));
  }
};

/**
 * @desc    Yeni proje oluştur
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();

    // Log kaydı
    await Log.create({
      action: 'CREATE',
      collection: 'projects',
      documentId: savedProject._id,
      newData: savedProject,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.status(201).json(successResponse(
      cleanDocument(savedProject),
      'Proje başarıyla oluşturuldu'
    ));
  } catch (error) {
    console.error('Proje oluşturma hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Proje oluşturulamadı'));
  }
};

/**
 * @desc    Proje güncelle
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res) => {
  try {
    const oldProject = await Project.findById(req.params.id);
    
    if (!oldProject) {
      return res.status(404).json(errorResponse('Proje bulunamadı'));
    }

    const updateData = { ...req.body };
    updateData.updatedAt = new Date();

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Log kaydı
    await Log.create({
      action: 'UPDATE',
      collection: 'projects',
      documentId: updatedProject._id,
      oldData: oldProject,
      newData: updatedProject,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      cleanDocument(updatedProject),
      'Proje başarıyla güncellendi'
    ));
  } catch (error) {
    console.error('Proje güncelleme hatası:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json(errorResponse('Doğrulama hatası', 400, errors));
    }
    
    res.status(500).json(errorResponse('Proje güncellenemedi'));
  }
};

/**
 * @desc    Proje sil
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json(errorResponse('Proje bulunamadı'));
    }

    await Project.findByIdAndDelete(req.params.id);

    // Log kaydı
    await Log.create({
      action: 'DELETE',
      collection: 'projects',
      documentId: req.params.id,
      oldData: project,
      userId: req.user?.id,
      userName: req.user?.name
    });

    res.json(successResponse(
      null,
      'Proje başarıyla silindi'
    ));
  } catch (error) {
    console.error('Proje silme hatası:', error);
    res.status(500).json(errorResponse('Proje silinemedi'));
  }
};

/**
 * @desc    Proje istatistikleri
 * @route   GET /api/projects/stats
 * @access  Public
 */
const getProjectStats = async (req, res) => {
  try {
    const [
      totalCount,
      activeCount,
      completedCount,
      plannedCount,
      totalBudget,
      recentCount
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'planning' }),
      Project.countDocuments({ status: 'reserved' }),
      Project.countDocuments({ status: 'planned' }),
      Project.aggregate([
        { $match: { budget: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$budget' } } }
      ]),
      Project.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    const stats = {
      totalCount,
      activeCount,
      completedCount,
      plannedCount,
      totalBudget: totalBudget[0]?.total || 0,
      recentCount,
      lastUpdate: new Date().toISOString()
    };

    res.json(successResponse(stats, 'Proje istatistikleri başarıyla getirildi'));
  } catch (error) {
    console.error('Proje istatistikleri hatası:', error);
    res.status(500).json(errorResponse('İstatistikler getirilemedi'));
  }
};

/**
 * @desc    Malzeme arama (proje için)
 * @route   GET /api/projects/search-materials
 * @access  Public
 */
const searchMaterials = async (req, res) => {
  try {
    const { search, type, limit = 20 } = req.query;

    if (!search) {
      return res.status(400).json(errorResponse('Arama terimi gerekli'));
    }

    const results = [];
    const searchRegex = new RegExp(search, 'i');
    const limitNum = parseInt(limit);

    // Arama yapılacak modeller
    const modelsToSearch = type ? [type] : ['sarf', 'celik', 'membran', 'halat', 'fitil'];

    for (const materialType of modelsToSearch) {
      const Model = getModelByType(materialType);
      if (!Model) continue;

      // Her malzeme tipine göre farklı arama alanları
      let searchFields = [];
      switch (materialType) {
        case 'sarf':
          searchFields = ['malzemeCinsi', 'cins', 'kalite', 'aciklama'];
          break;
        case 'celik':
          searchFields = ['malzemeCinsi', 'kalite', 'tip', 'aciklama'];
          break;
        case 'membran':
          searchFields = ['malzemeTuru', 'malzemeCinsi', 'kalite', 'aciklama'];
          break;
        case 'halat':
          searchFields = ['malzemeTuru', 'cins', 'kalite', 'aciklama'];
          break;
        case 'fitil':
          searchFields = ['malzeme', 'cins', 'kalite', 'aciklama'];
          break;
      }

      const searchQuery = {
        $or: searchFields.map(field => ({ [field]: searchRegex }))
      };

      const materials = await Model.find(searchQuery)
        .limit(limitNum)
        .lean();

      // Sonuçları standart formata çevir
      const formattedMaterials = materials.map(material => ({
        id: material._id,
        materialType,
        name: material[searchFields[0]] || material.name || 'İsimsiz',
        description: material.aciklama || '',
        availableStock: material.kalanMiktar || material.topSayisi || 0,
        unit: material.birim || 'adet',
        unitPrice: material.satinAlisFiyati || 0,
        quality: material.kalite || '',
        project: material.proje || 'Stok'
      }));

      results.push(...formattedMaterials);
    }

    // Sonuçları karıştır ve sınırla
    const shuffledResults = results.sort(() => 0.5 - Math.random()).slice(0, limitNum);

    res.json(successResponse(
      shuffledResults,
      `${shuffledResults.length} malzeme bulundu`
    ));
  } catch (error) {
    console.error('Malzeme arama hatası:', error);
    res.status(500).json(errorResponse('Malzeme araması başarısız'));
  }
};

/**
 * @desc    Toplu proje işlemleri
 * @route   POST /api/projects/bulk
 * @access  Private
 */
const bulkProjectOperations = async (req, res) => {
  try {
    const { operation, items, filters } = req.body;

    switch (operation) {
      case 'delete':
        if (items && items.length > 0) {
          await Project.deleteMany({ _id: { $in: items } });
          res.json(successResponse(null, `${items.length} proje silindi`));
        } else {
          res.status(400).json(errorResponse('Silinecek öğeler belirtilmedi'));
        }
        break;

      case 'update':
        if (items && items.length > 0 && req.body.updateData) {
          await Project.updateMany(
            { _id: { $in: items } },
            { ...req.body.updateData, updatedAt: new Date() }
          );
          res.json(successResponse(null, `${items.length} proje güncellendi`));
        } else {
          res.status(400).json(errorResponse('Güncellenecek öğeler veya veriler belirtilmedi'));
        }
        break;

      default:
        res.status(400).json(errorResponse('Geçersiz toplu işlem'));
    }
  } catch (error) {
    console.error('Toplu proje işlemi hatası:', error);
    res.status(500).json(errorResponse('Toplu işlem gerçekleştirilemedi'));
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  searchMaterials,
  bulkProjectOperations
};