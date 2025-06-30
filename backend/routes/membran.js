// backend/routes/membran.js
const express = require('express');
const membranRouter = express.Router();
const {
  getMembranItems,
  getMembranById,
  createMembran,
  updateMembran,
  deleteMembran,
  getMembranStats,
  bulkMembranOperations
} = require('../controllers/membranController');
const { validateObjectIdParam } = require('../utils/objectId');

// GET /api/membran/stats
membranRouter.get('/stats', getMembranStats);

// GET /api/membran
membranRouter.get('/', getMembranItems);

// GET /api/membran/:id
membranRouter.get('/:id', validateObjectIdParam('id'), getMembranById);

// POST /api/membran
membranRouter.post('/', createMembran);

// PUT /api/membran/:id
membranRouter.put('/:id', validateObjectIdParam('id'), updateMembran);

// DELETE /api/membran/:id
membranRouter.delete('/:id', validateObjectIdParam('id'), deleteMembran);

// POST /api/membran/bulk
membranRouter.post('/bulk', bulkMembranOperations);

module.exports = membranRouter;