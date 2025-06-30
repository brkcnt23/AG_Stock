const express = require('express');
const router = express.Router();
const Halat = require('../models/Halat');
const Log = require('../models/Log');
const socketManager = require('../socket');

router.get('/', async (req, res) => {
  try {
    const veriler = await Halat.find().sort({ createdAt: -1 });
    res.json(veriler);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.post('/', async (req, res) => {
  try {
    const kayit = await new Halat(req.body).save();
    const io = socketManager.getIO();
    await Log.create({ bolum: 'Halat', islem: 'ekle', dokumanId: kayit._id, detay: kayit });
    io.emit('log', { bolum: 'Halat', islem: 'ekle', detay: kayit });
    res.status(201).json(kayit);
  } catch (err) {
    res.status(400).json({ error: 'Veri eklenemedi', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const sonuc = await Halat.findByIdAndDelete(req.params.id);
    if (!sonuc) return res.status(404).json({ error: 'Bulunamadı' });
    const io = socketManager.getIO();
    await Log.create({ bolum: 'Halat', islem: 'sil', dokumanId: req.params.id });
    io.emit('log', { bolum: 'Halat', islem: 'sil', detay: { id: req.params.id } });
    res.json({ message: 'Silindi', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
});

module.exports = router;