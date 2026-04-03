const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  modelAnswer:  String,
  userAnswer:   { type: String, default: '' },
  score:        { type: Number, default: null },
  feedback:     { type: String, default: '' },
});

const interviewSessionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionName: { type: String, required: true },
  topic:       { type: String, required: true },
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  questions:   [questionSchema],
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
