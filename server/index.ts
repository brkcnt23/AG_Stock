const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./db');


dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

// Basit kontrol route'u
app.get('/', (req, res) => {
  res.send('API çalışıyor 🚀')
})

app.listen(PORT, () => {
  connectDB()
  console.log(`🚀 Server ${PORT} portunda çalışıyor`)
})
