const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setCookie = (res, token) =>
  res.cookie('token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least 1 uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least 1 number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user._id);
    setCookie(res, token);

    res.status(201).json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, avatarInitial: user.avatarInitial },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Invalid input' });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = signToken(user._id);
    setCookie(res, token);

    res.json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, avatarInitial: user.avatarInitial },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'none', secure: true });
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, avatarInitial: user.avatarInitial, createdAt: user.createdAt },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// PUT /api/auth/profile  ←── NEW: Edit Profile
router.put('/profile', verifyToken, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('currentPassword').optional().notEmpty(),
  body('newPassword').optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least 1 uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least 1 number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  try {
    const user = await User.findById(req.user.userId).select('+passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, email, currentPassword, newPassword } = req.body;

    // Update name
    if (name) user.name = name;

    // Update email (check uniqueness)
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ success: false, message: 'Email already in use' });
      user.email = email;
    }

    // Update password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
      }
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) return res.status(401).json({ success: false, message: 'Incorrect current password' });
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { _id: user._id, name: user.name, email: user.email, avatarInitial: user.avatarInitial },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profile update failed: ' + err.message });
  }
});

module.exports = router;
