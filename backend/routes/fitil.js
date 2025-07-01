// backend/routes/fitil.js
const express = require('express');
const router = express.Router();
const { fitilController } = require('../controllers/fitilController');

// GET tüm fitilleri getir
router.get('/', fitilController.getFitils);

// GET tek fitil getir
router.get('/:id', fitilController.getFitilById);

// POST yeni fitil ekle
router.post('/', fitilController.createFitil);

// PUT fitil güncelle
router.put('/:id', fitilController.updateFitil);

// DELETE fitil sil
router.delete('/:id', fitilController.deleteFitil);

module.exports = router;