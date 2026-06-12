const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const InsuranceAdmin = require('../models/InsuranceAdmin');
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

// GET /api/insurance - public
router.get('/', async (req, res) => {
  try {
    const admins = await InsuranceAdmin.find().sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/insurance - admin only
router.post('/', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, title, facebook, zalo, tradeTag } = req.body;
    let avatarUrl = null;
    let avatarPublicId = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'guild1882/insurance');
      avatarUrl = result.secure_url;
      avatarPublicId = result.public_id;
    }

    const admin = new InsuranceAdmin({
      name,
      title,
      facebook,
      zalo,
      tradeTag,
      avatarUrl,
      avatarPublicId
    });

    await admin.save();
    res.status(201).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/insurance/:id - admin only
router.put('/:id', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, title, facebook, zalo, tradeTag } = req.body;
    const admin = await InsuranceAdmin.findById(req.params.id);

    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    let avatarUrl = admin.avatarUrl;
    let avatarPublicId = admin.avatarPublicId;

    if (req.file) {
      // Delete old avatar
      if (admin.avatarPublicId) {
        await cloudinary.uploader.destroy(admin.avatarPublicId).catch(() => {});
      }
      const result = await uploadToCloudinary(req.file.buffer, 'guild1882/insurance');
      avatarUrl = result.secure_url;
      avatarPublicId = result.public_id;
    }

    admin.name = name || admin.name;
    admin.title = title || admin.title;
    admin.facebook = facebook || admin.facebook;
    admin.zalo = zalo || admin.zalo;
    admin.tradeTag = tradeTag || admin.tradeTag;
    admin.avatarUrl = avatarUrl;
    admin.avatarPublicId = avatarPublicId;

    await admin.save();
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/insurance/:id - admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    const admin = await InsuranceAdmin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    if (admin.avatarPublicId) {
      await cloudinary.uploader.destroy(admin.avatarPublicId).catch(() => {});
    }

    await InsuranceAdmin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
