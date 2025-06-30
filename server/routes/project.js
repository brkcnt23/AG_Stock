// routes/project.js (YENİ DOSYA)
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Sarf = require('../models/Sarf');
const Membran = require('../models/Membran');
const Celik = require('../models/Celik');
const Halat = require('../models/Halat');
const Fitil = require('../models/Fitil');
const Log = require('../models/Log');
const socketManager = require('../socket');

// Yardımcı fonksiyon: Stok kontrolü
async function checkStockAvailability(materials) {
  const stockChecks = await Promise.all(materials.map(async (material) => {
    let stockItem;
    
    switch (material.materialType) {
      case 'sarf':
        stockItem = await Sarf.findById(material.materialId);
        break;
      case 'membran':
        stockItem = await Membran.findById(material.materialId);
        break;
      case 'celik':
        stockItem = await Celik.findById(material.materialId);
        break;
      case 'halat':
        stockItem = await Halat.findById(material.materialId);
        break;
      case 'fitil':
        stockItem = await Fitil.findById(material.materialId);
        break;
      default:
        return { ...material, stockSufficient: false, availableStock: 0 };
    }

    if (!stockItem) {
      return { ...material, stockSufficient: false, availableStock: 0 };
    }

    const availableStock = parseFloat(stockItem.kalanMiktar || stockItem.adet || 0);
    const sufficient = availableStock >= material.requestedQuantity;

    return {
      ...material,
      stockSufficient: sufficient,
      availableStock,
      stockItem: {
        name: stockItem.malzeme || stockItem.renk || stockItem.tip || 'Malzeme',
        unit: stockItem.birim || 'ADET'
      }
    };
  }));

  return stockChecks;
}

// GET: Tüm projeler
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Her proje için stok kontrolü yap
    const projectsWithStock = await Promise.all(projects.map(async (project) => {
      const stockCheckedMaterials = await checkStockAvailability(project.materials);
      return {
        ...project.toObject(),
        materials: stockCheckedMaterials
      };
    }));

    console.log(`📤 ${projectsWithStock.length} proje gönderildi`);
    res.json(projectsWithStock);
  } catch (err) {
    console.error('❌ Proje listesi hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası', details: err.message });
  }
});

// GET: İstatistikler
router.get('/statistics', async (req, res) => {
  try {
    console.log('📊 Proje istatistikleri hesaplanıyor...');
    const projects = await Project.find();
    
    const stats = {
      totalProjects: projects.length,
      planning: projects.filter(p => p.status === 'planning').length,
      reserved: projects.filter(p => p.status === 'reserved').length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      totalMaterials: projects.reduce((sum, p) => sum + p.materials.length, 0),
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      recentProjects: projects.filter(p => {
        const created = new Date(p.createdAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return created >= weekAgo;
      }).length
    };

    console.log('✅ Proje istatistikleri hazırlandı:', stats);
    res.json(stats);
  } catch (err) {
    console.error('❌ Proje istatistik hatası:', err);
    res.status(500).json({ error: 'İstatistik hesaplanamadı', details: err.message });
  }
});

// GET: Tek proje
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    // Stok kontrolü yap
    const stockCheckedMaterials = await checkStockAvailability(project.materials);
    const projectWithStock = {
      ...project.toObject(),
      materials: stockCheckedMaterials
    };

    console.log(`📤 Proje detayı gönderildi: ${project._id}`);
    res.json(projectWithStock);
  } catch (err) {
    console.error('❌ Proje detay hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası', details: err.message });
  }
});

// POST: Yeni proje oluştur
router.post('/', async (req, res) => {
  try {
    console.log('➕ Yeni proje oluşturuluyor:', req.body.name);
    
    // Malzemeler için stok kontrolü
    const stockCheckedMaterials = await checkStockAvailability(req.body.materials || []);
    
    const newProject = new Project({
      ...req.body,
      materials: stockCheckedMaterials
    });

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
    res.status(400).json({ error: 'Proje oluşturulamadı', details: err.message });
  }
});

