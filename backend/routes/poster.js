const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const Poster = require('../models/Poster');
const auth = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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

// GET /api/poster — public
router.get('/', async (req, res) => {
  try {
    const poster = await Poster.findOne().sort({ createdAt: -1 });
    res.json(poster || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/poster — admin only
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file required' });

    // Delete old poster from Cloudinary
    const oldPoster = await Poster.findOne().sort({ createdAt: -1 });
    if (oldPoster && oldPoster.imagePublicId) {
      await cloudinary.uploader.destroy(oldPoster.imagePublicId).catch(() => {});
    }

    const result = await uploadToCloudinary(req.file.buffer, 'guild1882/posters');
    
    // Remove old poster doc and create new
    await Poster.deleteMany({});
    const poster = new Poster({ imageUrl: result.secure_url, imagePublicId: result.public_id });
    await poster.save();

    res.status(201).json(poster);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/poster — admin only
router.delete('/', auth, async (req, res) => {
  try {
    const poster = await Poster.findOne().sort({ createdAt: -1 });
    if (!poster) {
      return res.status(404).json({ message: 'No poster found' });
    }
    
    // Delete from Cloudinary
    if (poster.imagePublicId) {
      await cloudinary.uploader.destroy(poster.imagePublicId).catch(() => {});
    }
    
    await Poster.deleteMany({});
    res.json({ message: 'Poster deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
