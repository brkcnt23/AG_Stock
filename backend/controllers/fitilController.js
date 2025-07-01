// backend/controllers/fitilController.js - Düzeltilmiş
const Fitil = require('../models/Fitil');
const { successResponse, errorResponse } = require('../utils/helpers');

const fitilController = {
  // Tüm fitilleri getir
  getFitils: async (req, res) => {
    try {
      const fitils = await Fitil.find().sort({ createdAt: -1 });
      console.log('📤 Fitiller gönderiliyor:', fitils.length);
      res.json(successResponse(fitils, 'Fitiller başarıyla getirildi'));
    } catch (error) {
      console.error('❌ Fitil listesi hatası:', error);
      res.status(500).json(errorResponse('Fitiller getirilemedi'));
    }
  },

  // Tek fitil getir
  getFitilById: async (req, res) => {
    try {
      const fitil = await Fitil.findById(req.params.id);
      if (!fitil) {
        return res.status(404).json(errorResponse('Fitil bulunamadı'));
      }
      res.json(successResponse(fitil, 'Fitil başarıyla getirildi'));
    } catch (error) {
      console.error('❌ Fitil getirme hatası:', error);
      res.status(500).json(errorResponse('Fitil getirilemedi'));
    }
  },

  // Yeni fitil oluştur
  createFitil: async (req, res) => {
    try {
      const newFitil = new Fitil({
        ...req.body,
        malzemeTuru: 'fitil' // Her zaman 'fitil' olarak ayarla
      });
      
      const savedFitil = await newFitil.save();
      console.log('✅ Yeni fitil oluşturuldu:', savedFitil._id);
      
      res.status(201).json(successResponse(
        savedFitil,
        'Fitil başarıyla oluşturuldu'
      ));
    } catch (error) {
      console.error('❌ Fitil oluşturma hatası:', error);
      res.status(400).json(errorResponse('Fitil oluşturulamadı'));
    }
  },

  // Fitil güncelle
  updateFitil: async (req, res) => {
    try {
      const updatedFitil = await Fitil.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!updatedFitil) {
        return res.status(404).json(errorResponse('Fitil bulunamadı'));
      }

      console.log('✅ Fitil güncellendi:', req.params.id);
      res.json(successResponse(updatedFitil, 'Fitil başarıyla güncellendi'));
    } catch (error) {
      console.error('❌ Fitil güncelleme hatası:', error);
      res.status(400).json(errorResponse('Fitil güncellenemedi'));
    }
  },

  // Fitil sil
  deleteFitil: async (req, res) => {
    try {
      const deletedFitil = await Fitil.findByIdAndDelete(req.params.id);
      
      if (!deletedFitil) {
        return res.status(404).json(errorResponse('Fitil bulunamadı'));
      }

      console.log('✅ Fitil silindi:', req.params.id);
      res.json(successResponse(null, 'Fitil başarıyla silindi'));
    } catch (error) {
      console.error('❌ Fitil silme hatası:', error);
      res.status(500).json(errorResponse('Fitil silinemedi'));
    }
  }
};

module.exports = { fitilController };