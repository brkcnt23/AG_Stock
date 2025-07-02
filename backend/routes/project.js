// routes/project.js - YENİ OBJECTID REFERANSLI MİMARİ (DEVAM)
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Sarf = require('../models/Sarf');
const Membran = require('../models/Membran');
const Celik = require('../models/Celik');
const Halat = require('../models/Halat');
const Fitil = require('../models/Fitil');
const Log = require('../models/Log');
const socketManager = require('../socket');
// Model mapping - materialType'a göre model seçimi
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
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Geçersiz ObjectId formatı' });
  }
  next();
};

router.use('/:id', validateObjectId);


// Malzeme stok kontrolü - ObjectId ile (DEBUG VERSİYONU)
async function checkMaterialStock(materialId, materialType, requestedQuantity) {
  try {
    console.log('🔍 checkMaterialStock fonksiyonu başlatıldı');
    console.log('📋 Parametreler:', { materialId, materialType, requestedQuantity });
    
    const Model = getModelByType(materialType);
    if (!Model) {
      console.error('❌ Geçersiz malzeme türü:', materialType);
      throw new Error(`Geçersiz malzeme türü: ${materialType}`);
    }
    
    console.log('✅ Model bulundu:', Model.modelName);
    
    const material = await Model.findById(materialId);
    if (!material) {
      console.log('❌ Malzeme bulunamadı, ID:', materialId);
      return {
        found: false,
        available: false,
        availableStock: 0,
        material: null
      };
    }
    
    console.log('✅ Malzeme bulundu:', material.malzeme || material.name || 'İsimsiz');
    console.log('📦 Malzeme verisi:', JSON.stringify(material, null, 2));
    
    // Stok miktarını materialType'a göre al
    let availableStock = 0;
    switch (materialType) {
      case 'sarf':
      case 'celik':
      case 'halat':
      case 'fitil':
        availableStock = parseFloat(material.kalanMiktar || '0');
        console.log('📊 Kalan miktar (sarf/celik/halat/fitil):', availableStock);
        break;
      case 'membran':
        availableStock = parseFloat(material.topSayisi || '0');
        console.log('📊 Top sayısı (membran):', availableStock);
        break;
    }
    
    const sufficient = availableStock >= requestedQuantity;
    console.log('✅ Stok yeterli mi?', sufficient, `(${availableStock} >= ${requestedQuantity})`);
    
    const result = {
      found: true,
      available: sufficient,
      availableStock,
      requestedQuantity,
      material: {
        _id: material._id,
        name: material.malzeme || material.marka || material.tip || 'Malzeme',
        kalite: material.kalite,
        cins: material.cins || material.malzemeCinsi,
        unit: material.birim || 'ADET',
        unitPrice: (material.satinAlisFiyati || 0) * (material.dovizKur || 1),
        supplier: material.tedarikci
      }
    };
    
    console.log('📤 checkMaterialStock sonucu:', result);
    return result;
    
  } catch (error) {
    console.error(`❌ checkMaterialStock hatası:`, error);
    console.error('❌ Error stack:', error.stack);
    return {
      found: false,
      available: false,
      availableStock: 0,
      material: null,
      error: error.message
    };
  }
}

// Stok miktarını güncelle - rezervasyon veya kullanım için
async function updateMaterialStock(materialId, materialType, quantity, operation = 'reserve') {
  try {
    const Model = getModelByType(materialType);
    if (!Model) throw new Error(`Geçersiz malzeme türü: ${materialType}`);
    
    const material = await Model.findById(materialId);
    if (!material) throw new Error('Malzeme bulunamadı');
    
    let updateData = {};
    
    switch (materialType) {
      case 'sarf':
      case 'celik':
      case 'halat':
      case 'fitil':
        if (operation === 'reserve') {
          // Rezervasyon için rezerveEdilen alanını güncelle
          updateData.rezerveEdilen = (parseFloat(material.rezerveEdilen || '0') + quantity).toString();
        } else if (operation === 'consume') {
          // Kullanım için çıkış miktarını artır, kalan miktarı azalt
          const currentKalan = parseFloat(material.kalanMiktar || '0');
          const currentCikis = parseFloat(material.cikisMiktar || '0');
          
          updateData.cikisMiktar = (currentCikis + quantity).toString();
          updateData.kalanMiktar = Math.max(0, currentKalan - quantity).toString();
          
          // Rezerveyi de azalt
          updateData.rezerveEdilen = Math.max(0, parseFloat(material.rezerveEdilen || '0') - quantity).toString();
        } else if (operation === 'unreserve') {
          // Rezervasyon iptal için
          updateData.rezerveEdilen = Math.max(0, parseFloat(material.rezerveEdilen || '0') - quantity).toString();
        }
        break;
        
      case 'membran':
        if (operation === 'reserve') {
          updateData.rezerveEdilen = (parseFloat(material.rezerveEdilen || '0') + quantity).toString();
        } else if (operation === 'consume') {
          const currentTop = parseFloat(material.topSayisi || '0');
          updateData.topSayisi = Math.max(0, currentTop - quantity).toString();
          updateData.rezerveEdilen = Math.max(0, parseFloat(material.rezerveEdilen || '0') - quantity).toString();
        } else if (operation === 'unreserve') {
          updateData.rezerveEdilen = Math.max(0, parseFloat(material.rezerveEdilen || '0') - quantity).toString();
        }
        break;
    }
    
    await Model.findByIdAndUpdate(materialId, updateData);
    console.log(`✅ ${materialType} stok güncellendi: ${operation} - ${quantity}`);
    
  } catch (error) {
    console.error(`❌ Stok güncelleme hatası:`, error);
    throw error;
  }
}

