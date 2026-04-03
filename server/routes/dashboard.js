const router  = require('express').Router();
const verify  = require('../middleware/verifyToken');
const Task    = require('../models/Task');
const Note    = require('../models/Note');
const Resume  = require('../models/Resume');
const StudyPlan = require('../models/StudyPlan');
const Chat    = require('../models/Chat');
const InterviewSession = require('../models/InterviewSession');

// GET /api/dashboard/stats
router.get('/stats', verify, async (req, res) => {
  const { userId } = req.user;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  try {
    const [tasksDueToday, notesSaved, resumesCreated, studyPlansActive] = await Promise.all([
      Task.countDocuments({ userId, dueDate: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: 'Done' } }),
      Note.countDocuments({ userId }),
      Resume.countDocuments({ userId }),
      StudyPlan.countDocuments({ userId, isActive: true }),
    ]);

    // Recent activity: pull last 5 docs across collections
    const [recentTasks, recentNotes, recentResumes, recentPlans, recentChats, recentSessions] = await Promise.all([
      Task.find({ userId }).sort({ updatedAt: -1 }).limit(3).select('title updatedAt'),
      Note.find({ userId }).sort({ createdAt: -1 }).limit(2).select('title createdAt'),
      Resume.find({ userId }).sort({ updatedAt: -1 }).limit(1).select('versionName updatedAt'),
      StudyPlan.find({ userId }).sort({ createdAt: -1 }).limit(1).select('subject createdAt'),
      Chat.find({ userId }).sort({ updatedAt: -1 }).limit(1).select('title updatedAt'),
      InterviewSession.find({ userId }).sort({ createdAt: -1 }).limit(1).select('sessionName createdAt'),
    ]);

    const activity = [
      ...recentTasks.map(t => ({ type: 'task',      label: `Task: ${t.title}`,       date: t.updatedAt })),
      ...recentNotes.map(n => ({ type: 'note',      label: `Note: ${n.title}`,        date: n.createdAt })),
      ...recentResumes.map(r => ({ type: 'resume',  label: `Resume: ${r.versionName}`,date: r.updatedAt })),
      ...recentPlans.map(p => ({ type: 'plan',      label: `Study Plan: ${p.subject}`,date: p.createdAt })),
      ...recentChats.map(c => ({ type: 'chat',      label: `Chat: ${c.title}`,        date: c.updatedAt })),
      ...recentSessions.map(s => ({ type: 'interview', label: `Interview: ${s.sessionName}`, date: s.createdAt })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      success: true,
      data: { tasksDueToday, notesSaved, resumesCreated, studyPlansActive, recentActivity: activity },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats' });
  }
});

module.exports = router;
