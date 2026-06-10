const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Setting = require('../models/Setting');

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ token, message: 'Login successful' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

// PUT /api/admin/submissions-status - admin only
router.put('/submissions-status', auth, async (req, res) => {
  try {
    const { open } = req.body;
    if (open === undefined) {
      return res.status(400).json({ message: 'Missing open value' });
    }
    const updated = await Setting.findOneAndUpdate(
      { key: 'submissions_open' },
      { value: !!open },
      { new: true, upsert: true }
    );
    res.json({ open: updated.value, message: `submissions status updated to ${updated.value}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