// Proje malzemelerini stok ile kontrol et
async function validateProjectMaterials(materials) {
  const validatedMaterials = [];
  
  for (const material of materials) {
    const stockCheck = await checkMaterialStock(
      material.materialId, 
      material.materialType, 
      material.requestedQuantity
    );
    
    const validatedMaterial = {
      materialId: new mongoose.Types.ObjectId(material.materialId),
      materialType: material.materialType,
      requestedQuantity: material.requestedQuantity,
      reservedQuantity: 0,
      usedQuantity: 0,
      
      // Stok bilgileri
      stockSufficient: stockCheck.available,
      stockAvailable: stockCheck.found,
      availableStock: stockCheck.availableStock,
      
      // Fiyat bilgileri
      unitPrice: stockCheck.material?.unitPrice || 0,
      totalPrice: (stockCheck.material?.unitPrice || 0) * material.requestedQuantity,
      currency: 'TL',
      
      // Durum
      reservationStatus: 'planned',
      priority: material.priority || 'medium',
      notes: material.notes || '',
      
      // Audit
      addedAt: new Date()
    };
    
    validatedMaterials.push(validatedMaterial);
  }
  
  return validatedMaterials;
}

// ===== ROUTES =====

// GET: Malzeme stok kontrolü - Frontend için endpoint
router.get('/check-stock', async (req, res) => {
  try {
    const { materialId, materialType, quantity } = req.query;
    
    // Parameter validation
    if (!materialId) {
      return res.status(400).json({
        success: false,
        error: 'materialId parametresi gerekli'
      });
    }
    
    if (!materialType) {
      return res.status(400).json({
        success: false,
        error: 'materialType parametresi gerekli'
      });
    }
    
    if (!quantity || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        error: 'Geçerli quantity parametresi gerekli'
      });
    }

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz materialId formatı'
      });
    }

    // Stock check
    const stockCheck = await checkMaterialStock(
      materialId, 
      materialType, 
      Number(quantity)
    );
    
    console.log(`🔍 Stok kontrolü: ${materialType}/${materialId} - Miktar: ${quantity}`);
    console.log(`📊 Sonuç: Bulunan: ${stockCheck.found}, Yeterli: ${stockCheck.available}, Mevcut: ${stockCheck.availableStock}`);
    
    res.json({
      success: true,
      data: stockCheck
    });

  } catch (err) {
    console.error('❌ Stok kontrol hatası:', err);
    res.status(500).json({
      success: false,
      error: 'Stok kontrolü başarısız',
      details: err.message
    });
  }
});

// GET: Tüm projeler - populate ile malzemeleri getir
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('materials.materialId'); // ObjectId referanslarını doldur

    console.log(`📤 ${projects.length} proje gönderildi`);
    res.json(projects);
  } catch (err) {
    console.error('❌ Proje listesi hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası', details: err.message });
  }
});

// GET: İstatistikler
router.get('/statistics', async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const planning = await Project.countDocuments({ status: 'planning' });
    const reserved = await Project.countDocuments({ status: 'reserved' });
    const active = await Project.countDocuments({ status: 'active' });
    const completed = await Project.countDocuments({ status: 'completed' });
    const cancelled = await Project.countDocuments({ status: 'cancelled' });
    
    const stats = {
      totalProjects,
      planning,
      reserved,
      active,
      completed,
      cancelled,
      lowStockProjects: await Project.countDocuments({ 
        'materials.stockSufficient': false 
      }),
      recentProjects: await Project.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    };

    res.json(stats);
  } catch (err) {
    console.error('❌ İstatistik hatası:', err);
    res.status(500).json({ error: 'İstatistik hesaplanamadı' });
  }
});

