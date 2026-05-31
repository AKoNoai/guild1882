const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const Score = require('../models/Score');
const auth = require('../middleware/auth');

// Multer memory storage (for Cloudinary upload via stream)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// GET /api/scores — public, sorted by score desc
router.get('/', async (req, res) => {
  try {
    const scores = await Score.find().sort({ score: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/scores — public, submit score with image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || score === undefined) {
      return res.status(400).json({ message: 'Name and score are required' });
    }

    let imageUrl = '';
    let imagePublicId = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'guild1882/avatars');
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const newScore = new Score({ name, score: Number(score), imageUrl, imagePublicId });
    await newScore.save();
    res.status(201).json(newScore);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/scores/:id — admin only
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, score } = req.body;
    const updated = await Score.findByIdAndUpdate(
      req.params.id,
      { name, score: Number(score) },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Score not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/scores/bulk — admin only (delete multiple)
router.delete('/bulk', auth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }
    // Delete Cloudinary images
    const scores = await Score.find({ _id: { $in: ids } });
    for (const s of scores) {
      if (s.imagePublicId) {
        await cloudinary.uploader.destroy(s.imagePublicId).catch(() => {});
      }
    }
    await Score.deleteMany({ _id: { $in: ids } });
    res.json({ message: `Deleted ${ids.length} records` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/scores/:id — admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ message: 'Score not found' });
    if (score.imagePublicId) {
      await cloudinary.uploader.destroy(score.imagePublicId).catch(() => {});
    }
    await Score.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
