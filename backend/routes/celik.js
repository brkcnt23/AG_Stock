const express = require('express');
const celikRouter = express.Router();
const {
  getCelikItems,
  getCelikById,
  createCelik,
  updateCelik,
  deleteCelik,
  getCelikStats,
  bulkCelikOperations
} = require('../controllers/celikController');
const { validateObjectIdParam } = require('../utils/objectId');

// GET /api/celik/stats
celikRouter.get('/stats', getCelikStats);

// GET /api/celik
celikRouter.get('/', getCelikItems);

// GET /api/celik/:id
celikRouter.get('/:id', validateObjectIdParam('id'), getCelikById);

// POST /api/celik
celikRouter.post('/', createCelik);

// PUT /api/celik/:id
celikRouter.put('/:id', validateObjectIdParam('id'), updateCelik);

// DELETE /api/celik/:id
celikRouter.delete('/:id', validateObjectIdParam('id'), deleteCelik);

// POST /api/celik/bulk
celikRouter.post('/bulk', bulkCelikOperations);

module.exports = celikRouter;