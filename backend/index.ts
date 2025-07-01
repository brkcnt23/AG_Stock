const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./db');

// Routes
const projectRoutes = require('./routes/project');
const celikRoutes = require('./routes/celik');
const halatRoutes = require('./routes/halat');
const fitilRoutes = require('./routes/fitil');
const membranRoutes = require('./routes/membran');
const sarfRoutes = require('./routes/sarf');
const logRoutes = require('./routes/log');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/celik', celikRoutes);
app.use('/api/halat', halatRoutes);
app.use('/api/fitil', fitilRoutes);
app.use('/api/membran', membranRoutes);
app.use('/api/sarf', sarfRoutes);
app.use('/api/logs', logRoutes);

// Base route
import { Request, Response } from 'express';

app.get('/', (req: Request, res: Response) => {
  res.send('API çalışıyor 🚀');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});

module.exports = app;