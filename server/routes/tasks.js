const router = require('express').Router();
const verify = require('../middleware/verifyToken');
const Task   = require('../models/Task');
const { body, validationResult } = require('express-validator');

// GET /api/tasks
router.get('/', verify, async (req, res) => {
  const filter = { userId: req.user.userId };
  if (req.query.status)   filter.status   = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  try {
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
router.post('/', verify, [
  body('title').trim().notEmpty().isLength({ max: 100 }),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('status').optional().isIn(['Todo', 'In Progress', 'Done']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
  try {
    const task = await Task.create({ ...req.body, userId: req.user.userId });
    res.status(201).json({ success: true, data: task });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', verify, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', verify, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

module.exports = router;
