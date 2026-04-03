const router = require('express').Router();
const verify = require('../middleware/verifyToken');
const InterviewSession = require('../models/InterviewSession');

// GET /api/interview-sessions
router.get('/', verify, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: sessions });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
});

// GET /api/interview-sessions/:id
router.get('/:id', verify, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch session' });
  }
});

// POST /api/interview-sessions
router.post('/', verify, async (req, res) => {
  try {
    const session = await InterviewSession.create({ ...req.body, userId: req.user.userId });
    res.status(201).json({ success: true, data: session });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to save session' });
  }
});

// PUT /api/interview-sessions/:id (update answers/scores)
router.put('/:id', verify, async (req, res) => {
  try {
    const session = await InterviewSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update session' });
  }
});

// DELETE /api/interview-sessions/:id
router.delete('/:id', verify, async (req, res) => {
  try {
    await InterviewSession.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ success: true, message: 'Session deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete session' });
  }
});

module.exports = router;
