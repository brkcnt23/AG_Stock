// backend/routes/sarf.js - Standardize edilmiş
const express = require('express');
const sarfRouter = express.Router();
const {
  getSarfItems,
  getSarfById,
  createSarf,
  updateSarf,
  deleteSarf,
  getSarfStats,
  bulkSarfOperations,
  // Legacy methods
  getAll,
  create,
  update,
  delete: deleteItem
} = require('../controllers/sarfController');
const { validateObjectIdParam } = require('../utils/objectId');

// Yeni standardize edilmiş routes
// GET /api/sarf/stats
sarfRouter.get('/stats', getSarfStats);

// GET /api/sarf
sarfRouter.get('/', getSarfItems);

// GET /api/sarf/:id
sarfRouter.get('/:id', validateObjectIdParam('id'), getSarfById);

// POST /api/sarf
sarfRouter.post('/', createSarf);

// PUT /api/sarf/:id
sarfRouter.put('/:id', validateObjectIdParam('id'), updateSarf);

// DELETE /api/sarf/:id
sarfRouter.delete('/:id', validateObjectIdParam('id'), deleteSarf);

// POST /api/sarf/bulk
sarfRouter.post('/bulk', bulkSarfOperations);

// Legacy routes (geriye uyumluluk için)
sarfRouter.get('/legacy/all', getAll);
sarfRouter.post('/legacy/create', create);
sarfRouter.put('/legacy/:id', validateObjectIdParam('id'), update);
sarfRouter.delete('/legacy/:id', validateObjectIdParam('id'), deleteItem);

module.exports = sarfRouter;