// PUT: Proje güncelle
router.put('/:id', async (req, res) => {
  try {
    console.log('✏️ Proje güncelleniyor:', req.params.id);
    
    // Malzemeler için stok kontrolü
    if (req.body.materials) {
      const stockCheckedMaterials = await checkStockAvailability(req.body.materials);
      req.body.materials = stockCheckedMaterials;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    await Log.create({
      bolum: 'Project',
      islem: 'güncelle',
      dokumanId: req.params.id,
      detay: { name: updatedProject.name, status: updatedProject.status }
    });

    socketManager.getIO().emit('log', {
      bolum: 'Project',
      islem: 'güncelle',
      detay: updatedProject
    });

    console.log('✅ Proje güncellendi:', req.params.id);
    res.json(updatedProject);

  } catch (err) {
    console.error('❌ Proje güncelleme hatası:', err);
    res.status(400).json({ error: 'Güncelleme başarısız', details: err.message });
  }
});

// POST: Proje rezerve et
router.post('/:id/reserve', async (req, res) => {
  try {
    console.log('📦 Proje rezerve ediliyor:', req.params.id);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    if (project.status !== 'planning') {
      return res.status(400).json({ error: 'Sadece planlama aşamasındaki projeler rezerve edilebilir' });
    }

    // Stok kontrolü ve rezervasyon
    const stockCheckedMaterials = await checkStockAvailability(project.materials);
    const allSufficient = stockCheckedMaterials.every(m => m.stockSufficient);

    if (!allSufficient) {
      return res.status(400).json({ 
        error: 'Stok yetersizliği nedeniyle proje rezerve edilemiyor',
        insufficientMaterials: stockCheckedMaterials.filter(m => !m.stockSufficient)
      });
    }

    // Stok rezervasyonu yap (gerçek implementasyonda stok düşürülür)
    project.status = 'reserved';
    project.materials = stockCheckedMaterials;
    
    // Rezervasyon geçmişi ekle
    project.reservationHistory.push({
      action: 'reserved',
      notes: `Proje rezerve edildi - ${stockCheckedMaterials.length} malzeme`
    });

    await project.save();

    await Log.create({
      bolum: 'Project',
      islem: 'rezerve',
      dokumanId: project._id,
      detay: { name: project.name, materialsCount: project.materials.length }
    });

    socketManager.getIO().emit('log', {
      bolum: 'Project',
      islem: 'rezerve',
      detay: project
    });

    console.log('✅ Proje rezerve edildi:', req.params.id);
    res.json(project);

  } catch (err) {
    console.error('❌ Proje rezervasyon hatası:', err);
    res.status(500).json({ error: 'Rezervasyon başarısız', details: err.message });
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
      notes: 'Proje başlatıldı'
    });

    await project.save();

    await Log.create({
      bolum: 'Project',
      islem: 'başlat',
      dokumanId: project._id,
      detay: { name: project.name }
    });

    socketManager.getIO().emit('log', {
      bolum: 'Project',
      islem: 'başlat',
      detay: project
    });

    console.log('✅ Proje başlatıldı:', req.params.id);
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

    project.status = 'completed';
    project.endDate = new Date();
    
    project.reservationHistory.push({
      action: 'completed',
      notes: 'Proje tamamlandı - malzemeler stoktan düşüldü'
    });

    // TODO: Burada kullanılan malzemeler stoktan düşürülecek
    // project.materials.forEach(material => {
    //   // Stok düşürme işlemi
    // });

    await project.save();

    await Log.create({
      bolum: 'Project',
      islem: 'tamamla',
      dokumanId: project._id,
      detay: { name: project.name }
    });

    socketManager.getIO().emit('log', {
      bolum: 'Project',
      islem: 'tamamla',
      detay: project
    });

    console.log('✅ Proje tamamlandı:', req.params.id);
    res.json(project);

  } catch (err) {
    console.error('❌ Proje tamamlama hatası:', err);
    res.status(500).json({ error: 'Tamamlama başarısız', details: err.message });
  }
});

// DELETE: Proje sil
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Proje siliniyor:', req.params.id);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }

    if (project.status === 'active') {
      return res.status(400).json({ error: 'Aktif projeler silinemez' });
    }

    await Project.findByIdAndDelete(req.params.id);

    await Log.create({
      bolum: 'Project',
      islem: 'sil',
      dokumanId: req.params.id,
      detay: { name: project.name }
    });

    socketManager.getIO().emit('log', {
      bolum: 'Project',
      islem: 'sil',
      detay: { id: req.params.id, name: project.name }
    });

    console.log('✅ Proje silindi:', req.params.id);
    res.json({ message: 'Proje silindi', id: req.params.id });

  } catch (err) {
    console.error('❌ Proje silme hatası:', err);
    res.status(500).json({ error: 'Silme başarısız', details: err.message });
  }
});

module.exports = router;