// GET: Tek proje - populate ile malzemeleri getir
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Proje bulunamadı' 
      });
    }

    // Malzemelerin güncel stok bilgilerini al
    const updatedMaterials = [];
    for (const material of project.materials) {
      const stockCheck = await checkMaterialStock(
        material.materialId,
        material.materialType,
        material.requestedQuantity
      );
      
      updatedMaterials.push({
        ...material.toObject(),
        stockSufficient: stockCheck.available,
        stockAvailable: stockCheck.found,
        availableStock: stockCheck.availableStock,
        materialInfo: stockCheck.material
      });
    }

    const projectData = {
      ...project.toObject(),
      materials: updatedMaterials
    };

    res.json(projectData);
  } catch (err) {
    console.error('❌ Proje detay hatası:', err);
    res.status(500).json({ 
      success: false,
      error: 'Sunucu hatası', 
      details: err.message 
    });
  }
});

// POST: Yeni proje oluştur - ObjectId referansları ile
router.post('/', async (req, res) => {
  try {
    console.log('➕ Yeni proje oluşturuluyor:', req.body.name);
    
    // Materials array'indeki materialId'leri ObjectId'ye çevir
    if (req.body.materials && Array.isArray(req.body.materials)) {
      req.body.materials = req.body.materials.map(material => ({
        ...material,
        materialId: mongoose.Types.ObjectId.isValid(material.materialId) 
          ? new mongoose.Types.ObjectId(material.materialId)
          : material.materialId
      }));
    }
    
    const newProject = new Project(req.body);
    const savedProject = await newProject.save();

    await Log.create({
      bolum: 'Project',
      islem: 'ekle',
      dokumanId: savedProject._id,
      detay: { name: savedProject.name, status: savedProject.status }
    });

    socketManager.getIO().emit('log', {
      bolum: 'Project',
      islem: 'ekle',
      detay: savedProject
    });

    console.log('✅ Proje oluşturuldu:', savedProject._id);
    res.status(201).json(savedProject);

  } catch (err) {
    console.error('❌ Proje oluşturma hatası:', err);
    res.status(400).json({ 
      success: false,
      error: 'Proje oluşturulamadı', 
      details: err.message 
    });
  }
});

// PUT: Proje güncelle
router.put('/:id', async (req, res) => {
  try {
    console.log('✏️ Proje güncelleniyor:', req.params.id);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Proje bulunamadı' 
      });
    }

    // Malzemeler güncelleniyorsa doğrula ve istatistikleri yeniden hesapla
    if (req.body.materials) {
      const validatedMaterials = await validateProjectMaterials(req.body.materials);
      req.body.materials = validatedMaterials;
      
      // İstatistikleri güncelle
      const totalItems = validatedMaterials.length;
      const availableItems = validatedMaterials.filter(m => m.stockSufficient).length;
      const missingItems = totalItems - availableItems;
      const stockSufficiency = totalItems > 0 ? Math.round((availableItems / totalItems) * 100) : 100;
      const totalMaterialCost = validatedMaterials.reduce((sum, m) => sum + m.totalPrice, 0);
      
      req.body.totalItems = totalItems;
      req.body.availableItems = availableItems;
      req.body.missingItems = missingItems;
      req.body.stockSufficiency = stockSufficiency;
      req.body.totalMaterialCost = totalMaterialCost;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // Log kaydet
    await Log.create({
      bolum: 'Project',
      islem: 'güncelle',
      dokumanId: req.params.id,
      detay: { name: updatedProject.name }
    });

    res.json(updatedProject);

  } catch (err) {
    console.error('❌ Proje güncelleme hatası:', err);
    res.status(400).json({ 
      success: false,
      error: 'Güncelleme başarısız', 
      details: err.message 
    });
  }
});

