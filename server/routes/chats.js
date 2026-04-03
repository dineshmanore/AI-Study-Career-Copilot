const router = require('express').Router();
const verify = require('../middleware/verifyToken');
const Chat   = require('../models/Chat');

// GET /api/chats  — last 5 for sidebar
router.get('/', verify, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 }).limit(5)
      .select('title updatedAt');
    res.json({ success: true, data: chats });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch chats' });
  }
});

// GET /api/chats/:id — full chat
router.get('/:id', verify, async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, data: chat });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch chat' });
  }
});

// DELETE /api/chats/:id
router.delete('/:id', verify, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ success: true, message: 'Chat deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete chat' });
  }
});

module.exports = router;
