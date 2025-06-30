// backend/routes/fitil.js
const express = require('express');
const fitilRouter = express.Router();
const {
  getFitilItems,
  getFitilById,
  createFitil,
  updateFitil,
  deleteFitil,
  getFitilStats,
  bulkFitilOperations
} = require('../controllers/fitilController');
const { validateObjectIdParam } = require('../utils/objectId');

// GET /api/fitil/stats
fitilRouter.get('/stats', getFitilStats);

// GET /api/fitil
fitilRouter.get('/', getFitilItems);

// GET /api/fitil/:id
fitilRouter.get('/:id', validateObjectIdParam('id'), getFitilById);

// POST /api/fitil
fitilRouter.post('/', createFitil);

// PUT /api/fitil/:id
fitilRouter.put('/:id', validateObjectIdParam('id'), updateFitil);

// DELETE /api/fitil/:id
fitilRouter.delete('/:id', validateObjectIdParam('id'), deleteFitil);

// POST /api/fitil/bulk
fitilRouter.post('/bulk', bulkFitilOperations);

module.exports = fitilRouter;