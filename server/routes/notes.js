const router = require('express').Router();
const verify = require('../middleware/verifyToken');
const Note   = require('../models/Note');

// GET /api/notes
router.get('/', verify, async (req, res) => {
  try {
    const filter = { userId: req.user.userId };
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { summaryContent: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch notes' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', verify, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
});

module.exports = router;
