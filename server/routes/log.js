const express = require('express');
const router = express.Router();
const Log = require('../models/Log');

// GET /api/log -> Tüm logları getir
router.get('/', async (req, res) => {
  try {
    const loglar = await Log.find().sort({ createdAt: -1 }).limit(100); // son 100 işlem
    res.json(loglar);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// İstersen tek bir logu getirmek için (opsiyonel)
router.get('/:id', async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log bulunamadı' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