// POST: Malzeme rezerve et - ObjectId ile
router.post('/:id/reserve', async (req, res) => {
  try {
    console.log('📦 Proje malzemeleri rezerve ediliyor:', req.params.id);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Proje bulunamadı' 
      });
    }

    if (project.status !== 'planning') {
      return res.status(400).json({ 
        success: false,
        error: 'Sadece planlama aşamasındaki projeler rezerve edilebilir' 
      });
    }

    // Tüm malzemelerin stok durumunu kontrol et
    let canReserveAll = true;
    const insufficientMaterials = [];

    for (const material of project.materials) {
      const stockCheck = await checkMaterialStock(
        material.materialId,
        material.materialType,
        material.requestedQuantity
      );
      
      if (!stockCheck.available) {
        canReserveAll = false;
        insufficientMaterials.push({
          materialId: material.materialId,
          materialType: material.materialType,
          requested: material.requestedQuantity,
          available: stockCheck.availableStock
        });
      }
    }

    if (!canReserveAll) {
      return res.status(400).json({ 
        success: false,
        error: 'Stok yetersizliği nedeniyle rezervasyon yapılamıyor',
        insufficientMaterials
      });
    }

    // Rezervasyonu gerçekleştir
    for (const material of project.materials) {
      await updateMaterialStock(
        material.materialId,
        material.materialType,
        material.requestedQuantity,
        'reserve'
      );
      
      // Proje materyalini güncelle
      material.reservedQuantity = material.requestedQuantity;
      material.reservationStatus = 'reserved';
    }

    // Proje durumunu güncelle
    project.status = 'reserved';
    project.reservedItems = project.materials.length;
    
    // Rezervasyon geçmişi ekle
    project.reservationHistory.push({
      action: 'reserved',
      date: new Date(),
      notes: `${project.materials.length} malzeme rezerve edildi`
    });

    await project.save();

    // Log kaydet
    await Log.create({
      bolum: 'Project',
      islem: 'rezerve',
      dokumanId: project._id,
      detay: { 
        name: project.name, 
        materialsCount: project.materials.length 
      }
    });

    res.json({
      success: true,
      data: project,
      message: 'Malzemeler başarıyla rezerve edildi'
    });

  } catch (err) {
    console.error('❌ Rezervasyon hatası:', err);
    res.status(500).json({ 
      success: false,
      error: 'Rezervasyon başarısız', 
      details: err.message 
    });
  }
});

// POST: Proje başlat
router.post('/:id/start', async (req, res) => {
  try {
    console.log('▶️ Proje başlatılıyor:', req.params.id);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    if (project.status !== 'reserved') {
      return res.status(400).json({ error: 'Sadece rezerve edilmiş projeler başlatılabilir' });
    }

    project.status = 'active';
    project.startDate = new Date();
    
    project.reservationHistory.push({
      action: 'started',
      date: new Date(),
      notes: 'Proje başlatıldı'
    });

    await project.save();

    await Log.create({
      bolum: 'Project',
      islem: 'başlat',
      dokumanId: project._id,
      detay: { name: project.name }
    });

    res.json(project);

  } catch (err) {
    console.error('❌ Proje başlatma hatası:', err);
    res.status(500).json({ error: 'Başlatma başarısız', details: err.message });
  }
});

// POST: Proje tamamla
router.post('/:id/complete', async (req, res) => {
  try {
    console.log('✅ Proje tamamlanıyor:', req.params.id);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    if (project.status !== 'active') {
      return res.status(400).json({ error: 'Sadece aktif projeler tamamlanabilir' });
    }

    // Malzemeleri stoktan düş
    for (const material of project.materials) {
      await updateMaterialStock(
        material.materialId,
        material.materialType,
        material.reservedQuantity,
        'consume'
      );
      
      // Proje materyalini güncelle
      material.usedQuantity = material.reservedQuantity;
      material.reservationStatus = 'consumed';
    }

    project.status = 'completed';
    project.endDate = new Date();
    
    project.reservationHistory.push({
      action: 'completed',
      date: new Date(),
      notes: 'Proje tamamlandı - malzemeler stoktan düşüldü'
    });

    await project.save();

    await Log.create({
      bolum: 'Project',
      islem: 'tamamla',
      dokumanId: project._id,
      detay: { name: project.name }
    });

    res.json(project);

  } catch (err) {
    console.error('❌ Proje tamamlama hatası:', err);
    res.status(500).json({ error: 'Tamamlama başarısız', details: err.message });
  }
});

