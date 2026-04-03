const router = require('express').Router();
const verify = require('../middleware/verifyToken');
const Resume = require('../models/Resume');

// GET /api/resumes
router.get('/', verify, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: resumes });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch resumes' });
  }
});

// POST /api/resumes
router.post('/', verify, async (req, res) => {
  try {
    const count = await Resume.countDocuments({ userId: req.user.userId });
    if (count >= 3) return res.status(400).json({ success: false, message: 'Maximum 3 resumes allowed' });
    const resume = await Resume.create({ ...req.body, userId: req.user.userId });
    res.status(201).json({ success: true, data: resume });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create resume' });
  }
});

// PUT /api/resumes/:id
router.put('/:id', verify, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, data: resume });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update resume' });
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', verify, async (req, res) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ success: true, message: 'Resume deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
});

module.exports = router;
