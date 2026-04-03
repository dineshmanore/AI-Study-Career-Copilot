const router     = require('express').Router();
const verify     = require('../middleware/verifyToken');
const StudyPlan  = require('../models/StudyPlan');

// GET /api/study-plans
router.get('/', verify, async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch study plans' });
  }
});

// DELETE /api/study-plans/:id
router.delete('/:id', verify, async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Study plan deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete plan' });
  }
});

module.exports = router;