// POST: Malzeme ekle - ObjectId ile
router.post('/:id/materials', async (req, res) => {
  try {
    const { materialId, materialType, requestedQuantity, notes } = req.body;
    
    // ObjectId kontrolü
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz malzeme ID'
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Proje bulunamadı'
      });
    }

    // Stok kontrolü
    const stockCheck = await checkMaterialStock(materialId, materialType, requestedQuantity);
    
    if (!stockCheck.found) {
      return res.status(404).json({
        success: false,
        error: 'Malzeme bulunamadı'
      });
    }

    // Malzeme ekle
    const newMaterial = {
      materialId: new mongoose.Types.ObjectId(materialId),
      materialType,
      requestedQuantity,
      reservedQuantity: 0,
      usedQuantity: 0,
      stockSufficient: stockCheck.available,
      stockAvailable: stockCheck.found,
      availableStock: stockCheck.availableStock,
      unitPrice: stockCheck.material?.unitPrice || 0,
      totalPrice: (stockCheck.material?.unitPrice || 0) * requestedQuantity,
      currency: 'TL',
      reservationStatus: 'planned',
      priority: 'medium',
      notes: notes || '',
      addedAt: new Date()
    };

    project.materials.push(newMaterial);
    
    // İstatistikleri yeniden hesapla
    const totalItems = project.materials.length;
    const availableItems = project.materials.filter(m => m.stockSufficient).length;
    const missingItems = totalItems - availableItems;
    const stockSufficiency = Math.round((availableItems / totalItems) * 100);
    const totalMaterialCost = project.materials.reduce((sum, m) => sum + m.totalPrice, 0);
    
    project.totalItems = totalItems;
    project.availableItems = availableItems;
    project.missingItems = missingItems;
    project.stockSufficiency = stockSufficiency;
    project.totalMaterialCost = totalMaterialCost;

    await project.save();

    res.json({
      success: true,
      data: project,
      message: 'Malzeme başarıyla eklendi'
    });

  } catch (err) {
    console.error('❌ Malzeme ekleme hatası:', err);
    res.status(500).json({
      success: false,
      error: 'Malzeme eklenemedi',
      details: err.message
    });
  }
});

// DELETE: Malzeme çıkar
router.delete('/:id/materials/:materialIndex', async (req, res) => {
  try {
    const { id, materialIndex } = req.params;
    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    if (materialIndex >= project.materials.length) {
      return res.status(400).json({ error: 'Geçersiz malzeme indexi' });
    }

    const material = project.materials[materialIndex];
    
    // Eğer rezerve edilmişse rezervasyonu iptal et
    if (material.reservationStatus === 'reserved') {
      await updateMaterialStock(
        material.materialId,
        material.materialType,
        material.reservedQuantity,
        'unreserve'
      );
    }

    // Malzemeyi çıkar
    project.materials.splice(materialIndex, 1);
    
    // İstatistikleri yeniden hesapla
    const totalItems = project.materials.length;
    const availableItems = project.materials.filter(m => m.stockSufficient).length;
    const missingItems = totalItems - availableItems;
    const stockSufficiency = totalItems > 0 ? Math.round((availableItems / totalItems) * 100) : 100;
    const totalMaterialCost = project.materials.reduce((sum, m) => sum + m.totalPrice, 0);
    
    project.totalItems = totalItems;
    project.availableItems = availableItems;
    project.missingItems = missingItems;
    project.stockSufficiency = stockSufficiency;
    project.totalMaterialCost = totalMaterialCost;

    await project.save();

    res.json({
      success: true,
      data: project,
      message: 'Malzeme başarıyla çıkarıldı'
    });

  } catch (err) {
    console.error('❌ Malzeme çıkarma hatası:', err);
    res.status(500).json({ error: 'Malzeme çıkarılamadı', details: err.message });
  }
});

// DELETE: Proje sil
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Proje bulunamadı' 
      });
    }

    // Aktif projeleri silmeyi engelle
    if (project.status === 'active') {
      return res.status(400).json({ 
        success: false,
        error: 'Aktif projeler silinemez' 
      });
    }

    // Rezerve edilmiş malzemelerin rezervasyonunu iptal et
    if (project.status === 'reserved') {
      for (const material of project.materials) {
        if (material.reservationStatus === 'reserved') {
          await updateMaterialStock(
            material.materialId,
            material.materialType,
            material.reservedQuantity,
            'unreserve'
          );
        }
      }
    }

    await Project.findByIdAndDelete(req.params.id);

    // Log kaydet
    await Log.create({
      bolum: 'Project',
      islem: 'sil',
      dokumanId: req.params.id,
      detay: { name: project.name }
    });

    res.json({ 
      success: true,
      message: 'Proje silindi', 
      id: req.params.id 
    });

  } catch (err) {
    console.error('❌ Proje silme hatası:', err);
    res.status(500).json({ 
      success: false,
      error: 'Silme başarısız', 
      details: err.message 
    });
  }
});

module.exports = router;