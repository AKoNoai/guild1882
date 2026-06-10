const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');

// GET /api/profile - public
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({ sections: [] });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/profile - admin: update entire profile
router.put('/', auth, async (req, res) => {
  try {
    const { sections } = req.body;
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile({ sections: sections || [] });
    } else {
      profile.sections = sections || [];
    }
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/profile/section - admin: add a section
router.post('/section', auth, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Tiêu đề không được để trống' });

    let profile = await Profile.findOne();
    if (!profile) profile = new Profile({ sections: [] });

    profile.sections.push({ title, items: [] });
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/profile/section/:sectionId - admin: update section title
router.put('/section/:sectionId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: 'Profile chưa tồn tại' });

    const section = profile.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: 'Không tìm thấy section' });

    if (req.body.title) section.title = req.body.title;
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/profile/section/:sectionId - admin: delete section
router.delete('/section/:sectionId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: 'Profile chưa tồn tại' });

    profile.sections = profile.sections.filter(s => s._id.toString() !== req.params.sectionId);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/profile/section/:sectionId/item - admin: add item to section
router.post('/section/:sectionId/item', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: 'Profile chưa tồn tại' });

    const section = profile.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: 'Không tìm thấy section' });

    const { label, buttonText, buttonUrl, buttonColor, buttonIcon } = req.body;
    if (!label || !buttonText) return res.status(400).json({ message: 'Label và Button Text là bắt buộc' });

    section.items.push({ label, buttonText, buttonUrl: buttonUrl || '', buttonColor: buttonColor || 'blue', buttonIcon: buttonIcon || '' });
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/profile/section/:sectionId/item/:itemId - admin: update item
router.put('/section/:sectionId/item/:itemId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: 'Profile chưa tồn tại' });

    const section = profile.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: 'Không tìm thấy section' });

    const item = section.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy item' });

    const { label, buttonText, buttonUrl, buttonColor, buttonIcon } = req.body;
    if (label !== undefined) item.label = label;
    if (buttonText !== undefined) item.buttonText = buttonText;
    if (buttonUrl !== undefined) item.buttonUrl = buttonUrl;
    if (buttonColor !== undefined) item.buttonColor = buttonColor;
    if (buttonIcon !== undefined) item.buttonIcon = buttonIcon;

    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/profile/section/:sectionId/item/:itemId - admin: delete item
router.delete('/section/:sectionId/item/:itemId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: 'Profile chưa tồn tại' });

    const section = profile.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: 'Không tìm thấy section' });

    section.items = section.items.filter(i => i._id.toString() !== req.params.itemId);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
