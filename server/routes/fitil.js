const express = require('express');
const router = express.Router();
const Fitil = require('../models/Fitil');
const Log = require('../models/Log');
const socketManager = require('../socket');

// GET
router.get('/', async (req, res) => {
  try {
    const data = await Fitil.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// POST
router.post('/', async (req, res) => {
  try {
    const kayit = await new Fitil(req.body).save();
    await Log.create({ bolum: 'Fitil', islem: 'ekle', dokumanId: kayit._id, detay: kayit });
    socketManager.getIO().emit('log', { bolum: 'Fitil', islem: 'ekle', detay: kayit });
    res.status(201).json(kayit);
  } catch (err) {
    res.status(400).json({ error: 'Veri eklenemedi', details: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const sonuc = await Fitil.findByIdAndDelete(req.params.id);
    if (!sonuc) return res.status(404).json({ error: 'Bulunamadı' });
    await Log.create({ bolum: 'Fitil', islem: 'sil', dokumanId: req.params.id });
    socketManager.getIO().emit('log', { bolum: 'Fitil', islem: 'sil', detay: { id: req.params.id } });
    res.json({ message: 'Silindi', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
});

module.exports = router;
