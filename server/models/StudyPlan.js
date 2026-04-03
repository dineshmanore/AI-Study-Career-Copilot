const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject:        { type: String, required: true, maxlength: 200 },
  examDate:       { type: Date, required: true },
  dailyHours:     { type: Number, required: true, min: 1, max: 12 },
  knowledgeLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  generatedPlan:  { type: String, required: true },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
