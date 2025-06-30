const Sarf = require("../models/Sarf");

exports.getAll = async (req, res) => {
  try {
    const items = await Sarf.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Veri alınamadı" });
  }
};

exports.create = async (req, res) => {
  try {
    const newItem = new Sarf(req.body);
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: "Kayıt başarısız", details: err });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Sarf.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Güncelleme başarısız", details: err });
  }
};

exports.delete = async (req, res) => {
  try {
    await Sarf.findByIdAndDelete(req.params.id);
    res.json({ message: "Silindi" });
  } catch (err) {
    res.status(500).json({ error: "Silme başarısız", details: err });
  }
};
