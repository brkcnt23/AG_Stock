const express = require('express');
const halatRouter = express.Router();
const {
  getHalatItems,
  getHalatById,
  createHalat,
  updateHalat,
  deleteHalat,
  getHalatStats,
  bulkHalatOperations
} = require('../controllers/halatController');
const { validateObjectIdParam } = require('../utils/objectId');

// GET /api/halat/stats
halatRouter.get('/stats', getHalatStats);

// GET /api/halat
halatRouter.get('/', getHalatItems);

// GET /api/halat/:id
halatRouter.get('/:id', validateObjectIdParam('id'), getHalatById);

// POST /api/halat
halatRouter.post('/', createHalat);

// PUT /api/halat/:id
halatRouter.put('/:id', validateObjectIdParam('id'), updateHalat);

// DELETE /api/halat/:id
halatRouter.delete('/:id', validateObjectIdParam('id'), deleteHalat);

// POST /api/halat/bulk
halatRouter.post('/bulk', bulkHalatOperations);

module.exports = halatRouter;