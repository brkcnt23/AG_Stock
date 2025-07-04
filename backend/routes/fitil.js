// backend/routes/fitil.js - Fixed
const express = require('express');
const router = express.Router();
const {
  getFitils,
  getFitilById,
  createFitil,
  updateFitil,
  deleteFitil,
  getFitilStats
} = require('../controllers/fitilController');
const { validateObjectIdParam } = require('../utils/objectId');

// GET /api/fitil/stats
router.get('/stats', getFitilStats);

// GET /api/fitil
router.get('/', getFitils);

// GET /api/fitil/:id
router.get('/:id', validateObjectIdParam('id'), getFitilById);

// POST /api/fitil
router.post('/', createFitil);

// PUT /api/fitil/:id
router.put('/:id', validateObjectIdParam('id'), updateFitil);

// DELETE /api/fitil/:id
router.delete('/:id', validateObjectIdParam('id'), deleteFitil);

module.exports = router;