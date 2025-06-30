const express = require('express');
const router = express.Router();
const Sarf = require('../models/Sarf');
const Log = require('../models/Log');
const socketManager = require('../socket');

// Yardımcı fonksiyon: kaliteye göre malzeme türünü belirle
function belirleMalzemeTuru(kalite) {
  if (!kalite) return 'diğer';
  const k = kalite.toUpperCase();

  if (k.includes('316') || k.includes('304')) return 'paslanmaz';
  if (k.includes('EN-AW') || k.includes('6063') || k.includes('5754')) return 'aluminyum';
  if (k.includes('ST') || k.includes('S235')) return 'çelik';
  return 'diğer';
}

// GET: tüm sarflar
router.get('/', async (req, res) => {
  try {
    const sarfList = await Sarf.find().sort({ createdAt: -1 });
    console.log(`📤 ${sarfList.length} sarf malzemesi gönderildi`);
    res.json(sarfList);
  } catch (err) {
    console.error('❌ Sarf listesi hatası:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET: İstatistikler - ÖNCE STATISTICS, SONRA :ID!
router.get('/statistics', async (req, res) => {
  try {
    console.log('📊 İstatistikler hesaplanıyor...');
    const items = await Sarf.find();
    
    const stats = {
      totalItems: items.length,
      totalValue: items.reduce((sum, item) => {
        return sum + (item.satinAlisFiyati || 0) * (item.dovizKur || 1);
      }, 0),
      lowStock: items.filter(item => {
        const kalan = parseFloat(item.kalanMiktar || '0');
        const giris = parseFloat(item.girisMiktar || '0');
        return giris > 0 && (kalan / giris) < 0.2;
      }).length,
      recentlyAdded: items.filter(item => {
        const created = new Date(item.createdAt);
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        return created >= monthAgo;
      }).length,
      byType: {
        paslanmaz: items.filter(item => item.malzemeTuru === 'paslanmaz').length,
        aluminyum: items.filter(item => item.malzemeTuru === 'aluminyum').length,
        çelik: items.filter(item => item.malzemeTuru === 'çelik').length,
        diğer: items.filter(item => item.malzemeTuru === 'diğer').length
      },
      byCins: {
        PLAKA: items.filter(item => item.malzemeCinsi === 'PLAKA').length,
        PROFİL: items.filter(item => item.malzemeCinsi === 'PROFİL').length,
        BORU: items.filter(item => item.malzemeCinsi === 'BORU').length,
        DİĞER: items.filter(item => item.malzemeCinsi === 'DİĞER').length
      }
    };

    console.log('✅ İstatistikler hazırlandı:', stats);
    res.json(stats);
  } catch (err) {
    console.error('❌ İstatistik hatası:', err);
    res.status(500).json({ error: 'İstatistik hesaplanamadı', details: err.message });
  }
});

// GET: tek sarf - /:id STATISTICS'TEN SONRA!
router.get('/:id', async (req, res) => {
  try {
    const sarf = await Sarf.findById(req.params.id);
    if (!sarf) {
      return res.status(404).json({ message: 'Sarf malzemesi bulunamadı' });
    }
    console.log(`📤 Sarf detayı gönderildi: ${sarf._id}`);
    res.json(sarf);
  } catch (err) {
    console.error('❌ Sarf detay hatası:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST: yeni sarf ekle
router.post('/', async (req, res) => {
  try {
    console.log('➕ Yeni sarf ekleniyor:', req.body.malzeme);
    const malzemeTuru = belirleMalzemeTuru(req.body.kalite);

    const yeniSarf = new Sarf({
      ...req.body,
      malzemeTuru
    });

    const kayit = await yeniSarf.save();

    await Log.create({
      bolum: 'Sarf',
      islem: 'ekle',
      dokumanId: kayit._id,
      detay: kayit
    });

    socketManager.getIO().emit('log', {
      bolum: 'Sarf',
      islem: 'ekle',
      detay: kayit
    });

    console.log('✅ Sarf eklendi:', kayit._id);
    res.status(201).json(kayit);

  } catch (err) {
    console.error('❌ Sarf ekleme hatası:', err);
    res.status(400).json({
      error: 'Veri eklenemedi',
      details: err.message
    });
  }
});

// PUT: sarf güncelle - FRONTEND İÇİN EKLENDİ
router.put('/:id', async (req, res) => {
  try {
    console.log('✏️ Sarf güncelleniyor:', req.params.id);
    const malzemeTuru = belirleMalzemeTuru(req.body.kalite);
    
    const updatedData = {
      ...req.body,
      malzemeTuru,
      updatedAt: new Date()
    };

    const guncellenmisSarf = await Sarf.findByIdAndUpdate(
      req.params.id, 
      updatedData, 
      { new: true, runValidators: true }
    );

    if (!guncellenmisSarf) {
      return res.status(404).json({ error: 'Sarf malzemesi bulunamadı' });
    }

    await Log.create({
      bolum: 'Sarf',
      islem: 'güncelle',
      dokumanId: req.params.id,
      detay: guncellenmisSarf
    });

    socketManager.getIO().emit('log', {
      bolum: 'Sarf',
      islem: 'güncelle',
      detay: guncellenmisSarf
    });

    console.log('✅ Sarf güncellendi:', req.params.id);
    res.json(guncellenmisSarf);

  } catch (err) {
    console.error('❌ Sarf güncelleme hatası:', err);
    res.status(400).json({
      error: 'Güncelleme başarısız',
      details: err.message
    });
  }
});

// DELETE: sarf sil
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Sarf siliniyor:', req.params.id);
    const sonuc = await Sarf.findByIdAndDelete(req.params.id);
    if (!sonuc) {
      return res.status(404).json({ error: 'Bulunamadı' });
    }

    await Log.create({
      bolum: 'Sarf',
      islem: 'sil',
      dokumanId: req.params.id
    });

    socketManager.getIO().emit('log', {
      bolum: 'Sarf',
      islem: 'sil',
      detay: { id: req.params.id }
    });

    console.log('✅ Sarf silindi:', req.params.id);
    res.json({ message: 'Silindi', id: req.params.id });

  } catch (err) {
    console.error('❌ Sarf silme hatası:', err);
    res.status(500).json({ error: 'Silme hatası' });
  }
});

module.exports = router;